import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import LeaveRequestModel from "@/models/LeaveRequest";
import { Complaint } from "@/models";
import { leaveRequestSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  authorize,
  getPaginationParams,
} from "@/lib/api-utils";

// GET /api/leaves
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "worker", "admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const { page, limit, skip } = getPaginationParams(req);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (auth.role === "worker") {
      filter.workerId = auth.userId;
    } else if (auth.role === "admin") {
      // Get all workers in admin's department
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      if (status) filter.status = status;
    }

    const [leaves, total] = await Promise.all([
      LeaveRequestModel.find(filter)
        .populate("workerId", "name email")
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeaveRequestModel.countDocuments(filter),
    ]);

    return apiResponse(
      {
        leaves,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Leave requests fetched",
    );
  } catch (error) {
    console.error("Get leaves error:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/leaves - Worker applies for leave
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "worker");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const body = await req.json();
    const parsed = leaveRequestSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { startDate, endDate, reason } = parsed.data;

    // Check if worker has pending tasks during leave period
    const conflictingTasks = await Complaint.countDocuments({
      assignedWorkerId: auth.userId,
      status: { $in: ["assigned", "in_progress"] },
      slaDeadline: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    const leave = await LeaveRequestModel.create({
      workerId: auth.userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    return apiResponse(
      { leave, conflictingTasks },
      conflictingTasks > 0
        ? `Leave applied. Note: You have ${conflictingTasks} task(s) with deadlines during this period.`
        : "Leave request submitted",
      201,
    );
  } catch (error) {
    console.error("Create leave error:", error);
    return apiError("Internal server error", 500);
  }
}
