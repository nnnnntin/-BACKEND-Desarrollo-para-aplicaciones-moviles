const mongoose = require("mongoose");
const { Schema } = mongoose;

const reservaSchema = new Schema({
  idUsuario:  { type: String, required: true },
  idOficina:  { type: String, required: true },
  fecha:      { type: Date,   required: true },
  estado:     { type: String, required: true },
}, {
  collection: "reservas",
  timestamps: false
});

module.exports = reservaSchema;
