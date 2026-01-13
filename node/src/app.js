const express = require("express");
const cors = require("cors");

const InMemoryUserStore = require("./domain/InMemoryUserStore");
const UserService = require("./domain/UserService");
const usersRoutes = require("./api/routes/usersRoutes");
const tokensRoutes = require("./api/routes/tokensRoutes");
const authHeader = require("./api/middlewares/authHeader");
const healthRoutes = require("./api/routes/healthRoutes");
const errorHandler = require("./api/middlewares/errorHandler");
const filesRoutes = require("./api/routes/filesRoutes");
const searchRoutes = require("./api/routes/searchRoutes");
const permissionsRoutes = require("./api/routes/permissionsRoutes");
const InMemoryFileStore = require("./domain/InMemoryStorage");
const FileGateway = require("./infrastructure/gateways/TcpFileStorageGateway");
const LogicCommandsService = require("./domain/LogicCommandsService");

const app = express();

// Disable ETag so browser won't get 304 for API responses
app.set("etag", false);
app.disable("etag");
app.use((req, res, next) => {
  console.log(`[DEBUG SERVER] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Disable caching for ALL /api responses
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});

const userStore = new InMemoryUserStore();
const userService = new UserService(userStore);

const fileStore = new InMemoryFileStore();
const tcpHost = process.env.TCP_HOST || "ex2";
const tcpPort = process.env.TCP_PORT || 8080;
const fileGateway = new FileGateway(tcpHost, tcpPort);
const logicService = new LogicCommandsService(fileStore, fileGateway, userStore);

const clientBuildPath = __dirname + "/../../client/build";
app.use(express.static(clientBuildPath));

app.use("/api", healthRoutes);
app.use("/api", usersRoutes(userService));
app.use("/api", tokensRoutes(userService));

app.use(authHeader);

app.use((req, res, next) => {
  console.log("REQ", req.method, req.originalUrl, "userId=", req.userId);
  next();
});

app.use("/api", filesRoutes(logicService));
app.use("/api", searchRoutes(logicService));
app.use("/api", permissionsRoutes(logicService));

app.use(errorHandler);

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(clientBuildPath + "/index.html");
});

module.exports = app;
