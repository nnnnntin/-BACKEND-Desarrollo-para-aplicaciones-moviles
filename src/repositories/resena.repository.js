const Resena = require("../models/resena.model");

const getResenas = async () => {
  return await Resena.find();
};

const findResena = async (id) => {
  return await Resena.findById(id);
};

const saveResena = async (idUsuario, comentario, calificacion) => {
  const newResena = new Resena({ idUsuario, comentario, calificacion });
  return await newResena.save();
};

const updateResena = async (id, payload) => {
  return await Resena.findByIdAndUpdate(id, payload, { new: true });
};

const deleteResena = async (id) => {
  return await Resena.findByIdAndDelete(id);
};

module.exports = {
  getResenas,
  findResena,
  saveResena,
  updateResena,
  deleteResena,
};
