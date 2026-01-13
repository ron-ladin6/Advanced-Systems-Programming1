const express = require("express");

function filesRoutes(logicService) {
  const router = express.Router();

  //get all files that were shared with me
  router.get("/files/shared", async (req, res, next) => {
    try {
      const files = await logicService.getSharedFiles(req.userId);
      res.set("Cache-Control", "no-store");
      return res.status(200).json(files);
    } catch (err) {
      return next(err);
    }
  });

  //get files list (supports search + filters)
  router.get("/files", async (req, res, next) => {
    try {
      res.set("Cache-Control", "no-store");

      //quick search mode
      if (req.query.q) {
        const results = await logicService.search(req.userId, req.query.q);
        return res.status(200).json(results);
      }

      //parse query params
      const parentId = req.query.parentId === "null" ? null : req.query.parentId;
      const isTrash = req.query.trash === "true";
      const isStarred = req.query.starred === "true";
      const isRecent = req.query.recent === "true";
      const isShared = req.query.shared === "true";

      // decide what list to return
      let files;
      if (isShared) {
        files = await logicService.getSharedFiles(req.userId);
      } else {
        files = await logicService.getRootFiles(
          req.userId,
          parentId,
          isStarred,
          isTrash,
          isRecent
        );
      }

      return res.status(200).json(files);
    } catch (err) {
      return next(err);
    }
  });

  //create a new file/folder
  router.post("/files", async (req, res, next) => {
    try {
      const body = req.body || {};
      const name = body.fileName || body.name;

      // basic input checks
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "bad request: invalid name" });
      }
      if (body.type && body.type !== "file" && body.type !== "folder") {
        return res.status(400).json({ error: "bad request: invalid type" });
      }

      const user = { id: req.userId };
      const file = await logicService.create(
        user,
        name,
        body.content || "",
        body.type || "file",
        body.parentId || null
      );

      // location header for the new resource
      res.set("Location", `/api/files/${file.id}`);
      return res.status(201).json(file);
    } catch (err) {
      return next(err);
    }
  });

  // api: get single file metadata + content (if needed)
  router.get("/files/:id", async (req, res, next) => {
    try {
      const file = await logicService.get(req.params.id, req.userId);
      return res.status(200).json(file);
    } catch (err) {
      return next(err);
    }
  });

  // api: update file fields (name/content/star/delete/parentId)
  router.patch("/files/:id", async (req, res, next) => {
    try {
      const body = req.body || {};

      // make sure we got at least one supported field
      const hasValidField =
        body.name !== undefined ||
        body.content !== undefined ||
        body.parentId !== undefined ||
        body.isStarred !== undefined ||
        body.isDeleted !== undefined;

      if (!hasValidField) {
        return res.status(400).json({ error: "bad request: no valid fields" });
      }

      // validate name only if it was sent
      if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
        return res.status(400).json({ error: "bad request: invalid name" });
      }

      await logicService.update(req.params.id, body, req.userId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  });

  //delete file 
  router.delete("/files/:id", async (req, res, next) => {
    try {
      //try delete the file
      await logicService.delete(req.params.id, req.userId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = filesRoutes;