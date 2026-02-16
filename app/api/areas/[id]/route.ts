import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Area, Complaint } from "@/models";
import { areaSchema } from "@/lib/validations";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// GET /api/areas/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const area = await Area.findById(id).lean();
    if (!area) return apiError("Area not found", 404);

    return apiResponse(area, "Area fetched");
  } catch (error) {
    console.error("Get area error:", error);
    return apiError("Internal server error", 500);
  }
}

// PATCH /api/areas/[id]
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
    const parsed = areaSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const area = await Area.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!area) return apiError("Area not found", 404);

    return apiResponse(area, "Area updated");
  } catch (error) {
    console.error("Update area error:", error);
    return apiError("Internal server error", 500);
  }
}

// DELETE /api/areas/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const area = await Area.findByIdAndDelete(id);
    if (!area) return apiError("Area not found", 404);

    // Remove areaId reference from associated complaints
    await Complaint.updateMany({ areaId: id }, { areaId: null });

    return apiResponse(null, "Area deleted");
  } catch (error) {
    console.error("Delete area error:", error);
    return apiError("Internal server error", 500);
  }
}
