const mongoose = require("mongoose");

const empresaInmobiliariaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ['inmobiliaria', 'propietario_directo', 'administrador_edificio'], required: true },
    descripcion: { type: String },
    contacto: {
      nombreContacto: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true },
      cargo: { type: String }
    },
    identificacionFiscal: { type: String, required: true }, // NIF, CIF, etc.
    direccion: {
      calle: { type: String, required: true },
      ciudad: { type: String, required: true },
      codigoPostal: { type: String, required: true },
      pais: { type: String, required: true }
    },
    sitioWeb: { type: String },
    logoUrl: { type: String },
    comision: { type: Number, default: 0 }, // Porcentaje de comisión que cobra la plataforma
    metodoPago: {
      titular: { type: String },
      iban: { type: String },
      swift: { type: String }
    },
    espacios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Espacio' }],
    calificacionPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
    verificado: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

module.exports = empresaInmobiliariaSchema;
