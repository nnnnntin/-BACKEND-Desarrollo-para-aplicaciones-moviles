const mongoose = require("mongoose");
const servicioAdicionalSchema = require("./schemas/servicioAdicional.schema");

const ServicioAdicional = mongoose.model("ServicioAdicional", servicioAdicionalSchema);
module.exports = ServicioAdicional;