const Espacio = require("../models/espacio.model");

const getEspacios = async (filtros = {}) => {
  return await Espacio.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findEspacioById = async (id) => {
  return await Espacio.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEspaciosByEdificio = async (edificioId) => {
  return await Espacio.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEspaciosByTipo = async (tipo) => {
  return await Espacio.find({ tipo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEspaciosByPropietario = async (propietarioId) => {
  return await Espacio.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEspaciosByEmpresa = async (empresaInmobiliariaId) => {
  return await Espacio.find({ empresaInmobiliariaId })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email');
};

const createEspacio = async (espacioData) => {
  const newEspacio = new Espacio(espacioData);
  return await newEspacio.save();
};

const updateEspacio = async (id, payload) => {
  return await Espacio.findByIdAndUpdate(id, payload, { new: true });
};

const deleteEspacio = async (id) => {
  return await Espacio.findByIdAndDelete(id);
};

const cambiarEstadoEspacio = async (id, nuevoEstado) => {
  return await Espacio.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const getEspaciosDisponibles = async (tipo, fecha, horaInicio, horaFin) => {
  // Esta función es más compleja, necesitaría integrarse con el repository de Disponibilidad
  // para verificar las franjas horarias disponibles
  const filtrosBase = { 
    tipo, 
    estado: 'disponible',
    activo: true
  };
  
  return await Espacio.find(filtrosBase)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getEspaciosByAmenidades = async (amenidades) => {
  return await Espacio.find({ amenidades: { $all: amenidades } })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

module.exports = {
  getEspacios,
  findEspacioById,
  getEspaciosByEdificio,
  getEspaciosByTipo,
  getEspaciosByPropietario,
  getEspaciosByEmpresa,
  createEspacio,
  updateEspacio,
  deleteEspacio,
  cambiarEstadoEspacio,
  getEspaciosDisponibles,
  getEspaciosByAmenidades
};