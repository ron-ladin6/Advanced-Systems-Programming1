class InMemoryStorage {
  constructor() {
    this.store = new Map();
  }
  saveFile(metaData) {
    this.store.set(metaData.id, metaData);
  }
  getFile(id) {
    return this.store.get(id);
  }
  deleteFile(id) {
    this.store.delete(id);
  }
  //get all files
  getAllFiles() {
    return Array.from(this.store.values());
  }
  //get files by owner id
  getFilesByOwner(ownerId) {
    return this.getAllFiles().filter(
      (f) => String(f.ownerId) === String(ownerId)
    );
  }
}
module.exports = InMemoryStorage;
