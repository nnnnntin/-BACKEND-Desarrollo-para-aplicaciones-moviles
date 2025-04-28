const mongoose = require("mongoose");
const facturaSchema = require("./schemas/factura.schema");

const Factura = mongoose.model("Factura", facturaSchema);
module.exports = Factura;