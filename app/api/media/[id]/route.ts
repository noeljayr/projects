import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const bucket = new GridFSBucket(db, { bucketName: "media_files" });

    // Check if file exists
    const fileInfo = await db
      .collection("media_files.files")
      .findOne({ _id: new ObjectId(id) });

    if (!fileInfo) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create download stream
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // Convert stream to buffer
    const chunks: Buffer[] = [];

    return new Promise<NextResponse>((resolve, reject) => {
      downloadStream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks);

        // Set appropriate headers
        const headers = new Headers();
        headers.set(
          "Content-Type",
          fileInfo.metadata?.contentType || "application/octet-stream"
        );
        headers.set("Content-Length", buffer.length.toString());
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        resolve(new NextResponse(buffer, { headers }));
      });

      downloadStream.on("error", (error) => {
        console.error("Error streaming file:", error);
        reject(
          NextResponse.json({ error: "Failed to stream file" }, { status: 500 })
        );
      });
    });
  } catch (error) {
    console.error("Error serving media file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
