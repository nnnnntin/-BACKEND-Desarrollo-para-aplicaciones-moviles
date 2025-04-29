const EmpresaInmobiliaria = require("../models/empresaInmobiliaria.model");

const getEmpresasInmobiliarias = async (filtros = {}) => {
  return await EmpresaInmobiliaria.find(filtros)
    .populate('espacios');
};

const findEmpresaInmobiliariaById = async (id) => {
  return await EmpresaInmobiliaria.findById(id)
    .populate('espacios');
};

const getEmpresasByTipo = async (tipo) => {
  return await EmpresaInmobiliaria.find({ tipo, activo: true });
};

const getEmpresasVerificadas = async () => {
  return await EmpresaInmobiliaria.find({ verificado: true, activo: true });
};

const getEmpresasByCiudad = async (ciudad) => {
  return await EmpresaInmobiliaria.find({
    'direccion.ciudad': ciudad,
    activo: true
  });
};

const createEmpresaInmobiliaria = async (empresaData) => {
  const newEmpresa = new EmpresaInmobiliaria(empresaData);
  return await newEmpresa.save();
};

const updateEmpresaInmobiliaria = async (id, payload) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(id, payload, { new: true });
};

const deleteEmpresaInmobiliaria = async (id) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};

const activarEmpresaInmobiliaria = async (id) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
};

const verificarEmpresa = async (id) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { verificado: true },
    { new: true }
  );
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
};

const agregarEspacio = async (id, espacioId) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { $addToSet: { espacios: espacioId } },
    { new: true }
  );
};

const eliminarEspacio = async (id, espacioId) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { $pull: { espacios: espacioId } },
    { new: true }
  );
};

const actualizarMetodoPago = async (id, metodoPago) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { metodoPago },
    { new: true }
  );
};

const actualizarContacto = async (id, contacto) => {
  return await EmpresaInmobiliaria.findByIdAndUpdate(
    id,
    { contacto },
    { new: true }
  );
};

const getEmpresasConMasEspacios = async (limite = 5) => {
  return await EmpresaInmobiliaria.aggregate([
    { $match: { activo: true } },
    { $project: { nombre: 1, tipo: 1, numeroEspacios: { $size: '$espacios' } } },
    { $sort: { numeroEspacios: -1 } },
    { $limit: limite }
  ]);
};

module.exports = {
  getEmpresasInmobiliarias,
  findEmpresaInmobiliariaById,
  getEmpresasByTipo,
  getEmpresasVerificadas,
  getEmpresasByCiudad,
  createEmpresaInmobiliaria,
  updateEmpresaInmobiliaria,
  deleteEmpresaInmobiliaria,
  activarEmpresaInmobiliaria,
  verificarEmpresa,
  actualizarCalificacion,
  agregarEspacio,
  eliminarEspacio,
  actualizarMetodoPago,
  actualizarContacto,
  getEmpresasConMasEspacios
};