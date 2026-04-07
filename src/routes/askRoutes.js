const express = require("express");
const { ask, history } = require("../controllers/askController");
const authMiddleware = require("../middleware/authMiddleware");
const { askRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/", authMiddleware, askRateLimiter, ask);
router.get("/history", authMiddleware, history);

module.exports = router;
