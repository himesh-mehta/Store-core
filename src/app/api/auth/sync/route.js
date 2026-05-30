import sql from "@/app/api/utils/sql";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    let email, name, image, uid;
    
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        uid = decoded.sub;
        email = decoded.email;
        name = decoded.name || email.split("@")[0];
        image = decoded.picture || "";
      }
    }

    // Fallback to body parameters if header is missing or token decode fails (useful for local simulation/tests)
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

    // 1. Sync User inside Neon PostgreSQL `auth_users` table
    // Perform an upsert: insert or update name/image on conflict
    const [dbUser] = await sql`
      INSERT INTO auth_users (name, email, image, role)
      VALUES (${name}, ${email}, ${image}, 'user')
      ON CONFLICT (email) 
      DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image
      RETURNING *
    `;

    // Map the returned id (Postgres serial integer) as the user's operational identifier
    // This maintains complete database integrity across orders and reviews!
    return Response.json(dbUser);
  } catch (err) {
    console.error("Sync API error:", err);
    return Response.json({ error: "Synchronization failed" }, { status: 500 });
  }
}
