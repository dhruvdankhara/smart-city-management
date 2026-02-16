import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Area, Complaint } from "@/models";
import { areaSchema } from "@/lib/validations";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// GET /api/areas
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const areas = await Area.find().sort({ name: 1 }).lean();

    // Get complaint counts per area
    const areaCounts = await Complaint.aggregate([
      { $match: { areaId: { $ne: null } } },
      { $group: { _id: "$areaId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      areaCounts.map((a) => [a._id?.toString(), a.count]),
    );

    const areasWithCounts = areas.map((area) => ({
      ...area,
      complaintCount: countMap.get(area._id?.toString()) || 0,
    }));

    return apiResponse(areasWithCounts, "Areas fetched");
  } catch (error) {
    console.error("Get areas error:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/areas (super-admin only)
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const body = await req.json();
    const parsed = areaSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const existing = await Area.findOne({ name: parsed.data.name });
    if (existing) return apiError("Area with this name already exists", 409);

    const area = await Area.create(parsed.data);

    return apiResponse(area, "Area created", 201);
  } catch (error) {
    console.error("Create area error:", error);
    return apiError("Internal server error", 500);
  }
}
