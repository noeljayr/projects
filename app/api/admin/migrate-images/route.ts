import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { migrateImages } from "@/scripts/migrate-images";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Run the migration
    await migrateImages();

    return NextResponse.json({
      success: true,
      message: "Image migration completed successfully",
    });
  } catch (error) {
    console.error("Error running image migration:", error);
    return NextResponse.json(
      { success: false, message: "Failed to run image migration" },
      { status: 500 }
    );
  }
}
