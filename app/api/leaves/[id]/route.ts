import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import LeaveRequestModel from "@/models/LeaveRequest";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// PATCH /api/leaves/[id] - Approve/Reject leave (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const { status } = body;

    if (!["approved", "rejected"].includes(status)) {
      return apiError("Invalid status. Use 'approved' or 'rejected'", 400);
    }

    const leave = await LeaveRequestModel.findById(id);
    if (!leave) return apiError("Leave request not found", 404);
    if (leave.status !== "pending") {
      return apiError("Leave request already processed", 400);
    }

    leave.status = status;
    leave.approvedBy = auth.userId;
    await leave.save();

    return apiResponse(leave, `Leave request ${status}`);
  } catch (error) {
    console.error("Update leave error:", error);
    return apiError("Internal server error", 500);
  }
}
