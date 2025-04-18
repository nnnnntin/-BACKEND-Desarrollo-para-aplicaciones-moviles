const mongoose = require("mongoose");

const espacioSchema = new mongoose.Schema(
  {
    nombre:    { type: String,  required: true },
    ubicacion: { type: String,  required: true },
    capacidad: { type: Number,  required: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = espacioSchema;
