const mongoose = require("mongoose");
const empresaInmobiliariaSchema = require("./schemas/empresaInmobiliaria.schema");

const EmpresaInmobiliaria = mongoose.model("EmpresaInmobiliaria", empresaInmobiliariaSchema);
module.exports = EmpresaInmobiliaria;