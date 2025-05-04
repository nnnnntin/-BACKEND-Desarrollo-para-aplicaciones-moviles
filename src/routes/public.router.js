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

const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    docExpansion: 'list',
    persistAuthorization: true,
    filter: true
  },
  customJs: [
    'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js'
  ],
  customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css'
};

publicRouter.use("/swagger", swaggerUi.serve);
publicRouter.get("/swagger", (req, res) => {
  res.send(swaggerUi.generateHTML(swaggerDocument, swaggerOptions));
});

publicRouter.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

module.exports = publicRouter;