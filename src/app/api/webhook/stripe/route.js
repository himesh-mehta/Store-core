import Stripe from "stripe";
import sql from "@/app/api/utils/sql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe Webhook Handler
 *
 * Listens for `checkout.session.completed` events and:
 *  1. Verifies the Stripe signature to ensure the request is genuine
 *  2. Creates an order record in the `orders` table
 *  3. Creates order_item records for each purchased product
 *  4. Decrements product stock
 *
 * Setup on Stripe Dashboard:
 *  - Go to Developers → Webhooks → Add endpoint
 *  - URL: https://your-app.vercel.app/api/webhook/stripe
 *  - Events: checkout.session.completed
 *  - Copy the signing secret to STRIPE_WEBHOOK_SECRET env var
 */
export async function POST(request) {
  let event;

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify the webhook signature to ensure the request is from Stripe
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      console.error("Error processing checkout.session.completed:", err);
      // Return 500 so Stripe retries the webhook
      return Response.json({ error: "Order creation failed" }, { status: 500 });
    }
  }

  // Return 200 for all other events so Stripe doesn't retry them
  return Response.json({ received: true });
}

async function handleCheckoutCompleted(session) {
  const { userId, items: itemsJson } = session.metadata || {};

  if (!userId || !itemsJson) {
    console.warn("Missing metadata in session:", session.id);
    return;
  }

  let items;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    console.error("Failed to parse items metadata:", itemsJson);
    return;
  }

  // Convert Stripe amount_total (paise) back to rupees
  const totalAmount = session.amount_total / 100;

  // Check if an order already exists for this session (idempotency guard)
  const [existingOrder] = await sql`
    SELECT id FROM orders WHERE stripe_session_id = ${session.id} LIMIT 1
  `;
  if (existingOrder) {
    console.log("Order already exists for session:", session.id, "— skipping");
    return;
  }

  // Create the order record
  const [order] = await sql`
    INSERT INTO orders (user_id, total_amount, status, stripe_session_id)
    VALUES (${userId}, ${totalAmount}, 'paid', ${session.id})
    RETURNING *
  `;

  // Create order items and update stock
  for (const item of items) {
    // Fetch verified price from DB
    const [product] = await sql`SELECT price FROM products WHERE id = ${item.id}`;
    const verifiedPrice = product?.price ?? item.price;

    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (${order.id}, ${item.id}, ${item.quantity}, ${verifiedPrice})
    `;

    // Decrement stock atomically (only if enough stock remains)
    const result = await sql`
      UPDATE products
      SET stock = stock - ${item.quantity}
      WHERE id = ${item.id} AND stock >= ${item.quantity}
      RETURNING id
    `;

    if (result.length === 0) {
      console.warn(`Stock update skipped for product ${item.id} — insufficient stock`);
    }
  }

  console.log(`✅ Order ${order.id} created for Stripe session ${session.id}`);
}
