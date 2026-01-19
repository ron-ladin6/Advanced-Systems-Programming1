const { logicService } = require("../services");

// GET /api/files/shared
const getSharedFiles = async (req, res, next) => {
  try {
    const files = await logicService.getSharedFiles(req.userId);
    res.set("Cache-Control", "no-store");
    return res.status(200).json(files);
  } catch (err) {
    return next(err);
  }
};

// GET /api/files
const getFiles = async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");

    if (req.query.q) {
      const results = await logicService.search(req.userId, req.query.q);
      return res.status(200).json(results);
    }
    const parentId = req.query.parentId === "null" ? null : req.query.parentId;
    const isTrash = req.query.trash === "true";
    const isStarred = req.query.starred === "true";
    const isRecent = req.query.recent === "true";
    const isShared = req.query.shared === "true";

    let files;
    if (isShared) {
      files = await logicService.getSharedFiles(req.userId);
    } else {
      files = await logicService.getRootFiles(
        req.userId,
        parentId,
        isStarred,
        isTrash,
        isRecent,
      );
    }
    return res.status(200).json(files);
  } catch (err) {
    return next(err);
  }
};

// POST /api/files
const createFile = async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = body.fileName || body.name;

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
      body.parentId || null,
    );

    res.set("Location", `/api/files/${file.id}`);
    return res.status(201).json(file);
  } catch (err) {
    return next(err);
  }
};

// GET /api/files/:id
const getFileById = async (req, res, next) => {
  try {
    const file = await logicService.get(req.params.id, req.userId);
    return res.status(200).json(file);
  } catch (err) {
    return next(err);
  }
};

// PATCH /api/files/:id
const updateFile = async (req, res, next) => {
  try {
    const body = req.body || {};
    const hasValidField =
      body.name !== undefined ||
      body.content !== undefined ||
      body.parentId !== undefined ||
      body.isStarred !== undefined ||
      body.isDeleted !== undefined;

    if (!hasValidField) {
      return res.status(400).json({ error: "bad request: no valid fields" });
    }

    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || !body.name.trim())
    ) {
      return res.status(400).json({ error: "bad request: invalid name" });
    }

    await logicService.update(req.params.id, body, req.userId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/files/:id
const deleteFile = async (req, res, next) => {
  try {
    await logicService.delete(req.params.id, req.userId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getSharedFiles,
  getFiles,
  createFile,
  getFileById,
  updateFile,
  deleteFile,
};
