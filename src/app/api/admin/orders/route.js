import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await sql`
      SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at,
        u.email as user_email,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', oi.id,
              'name', p.name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN auth_users u ON o.user_id = u.id::text
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.email
      ORDER BY o.created_at DESC
    `;

    return Response.json(orders);
  } catch (err) {
    console.error("Admin orders GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await request.json();

    const [updatedOrder] = await sql`
      UPDATE orders 
      SET status = ${status} 
      WHERE id = ${id} 
      RETURNING *
    `;

    return Response.json(updatedOrder);
  } catch (err) {
    console.error("Admin orders PATCH error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
