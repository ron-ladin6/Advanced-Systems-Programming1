const express = require("express");
const cors = require("cors");
const path = require("path");

// Middlewares
const authHeader = require("./api/middlewares/authHeader");
const errorHandler = require("./api/middlewares/errorHandler");
const healthRoutes = require("./api/routes/healthRoutes");

// Routes Imports (MVC Style)
const usersRoutes = require("./api/routes/usersRoutes");
const filesRoutes = require("./api/routes/filesRoutes");
const { logicService } = require("./services");
const searchRoutes = require("./api/routes/searchRoutes");
const permissionsRoutes = require("./api/routes/permissionsRoutes");

const app = express();

app.set("etag", false);
app.disable("etag");

app.use((req, res, next) => {
  console.log(`[DEBUG SERVER] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});
const clientBuildPath = path.join(__dirname, "../../client/build");
app.use(express.static(clientBuildPath));
app.use("/api", healthRoutes);
app.use("/api", usersRoutes);

app.use(authHeader);
app.use((req, res, next) => {
  console.log("REQ", req.method, req.originalUrl, "userId=", req.userId);
  next();
});

app.use("/api", filesRoutes);
app.use("/api", searchRoutes(logicService));
app.use("/api", permissionsRoutes(logicService));

app.use(errorHandler);
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

module.exports = app;
