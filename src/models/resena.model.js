const mongoose = require("mongoose");
const resenaSchema = require("./schemas/resena.schema");

const Resena = mongoose.model("Resena", resenaSchema);
module.exports = Resena;
