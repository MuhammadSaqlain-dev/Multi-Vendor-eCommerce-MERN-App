const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error.";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not Found. Invalid ${err.path}`;
    err = new ErrorHandler(400, message);
  }

  // dublicate key error
  if (err.code === 11000) {
    const message = `This email ${req.body.email} is already registered. Sign In instead.`;
    err = new ErrorHandler(400, message);
  }

  // wrong jwt error
  if (err.message === "JsonWebTokenError") {
    const message = `Invalid Web Token`;
    err = new ErrorHandler(400, message);
  }

  // jwt expired
  if (err.message === "TokenExpiredError") {
    const message = `Json Web Token is Expired. claim again token.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
