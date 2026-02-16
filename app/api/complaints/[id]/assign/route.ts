import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Complaint, ComplaintStatusLog, User } from "@/models";
import { assignComplaintSchema } from "@/lib/validations";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

// POST /api/complaints/[id]/assign - Assign complaint to worker
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authorize(req, "admin", "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const parsed = assignComplaintSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { assignedWorkerId, slaDeadline, priority } = parsed.data;

    const complaint = await Complaint.findById(id);
    if (!complaint) return apiError("Complaint not found", 404);

    // Only allow assigning if complaint has not been assigned yet
    if (complaint.status !== "reported") {
      return apiError("This complaint is already assigned", 400);
    }

    // Admin can only assign complaints from their department
    if (
      auth.role === "admin" &&
      complaint.departmentId?.toString() !== auth.departmentId
    ) {
      return apiError("Forbidden", 403);
    }

    // Validate worker belongs to the same department
    const worker = await User.findOne({
      _id: assignedWorkerId,
      role: "worker",
      departmentId: complaint.departmentId,
      isActive: true,
    });

    if (!worker) {
      return apiError("Worker not found or not in the same department", 400);
    }

    // Check worker workload - strong validation
    const activeTaskCount = await Complaint.countDocuments({
      assignedWorkerId,
      status: { $in: ["assigned", "in_progress"] },
    });

    if (activeTaskCount >= 10) {
      return apiError(
        `Worker already has ${activeTaskCount} active tasks. Consider assigning to another worker.`,
        400,
      );
    }

    // Find worker with least workload in the department for suggestion
    const workerLoads = await Complaint.aggregate([
      {
        $match: {
          departmentId: complaint.departmentId,
          status: { $in: ["assigned", "in_progress"] },
        },
      },
      { $group: { _id: "$assignedWorkerId", count: { $sum: 1 } } },
    ]);

    const workerLoadMap = new Map(
      workerLoads.map((w) => [w._id?.toString(), w.count]),
    );

    const currentWorkerLoad = workerLoadMap.get(assignedWorkerId) || 0;

    // Find if there's a less-loaded worker
    const allWorkers = await User.find({
      role: "worker",
      departmentId: complaint.departmentId,
      isActive: true,
    }).select("_id name");

    const leastLoaded = allWorkers.reduce(
      (min, w) => {
        const load = workerLoadMap.get(w._id.toString()) || 0;
        return load < min.load ? { worker: w, load } : min;
      },
      { worker: null as (typeof allWorkers)[0] | null, load: Infinity },
    );

    const oldStatus = complaint.status;
    complaint.assignedWorkerId = worker._id as unknown as string;
    complaint.status = "assigned";
    complaint.slaDeadline = new Date(slaDeadline);
    if (priority) complaint.priority = priority;
    await complaint.save();

    await ComplaintStatusLog.create({
      complaintId: id,
      oldStatus,
      newStatus: "assigned",
      changedBy: auth.userId,
      note: `Assigned to ${worker.name}`,
    });

    const responseData = {
      complaint,
      workerLoad: currentWorkerLoad + 1,
      suggestion:
        leastLoaded.worker &&
        leastLoaded.load < currentWorkerLoad &&
        leastLoaded.worker._id.toString() !== assignedWorkerId
          ? `${leastLoaded.worker.name} has fewer tasks (${leastLoaded.load})`
          : null,
    };

    return apiResponse(responseData, "Complaint assigned successfully");
  } catch (error) {
    console.error("Assign complaint error:", error);
    return apiError("Internal server error", 500);
  }
}
