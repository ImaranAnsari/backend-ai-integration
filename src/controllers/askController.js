const { z } = require("zod");
const { askQuestion } = require("../services/ragService");
const AskHistory = require("../models/AskHistory");
const AppError = require("../utils/AppError");

const askSchema = z.object({
  question: z.string().min(3).max(500),
});

async function ask(req, res, next) {
  const start = Date.now();
  try {
    const parsed = askSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Invalid request body", 400);
    }

    const result = await askQuestion(parsed.data.question);

    await AskHistory.create({
      userId: req.user._id,
      question: parsed.data.question,
      answer: result.answer,
      confidence: result.confidence,
      sources: result.sources,
    });

    console.log(
      JSON.stringify({
        event: "ask",
        userId: String(req.user._id),
        question: parsed.data.question.slice(0, 120),
        latencyMs: Date.now() - start,
        confidence: result.confidence,
      })
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function history(req, res, next) {
  try {
    const items = await AskHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.json({ count: items.length, data: items });
  } catch (error) {
    next(error);
  }
}

module.exports = { ask, history };
