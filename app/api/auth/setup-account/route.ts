import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { User } from "@/models";
import { apiResponse, apiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password || password.length < 6) {
      return apiError("Invalid token or password (min 6 characters)", 400);
    }

    // Verify invite token
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return apiError("Invalid or expired setup link", 400);
    }

    await connectDB();

    const user = await User.findById(payload.userId).select("+password");
    if (!user) {
      return apiError("User not found", 404);
    }

    // Check if password is already set (account already set up)
    if (user.password && user.password !== "INVITE_PENDING") {
      return apiError("Account has already been set up", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.isActive = true;
    await user.save();

    return apiResponse(null, "Account set up successfully. You can now login.");
  } catch (error) {
    console.error("Setup account error:", error);
    return apiError("Internal server error", 500);
  }
}
