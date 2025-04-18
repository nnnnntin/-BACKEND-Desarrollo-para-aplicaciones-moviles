const mongoose = require("mongoose");
const pagoSchema = require("./schemas/pago.schema");

const Pago = mongoose.model("Pago", pagoSchema);
module.exports = Pago;
