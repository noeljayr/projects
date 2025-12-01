import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { UserRole, type User } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, password, role, enabled } = body;

    // Validation
    if (!userName || !password) {
      return NextResponse.json(
        { error: "userName and password are required" },
        { status: 400 }
      );
    }

    if (userName.length < 3) {
      return NextResponse.json(
        { error: "userName must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const userRole = role || UserRole.GUEST;
    if (!Object.values(UserRole).includes(userRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'guest'" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<User>("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ userName });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const newUser: User = {
      userName,
      password: hashedPassword,
      role: userRole,
      enabled: enabled !== undefined ? enabled : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          _id: result.insertedId.toString(),
          userName: newUser.userName,
          role: newUser.role,
          enabled: newUser.enabled,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
