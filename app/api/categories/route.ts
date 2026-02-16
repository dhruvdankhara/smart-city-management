import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ComplaintCategory } from "@/models";
import { complaintCategorySchema } from "@/lib/validations";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin", "admin", "citizen", "worker");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const categories = await ComplaintCategory.find()
      .populate("departmentId", "name code")
      .sort({ name: 1 })
      .lean();

    return apiResponse(categories, "Categories fetched");
  } catch (error) {
    console.error("Get categories error:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/categories (super-admin only)
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const body = await req.json();
    const parsed = complaintCategorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const existing = await ComplaintCategory.findOne({
      code: parsed.data.code,
    });
    if (existing)
      return apiError("Category with this code already exists", 409);

    const category = await ComplaintCategory.create(parsed.data);

    return apiResponse(category, "Category created", 201);
  } catch (error) {
    console.error("Create category error:", error);
    return apiError("Internal server error", 500);
  }
}
