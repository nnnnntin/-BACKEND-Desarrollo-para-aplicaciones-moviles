const mongoose = require("mongoose");

const resenaSchema = new mongoose.Schema(
  {
    idUsuario:   { type: Number, required: true },
    comentario:  { type: String, required: true },
    calificacion:{ type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = resenaSchema;
