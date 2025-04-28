const mongoose = require("mongoose");
const disponibilidadSchema = require("./schemas/disponibilidad.schema");

const Disponibilidad = mongoose.model("Disponibilidad", disponibilidadSchema);
module.exports = Disponibilidad;
