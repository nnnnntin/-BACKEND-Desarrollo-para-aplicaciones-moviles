const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  idOficina: { type: mongoose.Schema.Types.ObjectId, ref: 'Oficina', required: true },
  fecha: { type: Date, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'aprobada', 'rechazada'], 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Reserva', ReservaSchema);
