const Joi = require("joi");
const {
  getPagos,
  createPago,
  findPago,
  updatePago,
  deletePago,
} = require("../models/storage/pagoStorage.js");
const sendEmail = require("../services/mailjet.service.js");

const getPagosController = (req, res) => {
  res.status(200).json(getPagos());
};

const getPagoController = (req, res) => {
  const { id } = req.params;
  const pago = findPago(id);
  if (pago) {
    res.status(200).json(pago);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado el pago con id: ${id}`,
  });
};

const postPagoController = async (req, res) => {
  const { idUsuario, monto, fecha, metodo } = req.body;
  createPago(idUsuario, monto, fecha, metodo);
  // const response = await sendEmail(monto);
  res.status(201).json({
    message: "Pago creado correctamente",
  });
};

const putPagoController = (req, res) => {
  const { id } = req.params;
  let pago = findPago(id);
  if (pago) {
    pago = updatePago(id, req.body);
    res.status(200).json(pago);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado el pago con id: ${id}`,
  });
};

const deletePagoController = (req, res) => {
  const { id } = req.params;
  const eliminado = deletePago(id);
  if (eliminado) {
    res.status(200).json({
      message: "Pago eliminado correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Pago no encontrado",
  });
};

module.exports = {
  getPagosController,
  getPagoController,
  postPagoController,
  putPagoController,
  deletePagoController,
};
