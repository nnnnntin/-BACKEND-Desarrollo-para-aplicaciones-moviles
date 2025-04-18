const mongoose = require("mongoose");
const notificacionSchema = require("./schemas/notificacion.schema");

const Notificacion = mongoose.model("Notificacion", notificacionSchema);
module.exports = Notificacion;
