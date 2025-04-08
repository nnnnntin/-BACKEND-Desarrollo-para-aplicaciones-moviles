const Joi = require("joi");
const {
  getResenas,
  createResena,
  findResena,
  updateResena,
  deleteResena,
} = require("../models/resena.models.js");
const sendEmail = require("../services/mailjet.service.js");

const getResenasController = (req, res) => {
  res.status(200).json(getResenas());
};

const getResenaController = (req, res) => {
  const { id } = req.params;
  const resena = findResena(id);
  if (resena) {
    res.status(200).json(resena);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la reseña con id: ${id}`,
  });
};

const postResenaController = async (req, res) => {
  const { idUsuario, comentario, calificacion } = req.body;
  createResena(idUsuario, comentario, calificacion);
  // const response = await sendEmail(comentario);
  res.status(201).json({
    message: "Reseña creada correctamente",
  });
};

const putResenaController = (req, res) => {
  const { id } = req.params;
  let resena = findResena(id);
  if (resena) {
    resena = updateResena(id, req.body);
    res.status(200).json(resena);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la reseña con id: ${id}`,
  });
};

const deleteResenaController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteResena(id);
  if (eliminado) {
    res.status(200).json({
      message: "Reseña eliminada correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Reseña no encontrada",
  });
};

module.exports = {
  getResenasController,
  getResenaController,
  postResenaController,
  putResenaController,
  deleteResenaController,
};
