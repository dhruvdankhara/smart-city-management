import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FOLDERS = ["smart-city", "complaints", "avatars"];

// POST /api/upload - Upload image to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "citizen", "worker", "admin", "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { image, folder } = body;

    if (!image || typeof image !== "string") {
      return apiError("No image provided", 400);
    }

    // Validate base64 data URI format
    const mimeMatch = image.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,/,
    );
    if (!mimeMatch) {
      return apiError("Invalid image format. Must be a base64 data URI.", 400);
    }

    // Validate MIME type whitelist
    const mimeType = mimeMatch[1];
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return apiError(
        `Unsupported image type: ${mimeType}. Allowed: JPEG, PNG, GIF, WebP.`,
        400,
      );
    }

    // Check size (base64 is ~33% larger than raw binary)
    const base64Data = image.split(",")[1];
    if (!base64Data) {
      return apiError("Invalid image data", 400);
    }
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_IMAGE_SIZE) {
      return apiError("Image size must be less than 5MB", 400);
    }

    // Sanitize folder name — only allow whitelisted folders
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "smart-city";

    const result = await uploadImage(image, safeFolder);

    return apiResponse(result, "Image uploaded successfully");
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Internal server error", 500);
  }
}
