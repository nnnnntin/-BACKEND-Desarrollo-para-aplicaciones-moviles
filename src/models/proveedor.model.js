const mongoose = require("mongoose");
const proveedorSchema = require("./schemas/proveedor.schema");

const Proveedor = mongoose.model("Proveedor", proveedorSchema);
module.exports = Proveedor;