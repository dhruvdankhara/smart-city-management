import mongoose, { Schema } from "mongoose";

const ComplaintCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true },
);

ComplaintCategorySchema.index({ code: 1 });
ComplaintCategorySchema.index({ departmentId: 1 });

const ComplaintCategory =
  mongoose.models.ComplaintCategory ||
  mongoose.model("ComplaintCategory", ComplaintCategorySchema);

export default ComplaintCategory;
