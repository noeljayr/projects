import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const beauceronId = searchParams.get("beauceronId");
    const type = searchParams.get("type");

    if (!beauceronId || !type) {
      return NextResponse.json(
        { success: false, message: "beauceronId and type are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const file = await db
      .collection("beauceron_documents.files")
      .findOne({ "metadata.beauceronId": beauceronId, "metadata.type": type });

    if (!file) {
      return NextResponse.json({
        success: true,
        file: null,
      });
    }

    return NextResponse.json({
      success: true,
      file: {
        id: file._id.toString(),
        filename: file.filename,
        size: file.metadata.size,
        uploadedAt: file.metadata.uploadedAt,
        uploadedBy: file.metadata.uploadedBy,
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
