const mongoose = require("mongoose");
const salaReunionSchema = require("./schemas/salaReunion.schema");

const SalaReunion = mongoose.model("SalaReunion", salaReunionSchema);
module.exports = SalaReunion;