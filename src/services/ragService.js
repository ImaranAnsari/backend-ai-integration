const { z } = require("zod");
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const Document = require("../models/Document");
const AppError = require("../utils/AppError");

const outputSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

const askPrompt = PromptTemplate.fromTemplate(`
You are a strict Q&A assistant.
Answer ONLY using the provided context documents.
If the answer is not present in the context, say:
"I could not find this information in the provided documents."

Return ONLY valid JSON with this exact shape:
{{
  "answer": "string",
  "sources": ["document_id"],
  "confidence": "high | medium | low"
}}

Question:
{question}

Context:
{context}
`);

function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function retrieveRelevantDocs(question, docs, topN = 3) {
  const qTokens = tokenize(question);

  const scored = docs
    .map((doc) => {
      const pool = `${doc.title} ${doc.content} ${(doc.tags || []).join(" ")}`;
      const tokens = tokenize(pool);
      const tokenSet = new Set(tokens);
      const score = qTokens.reduce((acc, token) => acc + (tokenSet.has(token) ? 1 : 0), 0);
      return { doc, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, topN);
  const maxPossible = Math.max(qTokens.length, 1);
  const bestScore = selected[0]?.score || 0;
  const quality = bestScore / maxPossible;

  let confidence = "low";
  if (quality >= 0.5) confidence = "high";
  else if (quality >= 0.25) confidence = "medium";

  return { selected, confidence };
}

function extractJson(raw) {
  const cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    const body = lines.slice(1, lines[lines.length - 1]?.startsWith("```") ? -1 : undefined).join("\n");
    return body.trim();
  }
  return cleaned;
}

async function askQuestion(question) {
  const docs = await Document.find().lean();
  if (!docs.length) {
    throw new AppError("No documents available. Please run the seed script first.", 400);
  }

  const { selected, confidence: retrievedConfidence } = retrieveRelevantDocs(question, docs, 3);
  if (!selected.length) {
    return {
      answer: "I could not find this information in the provided documents.",
      sources: [],
      confidence: "low",
    };
  }

  const context = selected
    .map(({ doc }) => `ID: ${doc._id}\nTitle: ${doc.title}\nContent: ${doc.content}`)
    .join("\n\n---\n\n");

  const prompt = await askPrompt.format({ question, context });
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
  });

  const response = await llm.invoke(prompt);
  const parsed = outputSchema.safeParse(JSON.parse(extractJson(response.content)));

  if (!parsed.success) {
    throw new AppError("LLM returned invalid structured output", 500);
  }

  const allowedSources = new Set(selected.map(({ doc }) => String(doc._id)));
  const safeSources = parsed.data.sources.filter((id) => allowedSources.has(String(id)));

  return {
    answer: parsed.data.answer,
    sources: safeSources,
    confidence: retrievedConfidence,
  };
}

module.exports = { askQuestion };
