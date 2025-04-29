const Pago = require("../models/pago.model");

const getPagos = async (filtros = {}) => {
  return await Pago.find(filtros)
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
};

const findPagoById = async (id) => {
  return await Pago.findById(id)
    .populate('usuarioId', 'nombre email')
    .populate('facturaId');
};

const getPagosByUsuario = async (usuarioId) => {
  return await Pago.find({ usuarioId })
    .populate('facturaId')
    .sort({ fecha: -1 });
};

const getPagosPorConcepto = async (conceptoPago) => {
  return await Pago.find({ conceptoPago })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
};

const getPagosPorEstado = async (estado) => {
  return await Pago.find({ estado })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
};

const getPagosPorEntidad = async (tipoEntidad, entidadId) => {
  return await Pago.find({
    'entidadRelacionada.tipo': tipoEntidad,
    'entidadRelacionada.id': entidadId
  })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ fecha: -1 });
};

const createPago = async (pagoData) => {
  const newPago = new Pago(pagoData);
  return await newPago.save();
};

const updatePago = async (id, payload) => {
  return await Pago.findByIdAndUpdate(id, payload, { new: true });
};

const deletePago = async (id) => {
  return await Pago.findByIdAndDelete(id);
};

const cambiarEstadoPago = async (id, nuevoEstado) => {
  return await Pago.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const completarPago = async (id, comprobante = null) => {
  const actualizacion = {
    estado: 'completado'
  };
  
  if (comprobante) {
    actualizacion.comprobante = comprobante;
  }
  
  return await Pago.findByIdAndUpdate(id, actualizacion, { new: true });
};

const reembolsarPago = async (id, motivoReembolso) => {
  return await Pago.findByIdAndUpdate(
    id,
    { 
      estado: 'reembolsado',
      motivoReembolso
    },
    { new: true }
  );
};

const vincularFactura = async (id, facturaId) => {
  return await Pago.findByIdAndUpdate(
    id,
    { facturaId },
    { new: true }
  );
};

const getPagosPorRangoMontos = async (montoMin, montoMax) => {
  return await Pago.find({
    monto: { $gte: montoMin, $lte: montoMax }
  })
    .populate('usuarioId', 'nombre email')
    .populate('facturaId')
    .sort({ monto: -1 });
};

module.exports = {
  getPagos,
  findPagoById,
  getPagosByUsuario,
  getPagosPorConcepto,
  getPagosPorEstado,
  getPagosPorEntidad,
  createPago,
  updatePago,
  deletePago,
  cambiarEstadoPago,
  completarPago,
  reembolsarPago,
  vincularFactura,
  getPagosPorRangoMontos
};