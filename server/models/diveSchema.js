import { Schema, model } from "mongoose";

const diveSchema = new Schema({
    date: Date,
    status: {
        type: String,
        enum: ["Approved", "Pending", "Rejected"],
        default: "Pending",
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true
})

export default model("Dive", diveSchema);