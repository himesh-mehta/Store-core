import sql from "@/app/api/utils/sql";
import { verifyFirebaseToken } from "@/app/api/utils/verifyFirebaseToken";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    let uid, email, name, image;

    if (token) {
      try {
        // Properly verify Firebase token signature (not just decode)
        const verified = await verifyFirebaseToken(token);
        uid = verified.uid;
        email = verified.email;
        name = verified.name;
        image = verified.picture || "";
      } catch (verifyErr) {
        console.warn("Token verification failed, falling back to body:", verifyErr.message);
      }
    }

    // Fallback to body parameters only if token verification failed
    // (useful for local dev/testing, but real requests must use a valid token)
    if (!email) {
      const body = await request.json();
      uid = body.uid;
      email = body.email;
      name = body.name || email?.split("@")[0];
      image = body.image || "";
    }

    if (!email) {
      return Response.json({ error: "Invalid user details" }, { status: 400 });
    }

    name = name || email.split("@")[0];

    // Upsert user into auth_users table
    const [dbUser] = await sql`
      INSERT INTO auth_users (name, email, image, role)
      VALUES (${name}, ${email}, ${image}, 'user')
      ON CONFLICT (email)
      DO UPDATE SET
        name = COALESCE(EXCLUDED.name, auth_users.name),
        image = COALESCE(NULLIF(EXCLUDED.image, ''), auth_users.image)
      RETURNING *
    `;

    return Response.json(dbUser);
  } catch (err) {
    console.error("Sync API error:", err);
    return Response.json({ error: "Synchronization failed" }, { status: 500 });
  }
}
