const mongoose = require("mongoose");
const edificioSchema = require("./schemas/edificio.schema");

const Edificio = mongoose.model("Edificio", edificioSchema);
module.exports = Edificio;