const express = require("express");
function permissionsRoutes(fileService) {
    const router = express.Router();
    //get permissions for a file
    router.get("/files/:fileId/permissions", async (req, res, next) => {
        try {
            //perform get
            const permissions = await fileService.getPermissions(req.params.fileId, req.userId);
            return res.status(200).json(permissions);
        //if error
        } catch (err) {
            return next(err);
        }
    });
    //add permission to a file
    router.post("/files/:fileId/permissions", async (req, res, next) => {
        try {
            const body = req.body || {};
            if (typeof body.userId !== "string" || !body.userId.trim()) {
                return res.status(400).json({ error: "bad request" });
            }
            if (typeof body.role !== "string" || !body.role.trim() || body.role === "owner") {
                return res.status(400).json({ error: "bad request" });
            }
            //perform add
            const permission = await fileService.addPermission(req.params.fileId, body, req.userId);
            res.set("Location", `/api/files/${req.params.fileId}/permissions/${permission.id}`);
            return res.status(201).send();
        //if error
        } catch (err) {
            return next(err);
        }
    });
    //update permission
    router.patch("/files/:fileId/permissions/:pId", async (req, res, next) => {
        try {
            const body = req.body || {};
        if (body.userId !== undefined) {
            return res.status(400).json({ error: "bad request" });
        }
        if (body.role !== undefined) {
        if (typeof body.role !== "string" || !body.role.trim() || body.role === "owner") {
            return res.status(400).json({ error: "bad request" });
        }
        } else {
            return res.status(400).json({ error: "bad request" });
        }
            //perform update
            await fileService.updatePermission(req.params.fileId, req.params.pId, body, req.userId);
            return res.status(204).send();
        //if error
        } catch (err) {
            return next(err);
        }
    });
    //delete permission
    router.delete("/files/:fileId/permissions/:pId", async (req, res, next) => {
        try {
            //perform delete
            await fileService.deletePermission(req.params.fileId, req.params.pId, req.userId);
            return res.status(204).send();
        //if error
        } catch (err) {
            return next(err);
        }
    });
    return router;
}
//make available
module.exports = permissionsRoutes;