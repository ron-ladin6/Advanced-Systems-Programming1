const { userService } = require("../services");
const jwt = require("jsonwebtoken");

// POST /api/users (Register)
const register = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { username, email, password, verifyPassword } = body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (password !== verifyPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }
    const user = await userService.register(req.body || {});
    if (!user) return res.status(400).json({ error: "bad request" });
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
};

// GET /api/users/:id
const getUser = (req, res, next) => {
  try {
    const user = userService.getById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not Found" });
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};

// POST /api/tokens (Login)
const login = async (req, res, next) => {
  try {
    const body = req.body || {};
    const username = body.username;
    const password = body.password;

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({ error: "bad request" });
    }
    const user = await userService.login(username, password);
    if (!user) {
      return res.status(400).json({ error: "bad request" });
    }
    const secret = process.env.JWT_SECRET || "MySecretKeyForHomework123";
    if (!secret) {
      return res.status(500).json({ error: "server error" });
    }
    const token = jwt.sign({ userId: String(user.id) }, secret);
    return res.status(200).json({
      userId: String(user.id),
      token,
      displayName: user.displayName,
      image: user.image,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, getUser, login };
