import sql from "@/app/api/utils/sql";
import { getFirebaseUser } from "@/app/api/utils/verifyFirebaseToken";

/**
 * Helper: resolve a Firebase UID or email to the integer DB user id.
 * Returns the full db user row, or null if not found.
 */
async function getDbUser(firebaseUser) {
  const [dbUser] = await sql`
    SELECT id, email, name, role FROM auth_users WHERE email = ${firebaseUser.email} LIMIT 1
  `;
  return dbUser || null;
}

export async function GET(request) {
  try {
    const firebaseUser = await getFirebaseUser(request);
    if (!firebaseUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(firebaseUser);
    if (!dbUser) {
      return Response.json({ error: "User not found in database" }, { status: 404 });
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
        ) ORDER BY oi.id) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${dbUser.id}
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
    const firebaseUser = await getFirebaseUser(request);
    if (!firebaseUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(firebaseUser);
    if (!dbUser) {
      return Response.json({ error: "User not found in database" }, { status: 404 });
    }

    const { items, total_amount } = await request.json();

    if (!items || items.length === 0) {
      return Response.json({ error: "No items provided" }, { status: 400 });
    }

    // Validate stock availability before creating order
    for (const item of items) {
      const [product] = await sql`
        SELECT id, stock FROM products WHERE id = ${item.id}
      `;
      if (!product) {
        return Response.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for product ${item.id}. Available: ${product.stock}` },
          { status: 400 }
        );
      }
    }

    const [order] = await sql`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (${dbUser.id}, ${total_amount}, 'pending')
      RETURNING *
    `;

    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${order.id}, ${item.id}, ${item.quantity}, ${item.price})
      `;

      // Decrement stock (validated above, so this is safe)
      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.id} AND stock >= ${item.quantity}
      `;
    }

    return Response.json(order);
  } catch (err) {
    console.error("POST order error:", err);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
