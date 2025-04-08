const express = require("express");
const authRouter = express.Router();
const {
  postAuthLogin,
  postAuthSignUp,
} = require("../controllers/auth.controller");

const payloadMiddleWare = require("../middlewares/payload.middleware");
const { signupSchema, loginSchema } = require("../models/schemas/usuarioSchema");

authRouter.post("/login", payloadMiddleWare(loginSchema), postAuthLogin);
authRouter.post("/signup", payloadMiddleWare(signupSchema), postAuthSignUp);

module.exports = authRouter;
