import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { User } from "@/types/user";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const sessionsCollection = db.collection("sessions");

    // Find session
    const session = await sessionsCollection.findOne({ token: sessionToken });
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      await sessionsCollection.deleteOne({ token: sessionToken });
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Get user details
    const usersCollection = db.collection<User>("users");
    const user = await usersCollection.findOne({ _id: session.userId });

    if (!user || !user.enabled) {
      return NextResponse.json(
        { error: "User not found or disabled" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          _id: user._id?.toString(),
          userName: user.userName,
          role: user.role,
          enabled: user.enabled,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
