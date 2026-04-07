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

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$hashedpassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked-jwt-token"),
}));

jest.mock("../src/models/AskHistory", () => ({
  create: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            userId: "507f1f77bcf86cd799439011",
            question: "What is the refund policy?",
            answer: "Refunds are processed within 5-7 business days.",
            confidence: "high",
            sources: ["507f191e810c19729de860ea"],
            createdAt: new Date(),
          },
        ]),
      }),
    }),
  }),
}));

jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../src/models/Document", () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([
      {
        _id: "507f191e810c19729de860ea",
        title: "Refund Policy",
        content: "Refunds are processed within 5-7 business days.",
        createdAt: new Date(),
      },
    ]),
  }),
}));

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

describe("API Routes Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /health", () => {
    it("returns health status", async () => {
      const res = await request(app).get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("GET /api/docs", () => {
    it("returns all documents", async () => {
      const res = await request(app).get("/api/docs");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          data: expect.any(Array),
        })
      );
    });
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: "User registered successfully",
          user: expect.objectContaining({
            id: "507f1f77bcf86cd799439011",
            name: "Test User",
            email: "test@example.com",
          }),
        })
      );
    });

    it("fails if email already exists", async () => {
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe("Email already registered");
    });

    it("fails if required fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("name, email and password are required");
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in user successfully", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        password: "$2a$10$hashedpassword",
      };
      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("fails with invalid credentials", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("fails if required fields are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("email and password are required");
    });
  });

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

    it("fails with invalid question", async () => {
      const res = await request(app).post("/api/ask").send({
        question: "Hi",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid request body");
    });
  });

  describe("GET /api/ask/history", () => {
    it("returns ask history for authenticated user", async () => {
      const res = await request(app).get("/api/ask/history");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          data: expect.any(Array),
        })
      );
    });
  });
});
