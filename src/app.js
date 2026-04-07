const express = require("express");
const morgan = require("morgan");
const docRoutes = require("./routes/docRoutes");
const askRoutes = require("./routes/askRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/docs", docRoutes);
app.use("/api/ask", askRoutes);

app.use(errorHandler);

module.exports = app;
