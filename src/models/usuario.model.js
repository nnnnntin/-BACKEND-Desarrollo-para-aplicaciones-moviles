const mongoose = require("mongoose");
const usuarioSchema = require("./schemas/usuario.schema")

const usuario = mongoose.model("Usuario", usuarioSchema);
module.exports = usuario;