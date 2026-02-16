import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models";
import { departmentSchema } from "@/lib/validations";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// GET /api/departments/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const department = await Department.findById(id).lean();
    if (!department) return apiError("Department not found", 404);

    return apiResponse(department, "Department fetched");
  } catch (error) {
    console.error("Get department error:", error);
    return apiError("Internal server error", 500);
  }
}

// PATCH /api/departments/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const parsed = departmentSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const department = await Department.findByIdAndUpdate(id, parsed.data, {
      new: true,
    });

    if (!department) return apiError("Department not found", 404);

    return apiResponse(department, "Department updated");
  } catch (error) {
    console.error("Update department error:", error);
    return apiError("Internal server error", 500);
  }
}

// DELETE /api/departments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!department) return apiError("Department not found", 404);

    return apiResponse(department, "Department deactivated");
  } catch (error) {
    console.error("Delete department error:", error);
    return apiError("Internal server error", 500);
  }
}
