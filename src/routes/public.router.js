const express = require("express");
const swaggerUi = require("swagger-ui-express");
const publicRouter = express.Router();
const swaggerDocument = require("../public/swagger.json");
const path = require('path');
const fs = require('fs');

const {
  healthController,
  pingController,
} = require("../controllers/public.controller");

publicRouter.get("/health", healthController);
publicRouter.get("/ping", pingController);

// Define custom HTML with direct CDN links
const customSwaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API REST de Gestión</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    .swagger-ui .topbar { display: none }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        docExpansion: 'list',
        persistAuthorization: true,
        filter: true
      });
    };
  </script>
</body>
</html>
`;

// Serve swagger
publicRouter.get("/swagger", (req, res) => {
  res.send(customSwaggerHtml);
});

publicRouter.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

module.exports = publicRouter;