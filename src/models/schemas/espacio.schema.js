const mongoose = require("mongoose");

const espacioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'otro'] },
    ubicacion: {
      edificioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Edificio', required: true },
      piso: { type: Number, required: true },
      sector: { type: String, required: true },
      // ← COORDENADAS OBLIGATORIAS
      coordenadas: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      // ← NUEVA DIRECCIÓN COMPLETA OBLIGATORIA
      direccionCompleta: {
        calle: { type: String, required: true },
        numero: { type: String, required: true },
        ciudad: { type: String, required: true },
        departamento: { type: String, required: true },
        codigoPostal: { type: String, required: true },
        pais: { type: String, required: true }
      }
    },
    capacidad: { type: Number, required: true },
    amenidades: [{ type: String }],
    disponibilidad: {
      horarioApertura: { type: String },
      horarioCierre: { type: String },
      diasDisponibles: [{ type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }]
    },
    precios: {
      porHora: { type: Number },
      porDia: { type: Number },
      porMes: { type: Number }
    },
    // ← CAMPO DE IMÁGENES MEJORADO CON VALIDACIÓN
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
    // ← CAMBIO: propietarioId -> usuarioId y OBLIGATORIO
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    empresaInmobiliariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmpresaInmobiliaria' },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = espacioSchema;