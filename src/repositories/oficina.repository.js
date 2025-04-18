const Oficina = require("../models/oficina.model");

const getOficinas = async () => {
  return await Oficina.find();
};

const findOficina = async (id) => {
  return await Oficina.findById(id);
};

const saveOficina = async (nombre, ubicacion, capacidad) => {
  const newOficina = new Oficina({ nombre, ubicacion, capacidad });
  return await newOficina.save();
};

const updateOficina = async (id, payload) => {
  return await Oficina.findByIdAndUpdate(id, payload, { new: true });
};

const deleteOficina = async (id) => {
  return await Oficina.findByIdAndDelete(id);
};

module.exports = {
  getOficinas,
  findOficina,
  saveOficina,
  updateOficina,
  deleteOficina,
};
