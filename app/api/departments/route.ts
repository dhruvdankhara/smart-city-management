import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models";
import { departmentSchema } from "@/lib/validations";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// GET /api/departments
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin", "admin", "citizen", "worker");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const departments = await Department.find().sort({ name: 1 }).lean();

    return apiResponse(departments, "Departments fetched");
  } catch (error) {
    console.error("Get departments error:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/departments (super-admin only)
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const body = await req.json();
    const parsed = departmentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const existing = await Department.findOne({ code: parsed.data.code });
    if (existing)
      return apiError("Department with this code already exists", 409);

    const department = await Department.create(parsed.data);

    return apiResponse(department, "Department created", 201);
  } catch (error) {
    console.error("Create department error:", error);
    return apiError("Internal server error", 500);
  }
}
