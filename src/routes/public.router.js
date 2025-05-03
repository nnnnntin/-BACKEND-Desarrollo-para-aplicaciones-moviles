const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const publicRouter = express.Router();
const swaggerFile = fs.readFileSync(path.resolve(__dirname, "../public/swagger.json"));
const swaggerDocument = JSON.parse(swaggerFile);

const {
  healthController,
  pingController,
} = require("../controllers/public.controller");

publicRouter.get("/health", healthController);

publicRouter.get("/ping", pingController);

publicRouter.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = publicRouter;