const Joi = require("joi");
const {
  getEspacios,
  createEspacio,
  findEspacio,
  updateEspacio,
  deleteEspacio,
} = require("../models/espacio.models.js");
const sendEmail = require("../services/mailjet.service.js");

const getEspaciosController = (req, res) => {
  const { nombre } = req.query;
  let resultado = getEspacios();
  if (nombre) {
    resultado = resultado.filter((espacio) =>
      espacio.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }
  res.status(200).json(resultado);
};

const getEspacioController = (req, res) => {
  const { id } = req.params;
  const espacio = findEspacio(id);
  if (espacio) {
    res.status(200).json(espacio);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado el espacio con id: ${id}`,
  });
};

const postEspacioController = async (req, res) => {
  const { nombre, ubicacion, capacidad } = req.body;
  createEspacio(nombre, ubicacion, capacidad);
  // const response = await sendEmail(mensaje);
  res.status(201).json({
    message: "Espacio creado correctamente",
  });
};

const putEspacioController = (req, res) => {
  const { id } = req.params;
  let espacio = findEspacio(id);
  if (espacio) {
    espacio = updateEspacio(id, req.body);
    res.status(200).json(espacio);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado el espacio con id: ${id}`,
  });
};

const deleteEspacioController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteEspacio(id);
  if (eliminado) {
    res.status(200).json({
      message: "Espacio eliminado correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Espacio no encontrado",
  });
};

module.exports = {
  getEspaciosController,
  getEspacioController,
  postEspacioController,
  putEspacioController,
  deleteEspacioController,
};
