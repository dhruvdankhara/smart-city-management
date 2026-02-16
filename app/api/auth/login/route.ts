import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { User } from "@/models";
import { loginSchema } from "@/lib/validations";
import { apiResponse, apiError } from "@/lib/api-utils";
import type { SafeUser, JwtPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    await connectDB();

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      return apiError("Your account has been deactivated. Contact admin.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return apiError("Invalid email or password", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString(),
    };

    const token = signToken(payload);

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

    const response = apiResponse({ user: safeUser, token }, "Login successful");

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Internal server error", 500);
  }
}
