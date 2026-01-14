const mongoose = require("mongoose");
require("dotenv").config();
const UserService = require("./domain/UserService");
const LogicCommandsService = require("./domain/LogicCommandsService");
const FileGateway = require("./infrastructure/gateways/TcpFileStorageGateway");
const MongoUserStore = require("./domain/mongoBase/MongoUserStore");
const MongoFileStore = require("./domain/mongoBase/MongoFileStore");
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/my_drive_db";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("[DEBUG DB] Connected to MongoDB"))
  .catch((err) => console.error("[DEBUG DB] MongoDB Connection Error:", err));
const userStore = new MongoUserStore();
const fileStore = new MongoFileStore();
const tcpHost = process.env.TCP_HOST || "127.0.0.1";
const tcpPort = process.env.TCP_PORT || 8080;
const fileGateway = new FileGateway(tcpHost, tcpPort);
const userService = new UserService(userStore);
const logicService = new LogicCommandsService(
  fileStore,
  fileGateway,
  userStore
);

module.exports = {
  userService,
  logicService,
};
