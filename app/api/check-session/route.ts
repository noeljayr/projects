import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { User } from "@/types/user";

export async function GET(request: NextRequest) {
  const cookie = request.cookies;

  // Check for new session cookie
  const sessionToken = cookie.get("session");

  if (!sessionToken) {
    return NextResponse.json({ loggedIn: false, reason: "No session token" });
  }

  const client = await clientPromise;
  const db = client.db("vom_sauterhof");
  const sessions = db.collection("sessions");
  const users = db.collection<User>("users");

  // Find session by token
  const session = await sessions.findOne({ token: sessionToken?.value });
  if (!session) {
    return NextResponse.json({
      loggedIn: false,
      reason: "Invalid session token",
    });
  }

  // Check session expiry
  if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
    await sessions.deleteOne({ token: sessionToken?.value });
    return NextResponse.json({ loggedIn: false, reason: "Session expired" });
  }

  // Check if user exists
  const user = await users.findOne({ _id: session.userId });
  if (!user) {
    await sessions.deleteOne({ token: sessionToken?.value });
    return NextResponse.json({
      loggedIn: false,
      reason: "User does not exist",
    });
  }

  // Check if user is enabled
  if (!user.enabled) {
    await sessions.deleteOne({ token: sessionToken?.value });
    return NextResponse.json({ loggedIn: false, reason: "User is disabled" });
  }

  return NextResponse.json({ loggedIn: true, role: user.role });
}
