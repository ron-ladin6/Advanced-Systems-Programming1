const express = require("express");

function searchRoutes(logicService) {
    //create router
    const router = express.Router();
    //search files
    router.get("/search", async (req, res, next) => {
        try {
            //get query from params
            const q = req.query.q || "";
            //perform search
            const results = await logicService.search(req.userId, q);
            res.status(200).json(results);
            //if error
        } catch (err) {
            return next(err);
        }
    });
    return router;
}
//make available
module.exports = searchRoutes;