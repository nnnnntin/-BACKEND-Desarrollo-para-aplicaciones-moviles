const Reserva = require("../models/reserva.model");

const getReservas = async () => {
  return await Reserva.find();
};

const findReserva = async (id) => {
  return await Reserva.findById(id);
};

const saveReserva = async (idUsuario, idOficina, fecha, estado) => {
  const newReserva = new Reserva({ idUsuario, idOficina, fecha, estado });
  return await newReserva.save();
};

const updateReserva = async (id, payload) => {
  return await Reserva.findByIdAndUpdate(id, payload, { new: true });
};

const deleteReserva = async (id) => {
  return await Reserva.findByIdAndDelete(id);
};

module.exports = {
  getReservas,
  findReserva,
  saveReserva,
  updateReserva,
  deleteReserva,
};
