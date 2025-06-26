const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    tipoUsuario: { 
      type: String, 
      enum: ['usuario', 'proveedor', 'cliente', 'administrador'], 
      required: true 
    },
    username: { 
      type: String, 
      required: true, 
      unique: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    nombre: { 
      type: String, 
      required: true 
    },
    apellidos: { 
      type: String 
    },
    imagen: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'La imagen debe ser una URL válida'
      }
    },
    datosPersonales: {
      telefono: { type: String },
      documentoIdentidad: { type: String }
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
      tipo: { 
        type: String, 
        enum: ['tarjeta_credito', 'tarjeta_debito', 'cuenta_bancaria'], 
        required: true 
      },
      activo: { type: Boolean, default: true },
      
      numero: { type: String },
      ultimosDigitos: { type: String }, 
      titular: { type: String },
      fechaVencimiento: { type: String }, 
      cvc: { type: String },
      marca: { 
        type: String, 
        enum: ['visa', 'mastercard', 'american_express', 'discover', 'otro'] 
      },
      
      banco: { type: String }, 
      numeroCuenta: { type: String },
      tipoCuenta: { 
        type: String, 
        enum: ['corriente', 'ahorros', 'nomina'] 
      },
      
      fechaCreacion: { type: Date, default: Date.now }
    }],
    activo: { type: Boolean, default: true },
    verificado: { type: Boolean, default: false },
    rol: { 
      type: String, 
      enum: ['usuario', 'editor', 'administrador', 'superadmin'], 
      default: 'usuario' 
    }
  },
  {
    timestamps: true,
  }
);

usuarioSchema.pre('save', function(next) {
  const metodosPredeterminados = this.metodoPago.filter(metodo => metodo.predeterminado);
  if (metodosPredeterminados.length > 1) {
    const error = new Error('Solo puede haber un método de pago predeterminado');
    return next(error);
  }
  next();
});

module.exports = usuarioSchema;