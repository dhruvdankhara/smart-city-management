import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Complaint, User, Department } from "@/models";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "super-admin", "admin", "worker", "citizen");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const url = new URL(req.url);
    const timeframe = url.searchParams.get("timeframe") || "month"; // day, month, year

    let dateFilter: Date;
    const now = new Date();

    switch (timeframe) {
      case "day":
        dateFilter = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case "year":
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseFilter: Record<string, any> = {};

    if (auth.role === "citizen") {
      baseFilter.reporterId = new mongoose.Types.ObjectId(auth.userId);
    } else if (auth.role === "worker") {
      baseFilter.assignedWorkerId = new mongoose.Types.ObjectId(auth.userId);
    } else if (auth.role === "admin") {
      baseFilter.departmentId = new mongoose.Types.ObjectId(auth.departmentId);
    }

    // Aggregate stats
    const [statusCounts, priorityCounts, recentComplaints, totalUsers] =
      await Promise.all([
        Complaint.aggregate([
          { $match: { ...baseFilter, createdAt: { $gte: dateFilter } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Complaint.aggregate([
          { $match: { ...baseFilter, createdAt: { $gte: dateFilter } } },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        Complaint.find(baseFilter)
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("categoryId", "name")
          .populate("departmentId", "name")
          .lean(),
        auth.role === "super-admin"
          ? User.countDocuments()
          : Promise.resolve(0),
      ]);

    // Format status counts
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    const priorityMap: Record<string, number> = {};
    priorityCounts.forEach((p) => {
      priorityMap[p._id] = p.count;
    });

    const totalComplaints = Object.values(statusMap).reduce((a, b) => a + b, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dashboardData: Record<string, any> = {
      stats: {
        total: totalComplaints,
        reported: statusMap.reported || 0,
        assigned: statusMap.assigned || 0,
        inProgress: statusMap.in_progress || 0,
        resolved: statusMap.resolved || 0,
        rejected: statusMap.rejected || 0,
        cancelled: statusMap.cancelled || 0,
      },
      priorityBreakdown: {
        low: priorityMap.low || 0,
        medium: priorityMap.medium || 0,
        high: priorityMap.high || 0,
        critical: priorityMap.critical || 0,
      },
      recentComplaints,
    };

    // Super admin extras
    if (auth.role === "super-admin") {
      const [departmentStats, departments] = await Promise.all([
        Complaint.aggregate([
          { $match: { createdAt: { $gte: dateFilter } } },
          {
            $group: {
              _id: "$departmentId",
              total: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
              },
            },
          },
        ]),
        Department.find({ isActive: true }).lean(),
      ]);

      dashboardData.totalUsers = totalUsers;
      dashboardData.departmentStats = departmentStats.map((ds) => {
        const dept = departments.find(
          (d) => d._id.toString() === ds._id?.toString(),
        );
        return {
          department: dept?.name || "Unassigned",
          total: ds.total,
          resolved: ds.resolved,
          resolutionRate:
            ds.total > 0 ? Math.round((ds.resolved / ds.total) * 100) : 0,
        };
      });

      // Complaints over time (for chart)
      dashboardData.complaintsOverTime = await Complaint.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    // Area stats for super-admin and admin
    if (auth.role === "super-admin" || auth.role === "admin") {
      const areaMatchFilter = {
        ...baseFilter,
        createdAt: { $gte: dateFilter },
        areaId: { $ne: null },
      };

      dashboardData.areaStats = await Complaint.aggregate([
        { $match: areaMatchFilter },
        {
          $group: {
            _id: "$areaId",
            total: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "_id",
            foreignField: "_id",
            as: "area",
          },
        },
        { $unwind: "$area" },
        {
          $project: {
            _id: 1,
            total: 1,
            resolved: 1,
            name: "$area.name",
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]);

      // Count complaints with no area
      const unassignedAreaCount = await Complaint.countDocuments({
        ...baseFilter,
        createdAt: { $gte: dateFilter },
        areaId: null,
      });
      dashboardData.unassignedAreaCount = unassignedAreaCount;
    }

    // Admin extras: overdue tasks
    if (auth.role === "admin") {
      const deptObjectId = new mongoose.Types.ObjectId(auth.departmentId);

      dashboardData.overdueComplaints = await Complaint.countDocuments({
        departmentId: deptObjectId,
        status: { $in: ["assigned", "in_progress"] },
        slaDeadline: { $lt: new Date() },
      });

      dashboardData.workerStats = await Complaint.aggregate([
        {
          $match: {
            departmentId: deptObjectId,
            assignedWorkerId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$assignedWorkerId",
            total: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
            active: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["assigned", "in_progress"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "worker",
          },
        },
        { $unwind: { path: "$worker", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            total: 1,
            resolved: 1,
            active: 1,
            name: "$worker.name",
            avatar: "$worker.avatar",
          },
        },
      ]);
    }

    return apiResponse(dashboardData, "Dashboard stats fetched");
  } catch (error) {
    console.error("Dashboard error:", error);
    return apiError("Internal server error", 500);
  }
}
