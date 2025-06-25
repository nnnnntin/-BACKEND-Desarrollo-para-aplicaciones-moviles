const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
  {
    usuarioId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Usuario', 
      required: true,
      validate: {
        validator: async function(userId) {
          const Usuario = mongoose.model('Usuario');
          const usuario = await Usuario.findById(userId);
          return usuario && usuario.tipoUsuario === 'proveedor';
        },
        message: 'El usuario debe existir y ser de tipo "proveedor"'
      }
    },
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ['empresa', 'autonomo', 'interno'], required: true },
    descripcion: { type: String },
    serviciosOfrecidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServicioAdicional' }],
    contacto: {
      nombreContacto: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true }
    },
    identificacionFiscal: { type: String },
    direccion: {
      calle: { type: String },
      ciudad: { type: String },
      codigoPostal: { type: String },
      pais: { type: String }
    },
    metodoPago: {
      titular: { type: String },
      iban: { type: String },
      swift: { type: String }
    },
    comision: { type: Number, default: 0 },
    calificacionPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
    verificado: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

proveedorSchema.index({ usuarioId: 1 }, { unique: true });

module.exports = proveedorSchema;