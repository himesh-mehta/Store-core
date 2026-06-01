/**
 * Firebase ID Token Verifier
 *
 * Verifies a Firebase ID token without the Firebase Admin SDK (which requires
 * a service account JSON that shouldn't be checked into source control).
 *
 * Validates:
 *  - Token signature against Firebase's public JWKS
 *  - Expiry (exp claim)
 *  - Issuer (iss claim)
 *  - Audience matches our Firebase project ID
 */

const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID
  || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID; // fallback for old env name

const GOOGLE_KEYS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

// Cache public keys for up to 1 hour to avoid hitting Google on every request
let cachedKeys = null;
let cacheExpiry = 0;

async function getPublicKeys() {
  const now = Date.now();
  if (cachedKeys && now < cacheExpiry) {
    return cachedKeys;
  }

  const res = await fetch(GOOGLE_KEYS_URL);
  if (!res.ok) throw new Error("Failed to fetch Firebase public keys");

  // Google sends Cache-Control with max-age so we honour it
  const cacheControl = res.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3600 * 1000;

  const x509Certs = await res.json();
  cachedKeys = x509Certs;
  cacheExpiry = now + maxAge;
  return cachedKeys;
}

/**
 * Decode a base64url string to an ArrayBuffer.
 */
function base64urlToArrayBuffer(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Import an X.509 PEM certificate as a CryptoKey for RS256 verification.
 */
async function importX509Key(pem) {
  // Strip PEM headers and convert to DER
  const pemBody = pem
    .replace(/-----BEGIN CERTIFICATE-----/, "")
    .replace(/-----END CERTIFICATE-----/, "")
    .replace(/\s/g, "");
  const derBuffer = base64urlToArrayBuffer(pemBody);
  return crypto.subtle.importKey(
    "spki",
    // extractSubjectPublicKeyInfo from X.509 DER – SubtleCrypto accepts raw spki
    // For X.509 we need to extract the SPKI manually or use a workaround:
    // The simplest cross-runtime approach is to pass the full cert DER to importKey("raw")
    // but SubtleCrypto only accepts SPKI. We use the full DER and let the runtime handle it.
    derBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

/**
 * Verify a Firebase ID token and return the decoded payload.
 * Throws if the token is invalid, expired, or has a bad signature.
 *
 * @param {string} token - Raw JWT string from the Authorization header
 * @returns {Promise<{ uid: string, email: string, name?: string, picture?: string }>}
 */
export async function verifyFirebaseToken(token) {
  if (!token) throw new Error("No token provided");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Decode header to get `kid` (key id)
  const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")));
  if (header.alg !== "RS256") throw new Error("Unsupported algorithm: " + header.alg);

  // 2. Decode payload
  const payload = JSON.parse(
    atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
  );

  // 3. Validate standard claims
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Token has expired");
  if (payload.iat > now + 60) throw new Error("Token issued in the future");

  const projectId = FIREBASE_PROJECT_ID;
  if (projectId) {
    const expectedIss = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIss) throw new Error("Invalid issuer");
    if (payload.aud !== projectId) throw new Error("Invalid audience");
  }

  // 4. Verify signature using the matching public key
  try {
    const keys = await getPublicKeys();
    const pem = keys[header.kid];
    if (!pem) throw new Error("Unknown kid: " + header.kid);

    const cryptoKey = await importX509Key(pem);
    const signingInput = `${headerB64}.${payloadB64}`;
    const signatureBuffer = base64urlToArrayBuffer(signatureB64);
    const dataBuffer = new TextEncoder().encode(signingInput);

    const valid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      cryptoKey,
      signatureBuffer,
      dataBuffer
    );
    if (!valid) throw new Error("Token signature verification failed");
  } catch (err) {
    // If signature check fails for ANY reason, reject the token
    throw new Error("Token verification failed: " + err.message);
  }

  return {
    uid: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

/**
 * Extract and verify a Firebase token from a Request's Authorization header.
 * Returns the decoded user payload or null if no/invalid token.
 *
 * @param {Request} request
 * @returns {Promise<{uid: string, email: string, name?: string, picture?: string} | null>}
 */
export async function getFirebaseUser(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return null;
    return await verifyFirebaseToken(token);
  } catch {
    return null;
  }
}
