const mongoose = require("mongoose");

const escritorioFlexibleSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    ubicacion: {
      edificioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Edificio', required: true },
      piso: { type: Number, required: true },
      zona: { type: String, required: true },
      numero: { type: String, required: true },
      coordenadas: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      direccionCompleta: {
        calle: { type: String, required: true },
        numero: { type: String, required: true },
        ciudad: { type: String, required: true },
        departamento: { type: String, required: true },
        codigoPostal: { type: String, required: true },
        pais: { type: String, required: true }
      }
    },
    tipo: { type: String, enum: ['individual', 'compartido', 'standing'], default: 'individual' },
    amenidades: [{
      tipo: { type: String, enum: ['monitor', 'teclado', 'mouse', 'reposapiés', 'lampara', 'otro'] },
      descripcion: { type: String }
    }],
    precios: {
      porHora: { type: Number },
      porDia: { type: Number, required: true },
      porSemana: { type: Number },
      porMes: { type: Number }
    },
    imagenes: [{ 
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL de imagen debe ser válida (http/https)'
      }
    }],
    estado: { type: String, enum: ['disponible', 'ocupado', 'mantenimiento', 'reservado'], default: 'disponible' },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    empresaInmobiliariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmpresaInmobiliaria' },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = escritorioFlexibleSchema;