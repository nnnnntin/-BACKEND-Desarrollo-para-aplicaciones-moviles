const xss = require("xss");

console.log(xss("<script>alert('Hola')</script>"));
