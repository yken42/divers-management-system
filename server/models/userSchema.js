import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "developer", "qa"],
      default: "student",
    },
    dives: {
      type: [Schema.Types.ObjectId],
      ref: "Dive",
    },
  },
  { collection: "users" }
);

export default model("User", userSchema);
