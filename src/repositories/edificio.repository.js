const Edificio = require("../models/edificio.model");

const getEdificios = async (filtros = {}) => {
  return await Edificio.find(filtros)
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findEdificioById = async (id) => {
  return await Edificio.findById(id)
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEdificiosByPropietario = async (propietarioId) => {
  return await Edificio.find({ propietarioId })
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEdificiosByEmpresa = async (empresaInmobiliariaId) => {
  return await Edificio.find({ empresaInmobiliariaId })
    .populate('propietarioId', 'nombre email');
};

const getEdificiosByCiudad = async (ciudad) => {
  return await Edificio.find({ 'direccion.ciudad': ciudad })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEdificiosByPais = async (pais) => {
  return await Edificio.find({ 'direccion.pais': pais })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEdificiosConAmenidad = async (tipoAmenidad) => {
  return await Edificio.find({ 'amenidades.tipo': tipoAmenidad })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const createEdificio = async (edificioData) => {
  const newEdificio = new Edificio(edificioData);
  return await newEdificio.save();
};

const updateEdificio = async (id, payload) => {
  return await Edificio.findByIdAndUpdate(id, payload, { new: true });
};

const deleteEdificio = async (id) => {
  return await Edificio.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};

const activarEdificio = async (id) => {
  return await Edificio.findByIdAndUpdate(
    id,
    { activo: true },
    { new: true }
  );
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  return await Edificio.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
};

const agregarAmenidad = async (id, amenidad) => {
  return await Edificio.findByIdAndUpdate(
    id,
    { $push: { amenidades: amenidad } },
    { new: true }
  );
};

const eliminarAmenidad = async (id, amenidadId) => {
  return await Edificio.findByIdAndUpdate(
    id,
    { $pull: { amenidades: { _id: amenidadId } } },
    { new: true }
  );
};

const actualizarHorario = async (id, horario) => {
  return await Edificio.findByIdAndUpdate(
    id,
    { horario },
    { new: true }
  );
};

module.exports = {
  getEdificios,
  findEdificioById,
  getEdificiosByPropietario,
  getEdificiosByEmpresa,
  getEdificiosByCiudad,
  getEdificiosByPais,
  getEdificiosConAmenidad,
  createEdificio,
  updateEdificio,
  deleteEdificio,
  activarEdificio,
  actualizarCalificacion,
  agregarAmenidad,
  eliminarAmenidad,
  actualizarHorario
};