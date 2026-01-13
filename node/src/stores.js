const InMemoryUserStore = require("./domain/InMemoryUserStore");
const InMemoryStorage = require("./domain/InMemoryStorage");

const userStore = new InMemoryUserStore();
const fileStore = new InMemoryStorage();

module.exports = { userStore, fileStore };