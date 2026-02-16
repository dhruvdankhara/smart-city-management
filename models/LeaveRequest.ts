import mongoose, { Schema } from "mongoose";

const LeaveRequestSchema = new Schema(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

LeaveRequestSchema.index({ workerId: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ workerId: 1, startDate: 1, endDate: 1 });

const LeaveRequestModel =
  mongoose.models.LeaveRequest ||
  mongoose.model("LeaveRequest", LeaveRequestSchema);

export default LeaveRequestModel;
