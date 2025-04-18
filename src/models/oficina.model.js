const mongoose = require("mongoose");
const oficinaSchema = require("./schemas/oficina.schema");

const Oficina = mongoose.model("Oficina", oficinaSchema);
module.exports = Oficina;
