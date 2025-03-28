const mongoose = require('mongoose');

const ResenaSchema = new mongoose.Schema({
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  comentario: { type: String, required: true },
  calificacion: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Resena', ResenaSchema);
