const mongoose = require("mongoose");
const reservaSchema = require("./schemas/reserva.schema");

const Reserva = mongoose.model("Reserva", reservaSchema);
module.exports = Reserva;
