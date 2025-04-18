const Espacio = require("../models/espacio.model");

const getEspacios = async () => {
  return await Espacio.find();
};

const findEspacio = async (id) => {
  return await Espacio.findById(id);
};

const saveEspacio = async (nombre, ubicacion, capacidad, completed = false) => {
  const newEspacio = new Espacio({ nombre, ubicacion, capacidad, completed });
  return await newEspacio.save();
};

const updateEspacio = async (id, payload) => {
  return await Espacio.findByIdAndUpdate(id, payload, { new: true });
};

const deleteEspacio = async (id) => {
  return await Espacio.findByIdAndDelete(id);
};

module.exports = {
  getEspacios,
  findEspacio,
  saveEspacio,
  updateEspacio,
  deleteEspacio,
};
