import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await sql`
      SELECT o.*, 
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', oi.id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'name', p.name,
          'image_url', p.image_url
        )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${session.user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return Response.json(orders);
  } catch (err) {
    console.error("GET orders error:", err);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, total_amount } = await request.json();

    // In a real app, you'd verify the price from the DB here
    // and potentially wait for Stripe webhook confirmation
    // For this example, we'll create the order directly (simulating successful payment)

    const [order] = await sql`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (${session.user.id}, ${total_amount}, 'pending')
      RETURNING *
    `;

    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${order.id}, ${item.id}, ${item.quantity}, ${item.price})
      `;

      // Update stock
      await sql`
        UPDATE products 
        SET stock = stock - ${item.quantity} 
        WHERE id = ${item.id}
      `;
    }

    return Response.json(order);
  } catch (err) {
    console.error("POST order error:", err);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
