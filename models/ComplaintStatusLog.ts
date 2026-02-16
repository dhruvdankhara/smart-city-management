import mongoose, { Schema } from "mongoose";

const ComplaintStatusLogSchema = new Schema(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    oldStatus: {
      type: String,
      enum: [
        "reported",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
        "cancelled",
      ],
      required: true,
    },
    newStatus: {
      type: String,
      enum: [
        "reported",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
        "cancelled",
      ],
      required: true,
    },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

ComplaintStatusLogSchema.index({ complaintId: 1, createdAt: -1 });

const ComplaintStatusLog =
  mongoose.models.ComplaintStatusLog ||
  mongoose.model("ComplaintStatusLog", ComplaintStatusLogSchema);

export default ComplaintStatusLog;
