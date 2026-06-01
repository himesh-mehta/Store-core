import sql from "@/app/api/utils/sql";
import { getFirebaseUser } from "@/app/api/utils/verifyFirebaseToken";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Helper: resolve the DB integer user id from a verified Firebase user.
 */
async function getDbUser(firebaseUser) {
  const [dbUser] = await sql`
    SELECT id, email, name, role FROM auth_users WHERE email = ${firebaseUser.email} LIMIT 1
  `;
  return dbUser || null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, redirectURL } = body;

    // --- Auth: verify Firebase token from Authorization header ---
    const firebaseUser = await getFirebaseUser(request);
    if (!firebaseUser) {
      return Response.json({ error: "Unauthorized: Please sign in to checkout" }, { status: 401 });
    }

    // Resolve to the DB integer user id (used in orders table)
    const dbUser = await getDbUser(firebaseUser);
    if (!dbUser) {
      // Auto-sync user if not yet in DB (handles edge case of first visit checkout)
      const [newDbUser] = await sql`
        INSERT INTO auth_users (name, email, image, role)
        VALUES (${firebaseUser.name || firebaseUser.email.split("@")[0]}, ${firebaseUser.email}, ${firebaseUser.picture || ""}, 'user')
        ON CONFLICT (email)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING *
      `;
      if (!newDbUser) {
        return Response.json({ error: "Failed to sync user" }, { status: 500 });
      }
    }

    const resolvedUser = dbUser || (await getDbUser(firebaseUser));

    if (!items || items.length === 0) {
      return Response.json({ error: "No items in cart" }, { status: 400 });
    }

    // --- Validate items and prices against the DB to prevent tampering ---
    const productIds = items.map((i) => i.id);
    const dbProducts = await sql`
      SELECT id, name, price, stock, image_url FROM products WHERE id = ANY(${productIds})
    `;
    const productMap = Object.fromEntries(dbProducts.map((p) => [String(p.id), p]));

    for (const item of items) {
      const product = productMap[String(item.id)];
      if (!product) {
        return Response.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return Response.json(
          { error: `"${product.name}" only has ${product.stock} in stock` },
          { status: 400 }
        );
      }
    }

    // --- Build Stripe line items using DB prices (not client-sent prices) ---
    const GST_RATE = 0.18; // 18% GST (standard Indian rate)

    const lineItems = dbProducts.map((product) => {
      const cartItem = items.find((i) => String(i.id) === String(product.id));
      const priceWithGst = Math.round(Number(product.price) * (1 + GST_RATE) * 100); // paise
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: product.image_url ? [product.image_url] : [],
          },
          unit_amount: priceWithGst,
        },
        quantity: cartItem.quantity,
      };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${redirectURL}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectURL}/cart`,
      customer_email: firebaseUser.email,
      metadata: {
        userId: String(resolvedUser.id),
        items: JSON.stringify(
          items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            // Store DB price for webhook to use
            price: productMap[String(i.id)]?.price ?? i.price,
          }))
        ),
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
