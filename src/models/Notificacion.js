const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
  mensaje: { type: String, required: true },
  leido: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notificacion', NotificacionSchema);
