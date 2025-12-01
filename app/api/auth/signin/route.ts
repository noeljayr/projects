import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyPassword, generateSessionToken } from "@/lib/auth";
import type { User } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, password } = body;

    // Validation
    if (!userName || !password) {
      return NextResponse.json(
        { error: "userName and password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<User>("users");

    // Find user
    const user = await usersCollection.findOne({ userName });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is enabled
    if (!user.enabled) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Store session
    const sessionsCollection = db.collection("sessions");
    await sessionsCollection.insertOne({
      token: sessionToken,
      userId: user._id,
      userName: user.userName,
      role: user.role,
      createdAt: new Date(),
      expiresAt,
    });

    // Create response with session cookie
    const response = NextResponse.json(
      {
        message: "Sign in successful",
        user: {
          _id: user._id?.toString(),
          userName: user.userName,
          role: user.role,
          enabled: user.enabled,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Set user data cookie (accessible to client)
    response.cookies.set(
      "user-data",
      JSON.stringify({
        userName: user.userName,
        role: user.role,
        enabled: user.enabled,
      }),
      {
        httpOnly: false, // Accessible to client
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
