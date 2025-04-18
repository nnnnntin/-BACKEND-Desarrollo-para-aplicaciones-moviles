const mongoose = require("mongoose");
const membresiaSchema = require("./schemas/membresia.schema");

const Membresia = mongoose.model("Membresia", membresiaSchema);
module.exports = Membresia;
