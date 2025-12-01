import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value;

    if (sessionToken) {
      const client = await clientPromise;
      const db = client.db();
      const sessionsCollection = db.collection("sessions");

      // Delete session from database
      await sessionsCollection.deleteOne({ token: sessionToken });
    }

    // Create response
    const response = NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear session cookie
    response.cookies.delete("session");

    // Clear user data cookie
    response.cookies.delete("user-data");

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
