import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Configuration limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required to upload files" },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form Data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid multipart form data" },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing required 'file' parameter in form data" },
        { status: 400 }
      );
    }

    // 3. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds 5MB limit. Received: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File cannot be empty" },
        { status: 400 }
      );
    }

    // 4. Validate MIME Type & Extension
    const mimeType = file.type.toLowerCase();
    const allowedExt = ALLOWED_MIME_TYPES[mimeType];
    if (!allowedExt) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are permitted.",
        },
        { status: 400 }
      );
    }

    // Additional check on original filename extension
    const originalExt = path.extname(file.name).toLowerCase();
    const dangerousExtensions = [
      ".exe",
      ".js",
      ".mjs",
      ".ts",
      ".php",
      ".py",
      ".sh",
      ".bat",
      ".cmd",
      ".html",
      ".htm",
      ".svg",
    ];
    if (dangerousExtensions.includes(originalExt)) {
      return NextResponse.json(
        { error: "Disallowed file extension" },
        { status: 400 }
      );
    }

    // 5. Read File Buffer & Validate Magic Numbers
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate image file signatures (magic bytes)
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isGif =
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38;
    const isWebp =
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    if (!isPng && !isJpeg && !isGif && !isWebp) {
      return NextResponse.json(
        { error: "File content does not match a valid image signature" },
        { status: 400 }
      );
    }

    // 6. Generate Collision-Resistant Filename & Write to Disk or Data URI Fallback
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const safeFilename = `${Date.now()}-${randomSuffix}${allowedExt}`;
    let publicUrl = "";

    // If running in a serverless environment (e.g. Vercel) where the local filesystem is read-only,
    // or if writing to disk fails, return a Base64 data URL so uploads work reliably everywhere.
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${safeFilename}`;
    } catch (fsError) {
      console.warn(
        "Filesystem write failed (serverless/read-only environment detected). Using Base64 Data URL fallback:",
        fsError
      );
      publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      url: publicUrl,
      filename: safeFilename,
      originalName: file.name,
      size: file.size,
      mimeType,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing file upload" },
      { status: 500 }
    );
  }
}
