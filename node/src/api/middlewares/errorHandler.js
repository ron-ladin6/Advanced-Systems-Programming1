const errorHandler = (err, req, res, next) => {
  //default to 500 server error
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  return res.status(status).json({ error: message });
};

module.exports = errorHandler;
