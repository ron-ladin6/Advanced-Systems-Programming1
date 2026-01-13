const express = require("express");
const jwt = require("jsonwebtoken");
function tokensRoutes(userService) {
  //create router
  const router = express.Router();
  //authenticate user
  router.post("/tokens", async (req, res, next) => {
    try {
      const body = req.body || {};
      const username = body.username;
      const password = body.password;
      //checking if username and password are strings and not empty
      if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof password !== "string" ||
        !password
      ) {
        return res.status(400).json({ error: "bad request" });
      }
      const user = await userService.login(username, password);
      // correct: if user NOT found -> 400
      if (!user) {
        return res.status(400).json({ error: "bad request" });
      }
      const secret = process.env.JWT_SECRET || "MySecretKeyForHomework123";
      if (!secret) {
        // no prints; just fail cleanly
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
  });
  //if found
  return router;
}
//make available
module.exports = tokensRoutes;
