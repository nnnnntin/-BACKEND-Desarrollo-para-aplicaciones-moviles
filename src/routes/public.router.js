const express = require("express");
const swaggerUi = require("swagger-ui-express");
const publicRouter = express.Router();
const swaggerDocument = require("../public/swagger.json");

const {
  healthController,
  pingController,
} = require("../controllers/public.controller");

publicRouter.get("/health", healthController);
publicRouter.get("/ping", pingController);

publicRouter.use("/swagger", swaggerUi.serve);
publicRouter.get("/swagger", (req, res) => {
  const options = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'list',
      persistAuthorization: true,
      filter: true
    }
  };
  
  res.send(swaggerUi.generateHTML(swaggerDocument, options));
});

publicRouter.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

module.exports = publicRouter;