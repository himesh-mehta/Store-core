import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { productId } = params;
    const reviews = await sql`
      SELECT r.*, au.email as user_email
      FROM reviews r
      JOIN auth_users au ON r.user_id = au.id::text
      WHERE r.product_id = ${productId}
      ORDER BY r.created_at DESC
    `;
    return Response.json(reviews);
  } catch (err) {
    console.error("GET reviews error:", err);
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = params;
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5)
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );

    const [existing] = await sql`
      SELECT id FROM reviews WHERE product_id = ${productId} AND user_id = ${session.user.id}
    `;

    let review;
    if (existing) {
      [review] = await sql`
        UPDATE reviews
        SET rating = ${rating}, comment = ${comment || ""}, created_at = NOW()
        WHERE product_id = ${productId} AND user_id = ${session.user.id}
        RETURNING *
      `;
    } else {
      [review] = await sql`
        INSERT INTO reviews (product_id, user_id, user_email, rating, comment)
        VALUES (${productId}, ${session.user.id}, ${session.user.email}, ${rating}, ${comment || ""})
        RETURNING *
      `;
    }

    // Recalculate and update the product's average rating
    const [{ avg }] = await sql`
      SELECT ROUND(AVG(rating)::numeric, 1) AS avg FROM reviews WHERE product_id = ${productId}
    `;
    await sql`UPDATE products SET rating = ${avg} WHERE id = ${productId}`;

    return Response.json(review);
  } catch (err) {
    console.error("POST review error:", err);
    return Response.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = params;
    await sql`
      DELETE FROM reviews WHERE product_id = ${productId} AND user_id = ${session.user.id}
    `;

    const rows =
      await sql`SELECT rating FROM reviews WHERE product_id = ${productId}`;
    const avg =
      rows.length > 0
        ? rows.reduce((s, r) => s + r.rating, 0) / rows.length
        : 0;
    await sql`UPDATE products SET rating = ${avg.toFixed(1)} WHERE id = ${productId}`;

    return Response.json({ message: "Review deleted" });
  } catch (err) {
    console.error("DELETE review error:", err);
    return Response.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
