const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { 
    type: String, 
    enum: ['empleado', 'administrador', 'cliente'], 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);
