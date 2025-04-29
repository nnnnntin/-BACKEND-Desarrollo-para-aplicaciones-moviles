const express = require("express");
const router = express.Router();
const payloadMiddleware = require("../middlewares/payload.middleware");
const { createUsuarioSchema, loginSchema } = require("../routes/validations/usuario.validation");
const { postAuthSignup, postAuthLogin } = require("../controllers/auth.controller");

router.post(
  "/signup",
  payloadMiddleware(createUsuarioSchema),
  postAuthSignup
);

router.post(
  "/login",
  payloadMiddleware(loginSchema),
  postAuthLogin
);

module.exports = router;