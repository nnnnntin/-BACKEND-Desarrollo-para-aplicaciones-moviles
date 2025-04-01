const Joi = require("joi");
const {
  getMembresias,
  createMembresia,
  findMembresia,
  updateMembresia,
  deleteMembresia,
} = require("../models/storage/membresiaStorage.js");
const sendEmail = require("../services/mailjet.service.js");

const getMembresiasController = (req, res) => {
  res.status(200).json(getMembresias());
};

const getMembresiaController = (req, res) => {
  const { id } = req.params;
  const membresia = findMembresia(id);
  if (membresia) {
    res.status(200).json(membresia);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la membresía con id: ${id}`,
  });
};

const postMembresiaController = async (req, res) => {
  const { tipo, beneficios, precio } = req.body;
  createMembresia(tipo, beneficios, precio);
  // const response = await sendEmail(mensaje);
  res.status(201).json({
    message: "Membresía creada correctamente",
  });
};

const putMembresiaController = (req, res) => {
  const { id } = req.params;
  let membresia = findMembresia(id);
  if (membresia) {
    membresia = updateMembresia(id, req.body);
    res.status(200).json(membresia);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la membresía con id: ${id}`,
  });
};

const deleteMembresiaController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteMembresia(id);
  if (eliminado) {
    res.status(200).json({
      message: "Membresía eliminada correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Membresía no encontrada",
  });
};

module.exports = {
  getMembresiasController,
  getMembresiaController,
  postMembresiaController,
  putMembresiaController,
  deleteMembresiaController,
};
