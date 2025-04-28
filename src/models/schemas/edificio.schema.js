const mongoose = require("mongoose");

const edificioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    direccion: {
      calle: { type: String, required: true },
      numero: { type: String, required: true },
      ciudad: { type: String, required: true },
      codigoPostal: { type: String, required: true },
      pais: { type: String, required: true },
      coordenadas: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    propietarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    empresaInmobiliariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmpresaInmobiliaria' },
    descripcion: { type: String },
    imagenes: [{ type: String }],
    planos: [{ type: String }],
    amenidades: [{
      tipo: { type: String },
      descripcion: { type: String },
      horario: { type: String }
    }],
    horario: {
      apertura: { type: String, default: "09:00" },
      cierre: { type: String, default: "18:00" },
      diasOperacion: [{ type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }]
    },
    accesibilidad: { type: Boolean, default: false },
    estacionamiento: { type: Boolean, default: false },
    calificacionPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = edificioSchema;