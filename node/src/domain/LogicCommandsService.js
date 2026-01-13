class LogicCommandsService {
  constructor(fileStorage, fileGateway, userStorage) {
    this.fileStorage = fileStorage;
    this.fileGateway = fileGateway;
    this.userStorage = userStorage;
  }

  // GET /api/files/shared
  async getSharedFiles(userId) {
    const allFiles = this.fileStorage.getAllFiles();

    return allFiles.filter((file) => {
      if (file.isDeleted === true) return false;
      if (String(file.ownerId) === String(userId)) return false;

      return this._hasPermission(file, userId);
    });
  }
  //normalize userId (string id or username/email) to id string
  _normalizeUserId(value) {
    const key = String(value || "").trim();
    if (!key) return null;
    if (/^\d+$/.test(key)) return key;
    // otherwise try resolve via userStorage
    const resolved = this._resolveUserId(key);
    return resolved ? String(resolved) : null;
  }

  _hasPermission(file, userId) {
    const me = this._normalizeUserId(userId);
    if (!me) return false;
    //owner always has access
    if (!Array.isArray(file.permissions)) return false;
    //check if any permission matches
    return file.permissions.some((p) => {
      const other = this._normalizeUserId(p.userId);
      return other && other === me;
    });
  }
  //helper to check if user exists in userStorage
  _userExists(loginOrId) {
    if (!this.userStorage) return false;
    const key = String(loginOrId || "").trim();
    if (!key) return false;
    // try treat as id
    if (this.userStorage.findById && this.userStorage.findById(key))
      return true;
    // otherwise treat as login (username/email)
    if (this.userStorage.findByLogin && this.userStorage.findByLogin(key))
      return true;
    // not found
    return false;
  }
  // check if user
  canEdit(file, userId) {
    //owner can always edit
    if (String(file.ownerId) === String(userId)) return true;
    if (!Array.isArray(file.permissions)) return false;
    //check if user has editor role
    const user = this._normalizeUserId(userId);
    return file.permissions.some(
      (p) => this._normalizeUserId(p.userId) === user && p.role === "editor"
    );
  }
  // resolve userId from login or id
  _resolveUserId(loginOrId) {
    if (!this.userStorage) return null;

    const key = String(loginOrId || "").trim();
    if (!key) return null;

    // try treat as id
    if (this.userStorage.findById) {
      const byId = this.userStorage.findById(key);
      if (byId && byId.id !== undefined && byId.id !== null) {
        return String(byId.id);
      }
    }

    // otherwise treat as login (username/email)
    if (this.userStorage.findByLogin) {
      const byLogin = this.userStorage.findByLogin(key);
      if (byLogin && byLogin.id !== undefined && byLogin.id !== null) {
        return String(byLogin.id);
      }
    }

    return null;
  }
  // helper to throw error with status
  throwError(message = "Not Found", status = 404) {
    const error = new Error(message);
    error.status = status;
    throw error;
  }
  // verify that user is the owner of the file
  verifyOwner(fileId, userId) {
    const file = this.tryGetFile(fileId);
    if (String(file.ownerId) !== String(userId)) {
      this.throwError();
    }
    return file;
  }
  // generate unique id
  generateId() {
    return Date.now() + "_" + Math.floor(Math.random() * 10000);
  }
  // try get file or throw 404
  tryGetFile(id) {
    const file = this.fileStorage.getFile(id);
    if (!file) {
      this.throwError();
    }
    return file;
  }
  // helper to handle gateway requests and errors
  async _handleGatewayRequest(requestPromise, expectedStatusPrefix) {
    try {
      const res = await requestPromise;
      if (res.status.toString().startsWith(expectedStatusPrefix)) {
        return res;
      }
      this.throwError();
    } catch (err) {
      if (err.status) {
        throw err;
      }
      //if we get here, something unexpected happened
      const newErr = new Error("500 Internal Server Error");
      newErr.status = 500;
      throw newErr;
    }
  }
  // GET /api/files
  async getRootFiles(
    userId,
    parentId = null,
    isStarred = false,
    isTrash = false,
    isRecent = false
  ) {
    const allFiles = this.fileStorage.getAllFiles();

    // IMPORTANT: My Files should contain only files owned by the user.
    // Shared files are returned ONLY via getSharedFiles().
    const userFiles = allFiles.filter((file) => {
      const isOwner = String(file.ownerId) === String(userId);
      return isOwner;
    });

    if (isTrash) return this._getTrashFiles(userFiles);
    if (isRecent) return this._getRecentFiles(userFiles);
    if (isStarred) return this._getStarredFiles(userFiles);
    // default: get files in the specified folder
    return this._getFolderFiles(userFiles, parentId);
  }
  // helper to get trashed files
  _getTrashFiles(files) {
    return files.filter((f) => f.isDeleted === true);
  }
  // helper to get starred files
  _getStarredFiles(files) {
    return files.filter((f) => f.isStarred === true && f.isDeleted === false);
  }
  // helper to get recent files
  _getRecentFiles(files) {
    const activeFiles = files.filter((f) => f.isDeleted === false);
    return activeFiles.sort((a, b) => {
      const timeA = new Date(a.lastAccessed || a.created).getTime();
      const timeB = new Date(b.lastAccessed || b.created).getTime();
      return timeB - timeA;
    });
  }
  // helper to get files in a folder
  _getFolderFiles(files, parentId) {
    return files.filter((f) => {
      if (f.isDeleted === true) return false;
      return (!parentId && !f.parentId) || f.parentId === parentId;
    });
  }
  processContentForStorage(content) {
    // Check if content is a Base64 encoded text file
    if (content?.startsWith("data:text/plain;base64,")) {
      try {
        // Decode Base64 to UTF-8 string for search compatibility
        return Buffer.from(content.split(",")[1], "base64").toString("utf-8");
      } catch (e) {
        // return original content on error
        return content;
      }
    }
    // Return images or non-text content as is
    return content || "";
  }

  // GET /api/files/:id
  async get(id, userId) {
    let isHaveAccess = true;
    let file;
    //first try owner access
    try {
      file = this.verifyOwner(id, userId);
    } catch (err) {
      isHaveAccess = false;
    }
    //if not owner, try permission access
    if (isHaveAccess == false) {
      try {
        file = this.tryGetFile(id);
        isHaveAccess = this._hasPermission(file, userId);
      } catch (err) {}
    }

    if (file.type !== "file") {
      return { ...file, content: null, image: null };
    }

    if (isHaveAccess) {
      const response = await this._handleGatewayRequest(
        this.fileGateway.get(id),
        "200"
      );
      let content = null;
      let image = null;
      //if file has image preview, include it
      if (response.image !== undefined) image = response.image;
      if (response.content !== undefined) content = response.content;
      return { ...file, content, image };
    } else {
      this.throwError();
    }
  }

  // POST /api/files
  async create(user, name, content = "", type = "file", parentId = null) {
    if (parentId) {
      const parent = this.fileStorage.getFile(parentId);
      if (!parent || parent.type != "folder") {
        this.throwError();
      }
    }

    const fileID = this.generateId();
    const contentToSave = this.processContentForStorage(content);
    if (type == "file") {
      await this._handleGatewayRequest(
        this.fileGateway.post(fileID, contentToSave),
        "201"
      );
    }
    // get current timestamp
    const now = new Date().toISOString();
    // create file object
    const newFile = {
      id: fileID,
      name: name,
      type: type,
      ownerId: user.id,
      parentId: parentId,
      isDeleted: false,
      isStarred: false,
      lastAccessed: now,
      created: now,
      size: content ? content.length : 0,
      permissions: [
        {
          id: this.generateId(),
          userId: user.id,
          role: "owner",
        },
      ],
    };
    // save file metadata
    await this.fileStorage.saveFile(newFile);
    return newFile;
  }

  // PATCH /api/files/:id
  async update(id, fields, userId) {
    // Verify that ONLY the owner can make any changes
    const file = this.verifyOwner(id, userId);

    // Once verified, the owner can do everything:
    file.lastAccessed = new Date().toISOString();

    if (fields.isStarred !== undefined) file.isStarred = fields.isStarred;

    if (fields.isDeleted !== undefined) {
      file.isDeleted = fields.isDeleted;
      if (file.isDeleted === true) file.isStarred = false;
    }
    // rename file/folder
    if (fields.name) file.name = fields.name;
    if (fields.parentId !== undefined) file.parentId = fields.parentId;

    if (fields.content !== undefined) {
      const contentToSave = this.processContentForStorage(fields.content);
      //Update file content for the owner
      await this._handleGatewayRequest(this.fileGateway.delete(id), "204");
      await this._handleGatewayRequest(
        this.fileGateway.post(id, contentToSave),
        "201"
      );
      file.size = contentToSave.length;
    }
    // save changes
    this.fileStorage.saveFile(file);
    return file;
  }
  // DELETE /api/files/:id
  async delete(id, userId) {
    const file = this.verifyOwner(id, userId);
    // If it's already in trash -> permanently delete
    if (file.isDeleted === true) {
        // delete file content from C++ server (only for real files)
        if (file.type === "file") {
            await this._handleGatewayRequest(this.fileGateway.delete(id), "204");
        }
        // remove metadata from Node storage
        this.fileStorage.deleteFile(id);
            return {};
    }
    // First delete -> move to trash
    file.isDeleted = true;
    this.fileStorage.saveFile(file);
    return {};
  }
  // GET /api/files/:id/permissions
  async getPermissions(fileId, userId) {
    const file = this.verifyOwner(fileId, userId);
    return file.permissions || [];
  }
  // POST /api/files/:id/permissions
  async addPermission(fileId, newPermission, ownerId) {
    const file = this.verifyOwner(fileId, ownerId);
    //validate new permission
    const rawTarget = String(newPermission.userId || "").trim(); // username OR id
    const role = String(newPermission.role || "").trim();

    if (!rawTarget) this.throwError("bad request", 400);
    if (!role || role === "owner") this.throwError("bad request", 400);
    //check that target user exists
    const targetId = this._resolveUserId(rawTarget);
    if (!targetId) this.throwError("User not found", 404);
    //owner cannot add self
    if (String(targetId) === String(ownerId))
      this.throwError("bad request", 400);
    //check if permission already exists
    const normalizedTarget = this._normalizeUserId(targetId);
    const alreadyExists =
      Array.isArray(file.permissions) &&
      file.permissions.some(
        (p) => this._normalizeUserId(p.userId) === normalizedTarget
      );
    //if already exists, throw error
    if (alreadyExists) this.throwError("bad request", 400);
    //add new permission
    const permission = {
      id: this.generateId(),
      userId: String(targetId),
      role: role.toLowerCase(),
    };
    file.permissions.push(permission);
    this.fileStorage.saveFile(file);
    return permission;
  }
  // PATCH /api/files/:fileId/permissions/:pId
  async updatePermission(fileId, pId, updates, userId) {
    const file = this.verifyOwner(fileId, userId);
    //find the permission
    const permIndex = file.permissions.findIndex((p) => p.id === pId);
    if (permIndex === -1) this.throwError("Permission not found", 404);
    //owner permission cannot be changed
    file.permissions[permIndex] = {
      ...file.permissions[permIndex],
      ...updates,
    };
    this.fileStorage.saveFile(file);
    return file.permissions[permIndex];
  }
  // DELETE /api/files/:fileId/permissions/:pId
  async deletePermission(fileId, pId, userId) {
    const file = this.verifyOwner(fileId, userId);
    //find the permission
    const permissionIndex = file.permissions.findIndex((p) => p.id === pId);
    if (permissionIndex == -1) {
      this.throwError();
    }
    //owner permission cannot be deleted
    if (file.permissions[permissionIndex].role == "owner") {
      this.throwError("bad request", 400);
    }
    //remove the permission
    file.permissions.splice(permissionIndex, 1);
    this.fileStorage.saveFile(file);
    return {};
  }
  // quick search
  async search(userId, query) {
    if (!query) {
      return [];
    }
    const contentMatchIds = new Set();
    try {
      const response = await this._handleGatewayRequest(
        this.fileGateway.search(query),
        "200"
      );
      const content = response.content;
      if (content && content.length > 0) {
        const cleanContent = content.trim();
        const ids = cleanContent.split(" ");
        for (const id of ids) {
          contentMatchIds.add(id);
        }
      }
    } catch (err) {}
    const lowerQuery = query.toLowerCase();
    const allFiles = this.fileStorage.getAllFiles();
    const results = [];
    for (const file of allFiles) {
      const isOwner = String(file.ownerId) === String(userId);
      const hasPermission = this._hasPermission(file, userId);

      if (!isOwner && !hasPermission) {
        continue;
      }
      const nameMatches = file.name.toLowerCase().includes(lowerQuery);
      const contentMatches = contentMatchIds.has(file.id);
      if (nameMatches || contentMatches) {
        results.push(file);
      }
    }

    return results;
  }
}
//make available for import
module.exports = LogicCommandsService;
