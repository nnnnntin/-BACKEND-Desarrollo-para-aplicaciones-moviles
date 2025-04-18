const Notificacion = require("../models/notificacion.model");

const getNotificaciones = async () => {
  return await Notificacion.find();
};

const findNotificacion = async (id) => {
  return await Notificacion.findById(id);
};

const saveNotificacion = async (mensaje, leido = false) => {
  const newNotificacion = new Notificacion({ mensaje, leido });
  return await newNotificacion.save();
};

const updateNotificacion = async (id, payload) => {
  return await Notificacion.findByIdAndUpdate(id, payload, { new: true });
};

const deleteNotificacion = async (id) => {
  return await Notificacion.findByIdAndDelete(id);
};

module.exports = {
  getNotificaciones,
  findNotificacion,
  saveNotificacion,
  updateNotificacion,
  deleteNotificacion,
};
