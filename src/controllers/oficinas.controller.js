const Joi = require("joi");
const {
  getOficinas,
  createOficina,
  findOficina,
  updateOficina,
  deleteOficina,
} = require("../models/storage/oficinaStorage.js");
const sendEmail = require("../services/mailjet.service.js");

const getOficinasController = (req, res) => {
  const { nombre } = req.query;
  let resultado = getOficinas();
  if (nombre) {
    resultado = resultado.filter((oficina) =>
      oficina.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }
  res.status(200).json(resultado);
};

const getOficinaController = (req, res) => {
  const { id } = req.params;
  const oficina = findOficina(id);
  if (oficina) {
    res.status(200).json(oficina);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la oficina con id: ${id}`,
  });
};

const postOficinaController = async (req, res) => {
  const { nombre, ubicacion, capacidad } = req.body;
  createOficina(nombre, ubicacion, capacidad);
  // const response = await sendEmail(nombre);
  res.status(201).json({
    message: "Oficina creada correctamente",
  });
};

const putOficinaController = (req, res) => {
  const { id } = req.params;
  let oficina = findOficina(id);
  if (oficina) {
    oficina = updateOficina(id, req.body);
    res.status(200).json(oficina);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la oficina con id: ${id}`,
  });
};

const deleteOficinaController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteOficina(id);
  if (eliminado) {
    res.status(200).json({
      message: "Oficina eliminada correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Oficina no encontrada",
  });
};

module.exports = {
  getOficinasController,
  getOficinaController,
  postOficinaController,
  putOficinaController,
  deleteOficinaController,
};
