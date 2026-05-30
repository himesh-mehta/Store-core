import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key");

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, redirectURL, userId, userEmail } = body;

    let finalUserId = userId;
    let finalUserEmail = userEmail;

    if (!finalUserId || !finalUserEmail) {
      try {
        const session = await auth();
        if (session?.user) {
          finalUserId = session.user.id;
          finalUserEmail = session.user.email;
        }
      } catch (err) {
        // Safe to ignore in custom Firebase auth flow
      }
    }

    if (!finalUserId || !finalUserEmail) {
      return Response.json({ error: "Unauthorized: User session missing" }, { status: 401 });
    }

    if (!items || items.length === 0) {
      return Response.json({ error: "No items in cart" }, { status: 400 });
    }

    // Map items to Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          description: item.description,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${redirectURL}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectURL}/cart`,
      customer_email: finalUserEmail,
      metadata: {
        userId: String(finalUserId),
        items: JSON.stringify(
          items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
        ),
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
