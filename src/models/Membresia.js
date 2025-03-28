const mongoose = require('mongoose');

const MembresiaSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  beneficios: { type: String, required: true },
  precio: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Membresia', MembresiaSchema);
