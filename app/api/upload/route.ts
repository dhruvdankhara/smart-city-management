import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// POST /api/upload - Upload image to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "citizen", "worker", "admin", "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { image, folder } = body;

    if (!image) {
      return apiError("No image provided", 400);
    }

    // Validate base64 image
    if (!image.startsWith("data:image/")) {
      return apiError("Invalid image format. Must be a base64 data URI.", 400);
    }

    // Check size (roughly - base64 is ~33% larger than raw)
    const sizeInBytes = (image.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (sizeInBytes > maxSize) {
      return apiError("Image size must be less than 5MB", 400);
    }

    const result = await uploadImage(image, folder || "smart-city");

    return apiResponse(result, "Image uploaded successfully");
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Internal server error", 500);
  }
}
