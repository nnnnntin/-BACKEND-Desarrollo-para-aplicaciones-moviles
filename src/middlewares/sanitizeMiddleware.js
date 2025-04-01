const xss = require('xss');

function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return xss(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = sanitizeObject(obj[key]);
    }
  }
  return obj;
}

module.exports = sanitizeMiddleware;
