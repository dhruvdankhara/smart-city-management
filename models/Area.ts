import mongoose, { Schema } from "mongoose";

const AreaSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
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
    radius: { type: Number, default: 2000 },
  },
  { timestamps: true },
);

AreaSchema.index({ location: "2dsphere" });

const Area = mongoose.models.Area || mongoose.model("Area", AreaSchema);

export default Area;
