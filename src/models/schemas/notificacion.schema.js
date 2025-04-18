const mongoose = require("mongoose");

const notificacionSchema = new mongoose.Schema(
  {
    mensaje: { type: String,  required: true },
    leido:   { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = notificacionSchema;
