const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    tipoUsuario: { type: String, enum: ['usuario', 'proveedor', 'cliente', 'administrador'], required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    apellidos: { type: String },
    imagen: { type: String },
    datosPersonales: {
      telefono: { type: String },
      documentoIdentidad: { type: String },
      fotoUrl: { type: String } 
    },
    direccion: {
      calle: { type: String },
      ciudad: { type: String },
      codigoPostal: { type: String },
      pais: { type: String }
    },
    datosEmpresa: {
      nombreEmpresa: { type: String },
      cargo: { type: String },
      nifCif: { type: String },
      sitioWeb: { type: String },
      logoUrl: { type: String }
    },
    preferencias: {
      idiomaPreferido: { type: String, default: 'es' },
      monedaPreferida: { type: String, default: 'USD' },
      notificaciones: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    },
    membresia: {
      tipoMembresiaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membresia' },
      fechaInicio: { type: Date },
      fechaVencimiento: { type: Date },
      renovacionAutomatica: { type: Boolean, default: false }
    },
    metodoPago: [{
      predeterminado: { type: Boolean, default: false },
      tipo: { type: String, enum: ['tarjeta', 'paypal', 'cuenta_bancaria'] },
      ultimosDigitos: { type: String },
      fechaExpiracion: { type: String }
    }],
    activo: { type: Boolean, default: true },
    verificado: { type: Boolean, default: false },
    rol: { type: String, enum: ['usuario', 'editor', 'administrador', 'superadmin'], default: 'usuario' }
  },
  {
    timestamps: true,
  }
);

module.exports = usuarioSchema;