const mongoose = require("mongoose");

const empresaInmobiliariaSchema = new mongoose.Schema(
  {
    usuarioId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Usuario', 
      required: true,
      validate: {
        validator: async function(userId) {
          const Usuario = mongoose.model('Usuario');
          const usuario = await Usuario.findById(userId);
          return usuario && usuario.tipoUsuario === 'cliente';
        },
        message: 'El usuario debe existir y ser de tipo "cliente"'
      }
    },
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ['inmobiliaria', 'propietario_directo', 'administrador_edificio'], required: true },
    descripcion: { type: String },
    contacto: {
      nombreContacto: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true },
      cargo: { type: String }
    },
    identificacionFiscal: { type: String, required: true },
    direccion: {
      calle: { type: String, required: true },
      ciudad: { type: String, required: true },
      codigoPostal: { type: String, required: true },
      pais: { type: String, required: true }
    },
    sitioWeb: { type: String },
    // ← CAMPO DE LOGO MEJORADO CON VALIDACIÓN
    logoUrl: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'URL del logo debe ser válida (http/https)'
      }
    },
    // ← NUEVO CAMPO DE IMÁGENES ADICIONALES
    imagenes: [{ 
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL de imagen debe ser válida (http/https)'
      }
    }],
    comision: { type: Number, default: 0 },
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

empresaInmobiliariaSchema.index({ usuarioId: 1 }, { unique: true });

module.exports = empresaInmobiliariaSchema;