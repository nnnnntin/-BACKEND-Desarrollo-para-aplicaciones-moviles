const Membresia = require("../models/membresia.model");

const getMembresias = async (filtros = {}) => {
  return await Membresia.find({ ...filtros, activo: true });
};

const findMembresiaById = async (id) => {
  return await Membresia.findById(id);
};

const findMembresiaByTipo = async (tipo) => {
  return await Membresia.findOne({ tipo, activo: true });
};

const getMembresiasActivas = async () => {
  return await Membresia.find({ activo: true });
};

const createMembresia = async (membresiaData) => {
  const newMembresia = new Membresia(membresiaData);
  return await newMembresia.save();
};

const updateMembresia = async (id, payload) => {
  return await Membresia.findByIdAndUpdate(id, payload, { new: true });
};

const deleteMembresia = async (id) => {
  // En lugar de eliminar, marcamos como inactiva
  return await Membresia.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};

const activarMembresia = async (id) => {
  return await Membresia.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
};

const getMembresiasOrdenadas = async (campo = 'precio.valor', orden = 1) => {
  const sortOptions = {};
  sortOptions[campo] = orden;
  
  return await Membresia.find({ activo: true }).sort(sortOptions);
};

const findMembresiasWithBeneficio = async (tipoBeneficio) => {
  return await Membresia.find({ 
    activo: true,
    'beneficios.tipo': tipoBeneficio
  });
};

const getMembresiasParaEmpresa = async () => {
  return await Membresia.find({ 
    activo: true,
    tipo: { $in: ['empresarial', 'premium'] }
  });
};

const getMembresiasPorRangoPrecio = async (precioMin, precioMax) => {
  return await Membresia.find({
    activo: true,
    'precio.valor': { $gte: precioMin, $lte: precioMax }
  });
};

const actualizarBeneficios = async (id, beneficios) => {
  return await Membresia.findByIdAndUpdate(
    id,
    { beneficios },
    { new: true }
  );
};

module.exports = {
  getMembresias,
  findMembresiaById,
  findMembresiaByTipo,
  getMembresiasActivas,
  createMembresia,
  updateMembresia,
  deleteMembresia,
  activarMembresia,
  getMembresiasOrdenadas,
  findMembresiasWithBeneficio,
  getMembresiasParaEmpresa,
  getMembresiasPorRangoPrecio,
  actualizarBeneficios
};