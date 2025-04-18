const Membresia = require("../models/membresia.model");

const getMembresias = async () => {
  return await Membresia.find();
};

const findMembresia = async (id) => {
  return await Membresia.findById(id);
};

const saveMembresia = async (tipo, beneficios, precio) => {
  const newMembresia = new Membresia({ tipo, beneficios, precio });
  return await newMembresia.save();
};

const updateMembresia = async (id, payload) => {
  return await Membresia.findByIdAndUpdate(id, payload, { new: true });
};

const deleteMembresia = async (id) => {
  return await Membresia.findByIdAndDelete(id);
};

module.exports = {
  getMembresias,
  findMembresia,
  saveMembresia,
  updateMembresia,
  deleteMembresia,
};
