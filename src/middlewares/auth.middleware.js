const jwt = require("jsonwebtoken");
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

const authMiddleWare = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  try {
    const verified = jwt.verify(token, AUTH_SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido" });
  }
};

module.exports = authMiddleWare;
