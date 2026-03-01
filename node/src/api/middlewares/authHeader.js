const jwt = require("jsonwebtoken");

const authHeader = (req, res, next) => {
  //Authorization: Bearer <token>
  const header = req.headers["authorization"];
  let token = null;

  if (typeof header === "string" && header.startsWith("Bearer ")) {
    token = header.slice(7).trim();
  }

  //fallback
  if (!token && typeof req.query?.token === "string") {
    token = req.query.token.trim();
  }
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const secret = process.env.JWT_SECRET || "MySecretKeyForHomework123";
  //verify token
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = String(decoded.userId);
    return next();
  } catch (e) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authHeader;