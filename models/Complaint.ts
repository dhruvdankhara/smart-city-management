import mongoose, { Schema } from "mongoose";

const ComplaintSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ComplaintCategory",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "reported",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
        "cancelled",
      ],
      default: "reported",
    },
    slaDeadline: { type: Date, default: null },
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    assignedWorkerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, required: true },
    areaId: { type: Schema.Types.ObjectId, ref: "Area", default: null },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    severityScore: { type: Number, default: 0 },
    autoDetectedCategory: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Geospatial index for location-based queries
ComplaintSchema.index({ location: "2dsphere" });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ priority: 1 });
ComplaintSchema.index({ reporterId: 1 });
ComplaintSchema.index({ departmentId: 1, status: 1 });
ComplaintSchema.index({ assignedWorkerId: 1, status: 1 });
ComplaintSchema.index({ areaId: 1 });
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ slaDeadline: 1, status: 1 });

const Complaint =
  mongoose.models.Complaint || mongoose.model("Complaint", ComplaintSchema);

export default Complaint;
