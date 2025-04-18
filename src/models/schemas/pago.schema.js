const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema(
  {
    idUsuario: { type: Number, required: true },
    monto:     { type: Number, required: true },
    fecha:     { type: Date,   required: true },
    metodo:    { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = pagoSchema;
