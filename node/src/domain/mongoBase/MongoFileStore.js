const FileMetadata = require("../../models/fileMetaData");

class MongoFileStore {
  // Helper to convert Mongoose document to a plain object
  docToObj(document) {
    if (!document) return null;
    const obj = document.toObject();

    // Transformation: Map MongoDB's '_id' back to 'id' for the application logic
    // This ensures the frontend gets the expected 'id' field
    obj.id = obj._id;
    return obj;
  }

  async saveFile(metaData) {
    // MongoDB requires '_id' as the primary key.
    // Our application logic generates and uses a custom 'id' (UUID).
    // Prepare object for storage: Map 'id' to '_id'
    const fileToSave = {
      ...metaData,
      _id: metaData.id, // Set MongoDB's _id to match our custom UUID
    };

    // Remove the duplicate 'id' field to prevent Schema conflicts
    // (since _id now holds this value)
    delete fileToSave.id;

    // Use findOneAndUpdate with upsert:
    // If found by _id and Update. If not found Create new.
    await FileMetadata.findOneAndUpdate({ _id: metaData.id }, fileToSave, {
      upsert: true,
      new: true,
    });
  }

  async getFile(id) {
    // Retrieve file by ID
    // Note: We must query against '_id' because that's where we stored the UUID
    const file = await FileMetadata.findOne({ _id: id });
    return this.docToObj(file);
  }

  async deleteFile(id) {
    // Delete by '_id'
    await FileMetadata.deleteOne({ _id: id });
  }

  async getAllFiles() {
    const files = await FileMetadata.find({});
    return files.map((f) => this.docToObj(f));
  }

  async getFilesByOwner(ownerId) {
    const files = await FileMetadata.find({ ownerId });
    return files.map((f) => this.docToObj(f));
  }
  async searchFiles(userId, queryText, contentMatchIds = []) {
    const foundDocs = await FileMetadata.find({
      // we need to condition
      // first we are need to be owner or can permission to the file
      //the file need do have the query in the content (get from logic command) or the file name has the query.
      $and: [
        {
          $or: [{ ownerId: userId }, { "permissions.userId": userId }],
        },
        {
          $or: [
            //regex search if the query inside!! the name and not be exactly
            // "i" mean insensitive find HELLO and Hello and HeLlO
            { name: { $regex: queryText, $options: "i" } },
            { _id: { $in: contentMatchIds } },
          ],
        },
      ],
    });

    return foundDocs.map((doc) => this.docToObj(doc));
  }
  async getSharedFiles(userId) {
    const files = await FileMetadata.find({
      ownerId: { $ne: userId },
      "permissions.userId": userId,
      isDeleted: false,
    });
    return files.map((f) => this.docToObj(f));
  }
  async getFilesByParent(parentId) {
    // Fetch non-deleted children for a specific folder
    const docs = await FileMetadata.find({
      parentId: String(parentId),
      isDeleted: false,
    });
    return docs.map((doc) => this.docToObj(doc));
  }

  async getFilesByOwner(ownerId, parentId = null) {
    // Fetch root files (parentId: null) or folder files for the owner
    const docs = await FileMetadata.find({
      ownerId: String(ownerId),
      parentId: parentId,
      isDeleted: false,
    });
    return docs.map((doc) => this.docToObj(doc));
  }

  async getTrashFiles(userId) {
    const docs = await FileMetadata.find({ ownerId: userId, isDeleted: true });
    return docs.map((doc) => this.docToObj(doc));
  }

  async getStarredFiles(userId) {
    const docs = await FileMetadata.find({
      ownerId: userId,
      isStarred: true,
      isDeleted: false,
    });
    return docs.map((doc) => this.docToObj(doc));
  }

  async getRecentFiles(userId) {
    const docs = await FileMetadata.find({ ownerId: userId, isDeleted: false })
      .sort({ lastAccessed: -1, created: -1 })
      .limit(20);
    return docs.map((doc) => this.docToObj(doc));
  }
}

module.exports = MongoFileStore;
