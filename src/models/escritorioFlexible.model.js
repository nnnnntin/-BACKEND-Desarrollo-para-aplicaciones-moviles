const mongoose = require("mongoose");
const escritorioFlexibleSchema = require("./schemas/escritorioFlexible.schema");

const EscritorioFlexible = mongoose.model("EscritorioFlexible", escritorioFlexibleSchema);
module.exports = EscritorioFlexible;