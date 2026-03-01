const { logicService } = require("../services");
const path = require("path");

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

// Helper: Sanitizes filenames to prevent HTTP Header Injection attacks
const sanitizeForHeader = (name) => {
  // Removes newlines and quotes which could break the Content-Disposition header
  const n = String(name || "file").replace(/[\r\n"]/g, "_");
  return n;
};

// Helper: Determines the MIME type based on file extension
const guessMime = (name, fallback) => {
  if (fallback) return fallback;
  const ext = String(name || "").split(".").pop().toLowerCase();
  
  // Image types
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  
  // Text types (ensure UTF-8 charset is specified)
  if (ext === "txt" || ext === "md") return "text/plain; charset=utf-8";
  
  // Default binary type
  return "application/octet-stream";
};

// Helper: Extracts MIME type and Base64 data from a Data URI string
// Example input: "data:image/png;base64,iVBORw0KGgo..."
const parseDataUrl = (s) => {
  const str = String(s || "");
  const m = str.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
};

//Handles file download requests
//GET /api/files/:id/download
const downloadFile = async (req, res, next) => {
  try {
    //Fetch file data from the service layer (database)
    const file = await logicService.get(req.params.id, req.userId);

    //Prepare filename and content
    const fileName = sanitizeForHeader(file?.name || "file");
    const content = file?.content;

    //Prevent caching of sensitive file downloads
    res.set("Cache-Control", "no-store");

    if (!content) {
      return res.status(404).json({ error: "file has no content" });
    }

    // If it starts with http/https, redirect the user to that URL instead of downloading
    if (typeof content === "string" && /^https?:\/\//i.test(content)) {
      return res.redirect(302, content);
    }

    // Extract file extension for further logic
    const ext = String(fileName).split(".").pop().toLowerCase();
    const isText = ext === "txt" || ext === "md";
    if (isText) {
      //Set headers for text file download
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      //'attachment' forces the browser to show the "Save As" dialog
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      
      //send the content directly as a string
      return res.status(200).send(String(content));
    }
    //try to parse metadata if stored as Data URI
    const parsed = parseDataUrl(content);
    const mimeType = guessMime(fileName, parsed?.mime);

    //extract the raw Base64 string
    let base64Payload = parsed?.base64;
    if (!base64Payload) {
      //Fallback
      base64Payload = String(content);
    }

    //convert Base64 string back to Binary Buffer
    //this ensures the browser receives an actual image file, not a text file containing gibberish
    const buf = Buffer.from(base64Payload, "base64");

    //set headers and send the binary buffer
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(buf);

  } catch (err) {
    //pass errors
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
  downloadFile,
};