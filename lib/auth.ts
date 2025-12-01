import { createHash, randomBytes } from "crypto";

/**
 * Hash a password using SHA-256 with salt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hashed password
 */
export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  const [salt, hash] = hashedPassword.split(":");
  const verifyHash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return hash === verifyHash;
}

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Verify authentication from request
 */
export async function verifyAuth(request: any) {
  const { cookies } = await import("next/headers");
  const clientPromise = (await import("./mongodb")).default;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session");
  const userDataCookie = cookieStore.get("user-data");

  if (!sessionToken || !userDataCookie) {
    return { authenticated: false, user: null };
  }

  // Parse user data from cookie
  let userData;
  try {
    userData = JSON.parse(userDataCookie.value);
  } catch {
    return { authenticated: false, user: null };
  }

  const client = await clientPromise;
  const db = client.db("vom_sauterhof");
  const sessions = db.collection("sessions");

  // Verify session is still valid
  const session = await sessions.findOne({ token: sessionToken?.value });
  if (!session) {
    return { authenticated: false, user: null };
  }

  // Check session expiry
  if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
    await sessions.deleteOne({ token: sessionToken?.value });
    return { authenticated: false, user: null };
  }

  // Check if user is enabled (from cookie)
  if (!userData.enabled) {
    return { authenticated: false, user: null };
  }

  return {
    authenticated: true,
    user: {
      userName: userData.userName,
      role: userData.role,
      enabled: userData.enabled,
    },
  };
}
