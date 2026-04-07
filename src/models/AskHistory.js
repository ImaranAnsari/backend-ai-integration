const mongoose = require("mongoose");

const askHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    confidence: { type: String, enum: ["high", "medium", "low"], required: true },
    sources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("AskHistory", askHistorySchema);
