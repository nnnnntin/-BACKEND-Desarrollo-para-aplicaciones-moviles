const Joi = require("joi");
const {
  getReservas,
  createReserva,
  findReserva,
  updateReserva,
  deleteReserva,
} = require("../models/reserva.models.js");
const sendEmail = require("../services/mailjet.service.js");

const getReservasController = (req, res) => {
  const { estado, fecha } = req.query;
  let resultado = getReservas();
  if (estado) {
    resultado = resultado.filter((reserva) =>
      reserva.estado.toLowerCase() === estado.toLowerCase()
    );
  }
  if (fecha) {
    resultado = resultado.filter((reserva) => reserva.fecha === fecha);
  }
  res.status(200).json(resultado);
};

const getReservaController = (req, res) => {
  const { id } = req.params;
  const reserva = findReserva(id);
  if (reserva) {
    res.status(200).json(reserva);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la reserva con id: ${id}`,
  });
};

const postReservaController = async (req, res) => {
  const { idUsuario, idOficina, fecha, estado } = req.body;
  createReserva(idUsuario, idOficina, fecha, estado);
  // const response = await sendEmail(`Reserva creada para el usuario: ${idUsuario}`);
  res.status(201).json({
    message: "Reserva creada correctamente",
  });
};

const putReservaController = (req, res) => {
  const { id } = req.params;
  let reserva = findReserva(id);
  if (reserva) {
    reserva = updateReserva(id, req.body);
    res.status(200).json(reserva);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado la reserva con id: ${id}`,
  });
};

const deleteReservaController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteReserva(id);
  if (eliminado) {
    res.status(200).json({
      message: "Reserva eliminada correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Reserva no encontrada",
  });
};

module.exports = {
  getReservasController,
  getReservaController,
  postReservaController,
  putReservaController,
  deleteReservaController,
};
