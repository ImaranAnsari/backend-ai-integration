function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(isProd ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
