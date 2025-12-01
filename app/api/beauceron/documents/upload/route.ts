import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { GridFSBucket, ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const beauceronId = formData.get("beauceronId") as string;
    const type = formData.get("type") as string;

    if (!file || !beauceronId || !type) {
      return NextResponse.json(
        { success: false, message: "File, beauceronId, and type are required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const validTypes = [
      "stammbaum",
      "arbeitsresultate",
      "ausstellungsresultate",
      "zucht",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid document type" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const bucket = new GridFSBucket(db, { bucketName: "beauceron_documents" });

    // Check if document already exists for this beauceron and type
    const existingFile = await db
      .collection("beauceron_documents.files")
      .findOne({ "metadata.beauceronId": beauceronId, "metadata.type": type });

    if (existingFile) {
      // Delete existing file
      await bucket.delete(existingFile._id);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        beauceronId,
        type,
        contentType: file.type,
        size: file.size,
        uploadedBy: authResult.user.userName,
        uploadedAt: new Date(),
      },
    });

    await new Promise((resolve, reject) => {
      uploadStream.write(buffer);
      uploadStream.end();
      uploadStream.on("finish", () => resolve(uploadStream.id));
      uploadStream.on("error", reject);
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      fileId: uploadStream.id.toString(),
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload document" },
      { status: 500 }
    );
  }
}
