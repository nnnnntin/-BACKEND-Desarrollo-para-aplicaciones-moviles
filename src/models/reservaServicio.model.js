const mongoose = require("mongoose");
const reservaServicioSchema = require("./schemas/reservaServicio.schema");

const ReservaServicio = mongoose.model("ReservaServicio", reservaServicioSchema);
module.exports = ReservaServicio;