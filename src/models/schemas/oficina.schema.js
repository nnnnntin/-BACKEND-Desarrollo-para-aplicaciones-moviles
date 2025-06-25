const mongoose = require("mongoose");

const oficinaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    codigo: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['privada', 'compartida', 'coworking'], default: 'privada' },
    ubicacion: {
      edificioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Edificio', required: true },
      piso: { type: Number, required: true },
      numero: { type: String, required: true },
      // ← NUEVOS CAMPOS OBLIGATORIOS
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
    capacidad: { type: Number, required: true },
    superficieM2: { type: Number },
    amenidades: [{ type: String }],
    fotosPrincipales: [{ type: String }],
    planoUrl: { type: String },
    disponibilidad: {
      horario: {
        apertura: { type: String, default: "09:00" },
        cierre: { type: String, default: "18:00" }
      },
      dias: [{
        type: String,
        enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
      }]
    },
    precios: {
      porHora: { type: Number },
      porDia: { type: Number },
      porMes: { type: Number }
    },
    estado: { type: String, enum: ['disponible', 'ocupada', 'mantenimiento', 'reservada'], default: 'disponible' },
    // ← CAMBIO: propietarioId -> usuarioId y OBLIGATORIO
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    empresaInmobiliariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmpresaInmobiliaria' },
    calificacionPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = oficinaSchema;