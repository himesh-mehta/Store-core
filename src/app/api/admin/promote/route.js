import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Update the user's role to 'admin'
    await sql`
      UPDATE auth_users 
      SET role = 'admin' 
      WHERE id = ${userId}
    `;

    return Response.json({ message: "Successfully promoted to admin" });
  } catch (err) {
    console.error("Admin promotion error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
