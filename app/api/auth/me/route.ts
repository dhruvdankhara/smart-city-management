import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { authenticate } from "@/lib/api-utils";
import { apiResponse, apiError } from "@/lib/api-utils";
import type { SafeUser } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    await connectDB();

    const user = await User.findById(auth.userId);
    if (!user) {
      return apiError("User not found", 404);
    }

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

    return apiResponse(safeUser, "User fetched successfully");
  } catch (error) {
    console.error("Get me error:", error);
    return apiError("Internal server error", 500);
  }
}
