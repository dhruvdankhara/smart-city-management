import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { authenticate, apiResponse, apiError } from "@/lib/api-utils";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    if (!auth) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    await connectDB();

    const { currentPassword, newPassword } = parsed.data;

    const user = await User.findById(auth.userId).select("+password");
    if (!user) return apiError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return apiError("Current password is incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return apiResponse(null, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return apiError("Internal server error", 500);
  }
}
