import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    let query = "SELECT * FROM products WHERE 1=1";
    const values = [];

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    if (minPrice) {
      values.push(minPrice);
      query += ` AND price >= $${values.length}`;
    }

    if (maxPrice) {
      values.push(maxPrice);
      query += ` AND price <= $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (name ILIKE $${values.length} OR description ILIKE $${values.length})`;
    }

    query += " ORDER BY created_at DESC";

    const products = await sql(query, values);
    return Response.json(products);
  } catch (err) {
    console.error("GET products error:", err);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const [user] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, price, category, image_url, stock } =
      await request.json();

    const [newProduct] = await sql`
      INSERT INTO products (name, description, price, category, image_url, stock)
      VALUES (${name}, ${description}, ${price}, ${category}, ${image_url}, ${stock})
      RETURNING *
    `;

    return Response.json(newProduct);
  } catch (err) {
    console.error("POST products error:", err);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
