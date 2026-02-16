import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatusLog,
  Area,
} from "@/models";
import { createComplaintSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  authorize,
  getPaginationParams,
} from "@/lib/api-utils";
import { uploadImage } from "@/lib/cloudinary";

// GET /api/complaints - List complaints (filtered by role)
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req, "citizen", "admin", "worker", "super-admin");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    const { page, limit, skip } = getPaginationParams(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const departmentId = url.searchParams.get("departmentId");
    const sort = url.searchParams.get("sort") || "-createdAt";

    // Build filter based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (auth.role === "citizen") {
      filter.reporterId = auth.userId;
    } else if (auth.role === "worker") {
      filter.assignedWorkerId = auth.userId;
    } else if (auth.role === "admin") {
      filter.departmentId = auth.departmentId;
    }
    // super-admin sees all

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (departmentId && auth.role === "super-admin")
      filter.departmentId = departmentId;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("categoryId", "name code")
        .populate("departmentId", "name code")
        .populate("reporterId", "name email phone")
        .populate("assignedWorkerId", "name email phone")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    const result = {
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return apiResponse(result, "Complaints fetched successfully");
  } catch (error) {
    console.error("Get complaints error:", error);
    return apiError("Internal server error", 500);
  }
}

// POST /api/complaints - Create new complaint (citizen only)
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "citizen");
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();

    // Rate limit: max 5 complaints per user per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await Complaint.countDocuments({
      reporterId: auth.userId,
      createdAt: { $gte: startOfDay },
    });
    if (todayCount >= 5) {
      return apiError(
        "Daily limit reached. You can submit a maximum of 5 complaints per day.",
        429,
      );
    }

    const body = await req.json();
    const parsed = createComplaintSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { title, description, categoryId, priority, location, address } =
      parsed.data;

    // Get category to find department
    const category = await ComplaintCategory.findById(categoryId);
    if (!category) return apiError("Invalid category", 400);

    // Upload images if provided (with validation)
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const images = [];
    if (body.imageFiles && Array.isArray(body.imageFiles)) {
      for (const file of body.imageFiles.slice(0, 5)) {
        if (typeof file !== "string") continue;
        const mimeMatch = file.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        if (!mimeMatch || !ALLOWED_MIME_TYPES.includes(mimeMatch[1])) continue;
        const base64Data = file.split(",")[1];
        if (!base64Data || (base64Data.length * 3) / 4 > 5 * 1024 * 1024)
          continue;
        const result = await uploadImage(file, "complaints");
        images.push(result);
      }
    }

    // Find nearest area
    let areaId = null;
    const nearestArea = await Area.findOne({
      location: {
        $near: {
          $geometry: location,
          $maxDistance: 5000,
        },
      },
    });
    if (nearestArea) areaId = nearestArea._id;

    const complaint = await Complaint.create({
      title,
      description,
      categoryId,
      priority,
      status: "reported",
      reporterId: auth.userId,
      departmentId: category.departmentId,
      location,
      address,
      areaId: areaId ? areaId.toString() : undefined,
      images,
      autoDetectedCategory: false,
    });

    // Create status log
    await ComplaintStatusLog.create({
      complaintId: complaint._id.toString(),
      oldStatus: "reported",
      newStatus: "reported",
      changedBy: auth.userId,
      note: "Complaint registered",
    });

    return apiResponse(complaint, "Complaint registered successfully", 201);
  } catch (error) {
    console.error("Create complaint error:", error);
    return apiError("Internal server error", 500);
  }
}
