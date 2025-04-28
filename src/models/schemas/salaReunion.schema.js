const mongoose = require("mongoose");

const salaReunionSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    codigo: { type: String, required: true, unique: true },
    ubicacion: {
      edificioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Edificio', required: true },
      piso: { type: Number, required: true },
      numero: { type: String, required: true }
    },
    capacidad: { type: Number, required: true },
    equipamiento: [{
      tipo: { type: String, enum: ['proyector', 'videoconferencia', 'pizarra', 'tv', 'otro'] },
      descripcion: { type: String }
    }],
    configuracion: { type: String, enum: ['mesa_redonda', 'auditorio', 'en_u', 'aula', 'flexible'] },
    precios: {
      porHora: { type: Number, required: true },
      mediaDia: { type: Number },
      diaDompleto: { type: Number }
    },
    imagenes: [{ type: String }],
    disponibilidad: {
      horario: {
        apertura: { type: String, default: "09:00" },
        cierre: { type: String, default: "18:00" }
      },
      dias: [{ type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }]
    },
    propietarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    empresaInmobiliariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmpresaInmobiliaria' },
    estado: { type: String, enum: ['disponible', 'ocupada', 'mantenimiento', 'reservada'], default: 'disponible' },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = salaReunionSchema;