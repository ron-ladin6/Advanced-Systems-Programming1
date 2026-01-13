const express = require("express");
function usersRoutes(userService) {
    //create router
    const router = express.Router();
    //register new user
    router.post("/users", async (req, res, next) => {
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
          //if failed, return
          if (!user)
              return res.status(400).json({ error: "bad request" });
          //if succeeded, return created user
          return res.status(201).json(user);
      //if error
      } catch (err) {
          return next(err);
      }
    });
    //get user by id
    router.get("/users/:id", (req, res, next) => {
      try {
        const user = userService.getById(req.params.id);
        //if not found, return 404
        if (!user) 
            return res.status(404).json({ error: "Not Found" });
        //if found, return user
        return res.status(200).json(user);
    //if error
      } catch (err) {
        return next(err);
      }
    });
    //if found, return user
    return router;
}
//make available
module.exports = usersRoutes;