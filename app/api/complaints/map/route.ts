import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Complaint } from "@/models";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// GET /api/complaints/map - Get complaint locations for map view
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const url = new URL(req.url);
    const departmentId = url.searchParams.get("departmentId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (auth.role === "admin") {
      filter.departmentId = auth.departmentId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    const complaints = await Complaint.find(filter)
      .select("title status priority location address createdAt categoryId")
      .populate("categoryId", "name")
      .lean();

    return apiResponse(complaints, "Map data fetched");
  } catch (error) {
    console.error("Map data error:", error);
    return apiError("Internal server error", 500);
  }
}
