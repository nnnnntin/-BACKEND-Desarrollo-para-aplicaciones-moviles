const Pago = require("../models/pago.model");

const getPagos = async () => {
  return await Pago.find();
};

const findPago = async (id) => {
  return await Pago.findById(id);
};

const savePago = async (idUsuario, monto, fecha, metodo) => {
  const newPago = new Pago({ idUsuario, monto, fecha, metodo });
  return await newPago.save();
};

const updatePago = async (id, payload) => {
  return await Pago.findByIdAndUpdate(id, payload, { new: true });
};

const deletePago = async (id) => {
  return await Pago.findByIdAndDelete(id);
};

module.exports = {
  getPagos,
  findPago,
  savePago,
  updatePago,
  deletePago,
};
