const logRequest = require("../utils/logger");
const loggerMiddleWare = (req, res, next) => {
  logRequest(req);
  next();
};

module.exports = loggerMiddleWare;
