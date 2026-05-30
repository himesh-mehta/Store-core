import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [product] = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (!product)
      return Response.json({ error: "Product not found" }, { status: 404 });
    return Response.json(product);
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [user] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (user?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = params;
    const body = await request.json();
    const fields = Object.keys(body);
    if (fields.length === 0)
      return Response.json({ error: "No fields to update" }, { status: 400 });

    const sets = fields.map((f, i) => `"${f}" = $${i + 1}`).join(", ");
    const values = fields.map((f) => body[f]);
    values.push(id);

    const [updatedProduct] = await sql(
      `UPDATE products SET ${sets} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return Response.json(updatedProduct);
  } catch (err) {
    console.error("PATCH product error:", err);
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [user] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (user?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = params;
    await sql`DELETE FROM products WHERE id = ${id}`;
    return Response.json({ message: "Product deleted" });
  } catch (err) {
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
