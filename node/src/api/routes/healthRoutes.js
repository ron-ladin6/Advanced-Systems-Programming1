const express = require("express");
//define health check route
const router = express.Router();
//health check endpoint
router.get("/health", (req, res) => {
    res.status(200).json({});
});
//make router available
module.exports = router;