const mongoose = require("mongoose");
const promocionSchema = require("./schemas/promocion.schema");

const Promocion = mongoose.model("Promocion", promocionSchema);
module.exports = Promocion;