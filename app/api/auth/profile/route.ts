import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { authenticate, apiResponse, apiError } from "@/lib/api-utils";
import { updateProfileSchema } from "@/lib/validations";
import { deleteImage } from "@/lib/cloudinary";
import type { SafeUser } from "@/types";

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticate(req);
    if (!auth) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    await connectDB();

    const user = await User.findById(auth.userId);
    if (!user) return apiError("User not found", 404);

    const { name, avatar } = parsed.data;

    // If avatar changed and old one exists, delete from Cloudinary
    if (avatar !== undefined && user.avatar?.public_id) {
      const newPublicId = avatar?.public_id || null;
      if (newPublicId !== user.avatar.public_id) {
        try {
          await deleteImage(user.avatar.public_id);
        } catch {
          // ignore Cloudinary delete errors
        }
      }
    }

    user.name = name;
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    await user.save();

    const safeUser: SafeUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || null,
      role: user.role,
      departmentId: user.departmentId?.toString(),
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return apiResponse(safeUser, "Profile updated successfully");
  } catch (error) {
    console.error("Profile update error:", error);
    return apiError("Internal server error", 500);
  }
}
