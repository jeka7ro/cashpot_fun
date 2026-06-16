import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Security: prevent directory traversal attacks
    if (filename.includes("/") || filename.includes("..")) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const uploadDir = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.NODE_ENV === 'production' 
      ? "/data/uploads" 
      : path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);
    const fileBuffer = await readFile(filePath);

    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    let contentType = "image/jpeg";
    if (ext === "png") contentType = "image/png";
    if (ext === "gif") contentType = "image/gif";
    if (ext === "webp") contentType = "image/webp";
    if (ext === "svg") contentType = "image/svg+xml";
    if (ext === "mp4") contentType = "video/mp4";
    if (ext === "webm") contentType = "video/webm";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
