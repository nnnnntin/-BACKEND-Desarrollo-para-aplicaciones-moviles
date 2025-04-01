const authMiddleWare = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || token !== process.env.AUTH_SECRET_KEY) {
    res.status(401).json({
      message: "Unauthorized - Invalild token provided",
    });
    return;
  }
  next();
};

module.exports = authMiddleWare;
