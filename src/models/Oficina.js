const mongoose = require('mongoose');

const OficinaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ubicacion: { type: String, required: true },
  capacidad: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Oficina', OficinaSchema);
