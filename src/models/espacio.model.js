const mongoose = require("mongoose");
const espacioSchema = require("./schemas/espacio.schema");

const Espacio = mongoose.model("Espacio", espacioSchema);
module.exports = Espacio;
