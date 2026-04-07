jest.mock("../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { _id: "507f1f77bcf86cd799439011", email: "test@example.com" };
  next();
});

jest.mock("../src/services/ragService", () => ({
  askQuestion: jest.fn().mockResolvedValue({
    answer: "Refunds are processed within 5-7 business days.",
    sources: ["507f191e810c19729de860ea"],
    confidence: "high",
  }),
}));

jest.mock("../src/models/AskHistory", () => ({
  create: jest.fn().mockResolvedValue({}),
}));

const request = require("supertest");
const app = require("../src/app");

describe("POST /api/ask", () => {
  it("returns structured response for authenticated user", async () => {
    const res = await request(app).post("/api/ask").send({
      question: "What is the refund policy?",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        answer: expect.any(String),
        sources: expect.any(Array),
        confidence: expect.stringMatching(/high|medium|low/),
      })
    );
  });
});
