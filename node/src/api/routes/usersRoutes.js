const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");

router.post("/users", usersController.register);
router.get("/users/:id", usersController.getUser);
router.post("/tokens", usersController.login);

module.exports = router;
