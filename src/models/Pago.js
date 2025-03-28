const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
  metodo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Pago', PagoSchema);
