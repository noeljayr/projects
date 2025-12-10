import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export interface MediaFile {
  _id: ObjectId;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  fileType: "image" | "video";
  originalName: string;
}

/**
 * Get media file information by ID
 */
export async function getMediaFileInfo(
  fileId: string
): Promise<MediaFile | null> {
  try {
    if (!ObjectId.isValid(fileId)) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const fileInfo = await db
      .collection("media_files.files")
      .findOne({ _id: new ObjectId(fileId) });

    if (!fileInfo) {
      return null;
    }

    return {
      _id: fileInfo._id,
      filename: fileInfo.filename,
      contentType: fileInfo.metadata?.contentType || "application/octet-stream",
      size: fileInfo.length,
      uploadedAt: fileInfo.uploadDate,
      fileType: fileInfo.metadata?.fileType || "image",
      originalName: fileInfo.metadata?.originalName || fileInfo.filename,
    };
  } catch (error) {
    console.error("Error getting media file info:", error);
    return null;
  }
}

/**
 * Delete a media file by ID
 */
export async function deleteMediaFile(fileId: string): Promise<boolean> {
  try {
    if (!ObjectId.isValid(fileId)) {
      return false;
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const bucket = new GridFSBucket(db, { bucketName: "media_files" });

    // Check if file exists
    const fileInfo = await db
      .collection("media_files.files")
      .findOne({ _id: new ObjectId(fileId) });

    if (!fileInfo) {
      return false;
    }

    // Delete the file
    await bucket.delete(new ObjectId(fileId));
    return true;
  } catch (error) {
    console.error("Error deleting media file:", error);
    return false;
  }
}

/**
 * Extract media file IDs from HTML content
 */
export function extractMediaFileIds(htmlContent: string): string[] {
  const mediaIds: string[] = [];
  const regex = /\/api\/media\/([a-f0-9]{24})/g;
  let match;

  while ((match = regex.exec(htmlContent)) !== null) {
    mediaIds.push(match[1]);
  }

  return mediaIds;
}

/**
 * Clean up unused media files
 * This function should be called when content is deleted or updated
 */
export async function cleanupUnusedMediaFiles(
  oldContent: string,
  newContent?: string
): Promise<void> {
  try {
    const oldMediaIds = extractMediaFileIds(oldContent);
    const newMediaIds = newContent ? extractMediaFileIds(newContent) : [];

    // Find media files that are no longer used
    const unusedMediaIds = oldMediaIds.filter(
      (id) => !newMediaIds.includes(id)
    );

    // Delete unused media files
    for (const mediaId of unusedMediaIds) {
      await deleteMediaFile(mediaId);
    }
  } catch (error) {
    console.error("Error cleaning up unused media files:", error);
  }
}

/**
 * List all media files (for admin purposes)
 */
export async function listMediaFiles(
  limit = 50,
  skip = 0
): Promise<MediaFile[]> {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const files = await db
      .collection("media_files.files")
      .find({})
      .sort({ uploadDate: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    return files.map((file) => ({
      _id: file._id,
      filename: file.filename,
      contentType: file.metadata?.contentType || "application/octet-stream",
      size: file.length,
      uploadedAt: file.uploadDate,
      fileType: file.metadata?.fileType || "image",
      originalName: file.metadata?.originalName || file.filename,
    }));
  } catch (error) {
    console.error("Error listing media files:", error);
    return [];
  }
}
