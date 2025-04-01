const Joi = require("joi");
const {
  getNotificaciones,
  createNotificacion,
  findNotificacion,
  updateNotificacion,
  deleteNotificacion,
} = require("../models/storage/notificacionStorage.js");
const sendEmail = require("../services/mailjet.service.js");

const getNotificacionesController = (req, res) => {
  res.status(200).json(getNotificaciones());
};

const getNotificacionController = (req, res) => {
  const { id } = req.params;
  const notificacion = findNotificacion(id);
  if (notificacion) {
    res.status(200).json(notificacion);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la notificación con id: ${id}`,
  });
};

const postNotificacionController = async (req, res) => {
  const { mensaje, leido } = req.body;
  createNotificacion(mensaje, leido);
  // const response = await sendEmail(mensaje);
  res.status(201).json({
    message: "Notificación creada correctamente",
  });
};

const putNotificacionController = (req, res) => {
  const { id } = req.params;
  let notificacion = findNotificacion(id);
  if (notificacion) {
    notificacion = updateNotificacion(id, req.body);
    res.status(200).json(notificacion);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la notificación con id: ${id}`,
  });
};

const deleteNotificacionController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteNotificacion(id);
  if (eliminado) {
    res.status(200).json({
      message: "Notificación eliminada correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Notificación no encontrada",
  });
};

module.exports = {
  getNotificacionesController,
  getNotificacionController,
  postNotificacionController,
  putNotificacionController,
  deleteNotificacionController,
};
