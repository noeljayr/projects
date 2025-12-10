import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { listMediaFiles, deleteMediaFile } from "@/lib/mediaUtils";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const mediaFiles = await listMediaFiles(limit, skip);

    return NextResponse.json({
      success: true,
      mediaFiles,
      pagination: {
        limit,
        skip,
        hasMore: mediaFiles.length === limit,
      },
    });
  } catch (error) {
    console.error("Error listing media files:", error);
    return NextResponse.json(
      { error: "Failed to list media files" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteMediaFile(fileId);

    if (!success) {
      return NextResponse.json(
        { error: "File not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Media file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media file:", error);
    return NextResponse.json(
      { error: "Failed to delete media file" },
      { status: 500 }
    );
  }
}
