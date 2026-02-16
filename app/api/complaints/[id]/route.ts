import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Complaint, ComplaintStatusLog } from "@/models";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";
import { invalidateCache } from "@/lib/redis";

// GET /api/complaints/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "citizen", "admin", "worker", "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const complaint: any = await Complaint.findById(id)
      .populate("categoryId", "name code")
      .populate("departmentId", "name code")
      .populate("reporterId", "name email phone")
      .populate("assignedWorkerId", "name email phone")
      .populate("areaId", "name")
      .lean();

    if (!complaint) return apiError("Complaint not found", 404);

    // Authorization check
    if (
      auth.role === "citizen" &&
      complaint.reporterId?._id?.toString() !== auth.userId
    ) {
      return apiError("Forbidden", 403);
    }

    if (
      auth.role === "worker" &&
      complaint.assignedWorkerId?._id?.toString() !== auth.userId
    ) {
      return apiError("Forbidden", 403);
    }

    if (
      auth.role === "admin" &&
      complaint.departmentId?._id?.toString() !== auth.departmentId
    ) {
      return apiError("Forbidden", 403);
    }

    // Get status logs
    const statusLogs = await ComplaintStatusLog.find({ complaintId: id })
      .populate("changedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return apiResponse({ complaint, statusLogs }, "Complaint fetched");
  } catch (error) {
    console.error("Get complaint error:", error);
    return apiError("Internal server error", 500);
  }
}

// PATCH /api/complaints/[id] - Update complaint
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "admin", "worker", "super-admin", "citizen");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) return apiError("Complaint not found", 404);

    const body = await req.json();

    // Citizen can only cancel their own complaints
    if (auth.role === "citizen") {
      if (complaint.reporterId.toString() !== auth.userId) {
        return apiError("Forbidden", 403);
      }
      if (body.status !== "cancelled") {
        return apiError("You can only cancel your complaint", 400);
      }
      if (!["reported", "assigned"].includes(complaint.status)) {
        return apiError("Cannot cancel complaint in current status", 400);
      }
    }

    // Worker can update status to in_progress or resolved
    if (auth.role === "worker") {
      if (complaint.assignedWorkerId?.toString() !== auth.userId) {
        return apiError("Forbidden", 403);
      }
      if (!["in_progress", "resolved"].includes(body.status)) {
        return apiError("Invalid status update", 400);
      }
    }

    // Admin can assign, reject, update priority/deadline
    if (auth.role === "admin") {
      if (complaint.departmentId?.toString() !== auth.departmentId) {
        return apiError("Forbidden", 403);
      }
    }

    const oldStatus = complaint.status;

    // Apply updates
    if (body.status) complaint.status = body.status;
    if (body.assignedWorkerId)
      complaint.assignedWorkerId = body.assignedWorkerId;
    if (body.slaDeadline) complaint.slaDeadline = new Date(body.slaDeadline);
    if (body.priority) complaint.priority = body.priority;
    if (body.status === "resolved") complaint.resolvedAt = new Date();

    await complaint.save();

    // Log status change
    if (body.status && body.status !== oldStatus) {
      await ComplaintStatusLog.create({
        complaintId: id,
        oldStatus,
        newStatus: body.status,
        changedBy: auth.userId,
        note: body.note || "",
      });
    }

    await invalidateCache("complaints:*");

    return apiResponse(complaint, "Complaint updated successfully");
  } catch (error) {
    console.error("Update complaint error:", error);
    return apiError("Internal server error", 500);
  }
}
