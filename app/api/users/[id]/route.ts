import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";
import { invalidateCache } from "@/lib/redis";

// GET /api/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = await User.findById(id)
      .populate("departmentId", "name code")
      .lean();

    if (!user) return apiError("User not found", 404);

    // Admin can only see workers in their department
    if (auth.role === "admin") {
      if (
        user.role !== "worker" ||
        user.departmentId?._id?.toString() !== auth.departmentId
      ) {
        return apiError("Forbidden", 403);
      }
    }

    return apiResponse(user, "User fetched");
  } catch (error) {
    console.error("Get user error:", error);
    return apiError("Internal server error", 500);
  }
}

// PATCH /api/users/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const { isActive, departmentId } = body;

    const user = await User.findById(id);
    if (!user) return apiError("User not found", 404);

    if (auth.role === "admin") {
      if (user.departmentId?.toString() !== auth.departmentId) {
        return apiError("Forbidden", 403);
      }
      // Admin can only toggle isActive for workers
      if (user.role !== "worker") {
        return apiError("Forbidden", 403);
      }
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (departmentId && auth.role === "super-admin")
      user.departmentId = departmentId;

    await user.save();
    await invalidateCache("users:*");

    return apiResponse(user, "User updated");
  } catch (error) {
    console.error("Update user error:", error);
    return apiError("Internal server error", 500);
  }
}
