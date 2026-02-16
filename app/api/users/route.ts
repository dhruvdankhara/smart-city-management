import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { createUserSchema } from "@/lib/validations";
import { signToken } from "@/lib/jwt";
import { sendEmail, generateInviteEmail } from "@/lib/email";
import {
  apiResponse,
  apiError,
  authorize,
  getPaginationParams,
} from "@/lib/api-utils";

// GET /api/users - List users (super-admin: all, admin: workers in department)
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const { page, limit, skip } = getPaginationParams(req);
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const departmentId = url.searchParams.get("departmentId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (auth.role === "admin") {
      // Admin can only see workers in their department
      filter.departmentId = auth.departmentId;
      filter.role = "worker";
    } else {
      // Super-admin filters
      if (role) filter.role = role;
      if (departmentId) filter.departmentId = departmentId;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate("departmentId", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return apiResponse(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users fetched",
    );
  } catch (error) {
    console.error("Get users error:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/users - Create admin/worker with invite email
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { name, email, phone, role, departmentId } = parsed.data;

    // Admin can only create workers in their department
    if (auth.role === "admin") {
      if (role !== "worker") {
        return apiError("You can only create workers", 403);
      }
      if (departmentId !== auth.departmentId) {
        return apiError("You can only create workers in your department", 403);
      }
    }

    // Check existing
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return apiError("User with this email or phone already exists", 409);
    }

    // Create user with placeholder password
    const user = await User.create({
      name,
      email,
      phone,
      password: "INVITE_PENDING",
      role,
      departmentId,
      isActive: false,
    });

    // Generate setup token
    const setupToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString(),
    });

    const setupLink = `${process.env.NEXT_PUBLIC_APP_URL}/setup-account?token=${setupToken}`;

    // Send invite email
    try {
      await sendEmail({
        to: email,
        subject: "Set up your Smart City Management account",
        html: generateInviteEmail(name, role, setupLink),
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail the whole request if email fails
    }

    return apiResponse(
      { user, setupLink },
      "User created and invite email sent",
      201,
    );
  } catch (error) {
    console.error("Create user error:", error);
    return apiError("Internal server error", 500);
  }
}
