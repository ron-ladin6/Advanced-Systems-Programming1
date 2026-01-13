const jwt = require("jsonwebtoken");

const authHeader = (req, res, next) => {
  console.log("DEBUG AUTH: Checking Authorization Header...");
  // Expecting header to be in token format
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.error("DEBUG AUTH ERROR: No Authorization header provided");
    return res.status(401).json({ error: "No token provided" });
  }
  // Extract token from header
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("DEBUG AUTH ERROR: Malformed token header");
    return res.status(401).json({ error: "Malformed token" });
  }
  //verify token
  const secret = process.env.JWT_SECRET || "MySecretKeyForHomework123";
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error(
        "DEBUG AUTH ERROR: Token verification failed:",
        err.message
      );
      return res.status(403).json({ error: "Invalid token" });
    }
    console.log(`DEBUG AUTH: Success! User ID: ${decoded.userId}`);
    req.userId = String(decoded.userId);
    next();
  });
};

module.exports = authHeader;
