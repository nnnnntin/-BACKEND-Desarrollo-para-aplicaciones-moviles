const Oficina = require("../models/oficina.model");

const getOficinas = async (filtros = {}) => {
  return await Oficina.find(filtros)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findOficinaById = async (id) => {
  return await Oficina.findById(id)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const findOficinaByCodigo = async (codigo) => {
  return await Oficina.findOne({ codigo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getOficinasByEdificio = async (edificioId) => {
  return await Oficina.find({ 'ubicacion.edificioId': edificioId })
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getOficinasByTipo = async (tipo) => {
  return await Oficina.find({ tipo })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getOficinasByPropietario = async (propietarioId) => {
  return await Oficina.find({ propietarioId })
    .populate('ubicacion.edificioId')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getOficinasByEmpresa = async (empresaInmobiliariaId) => {
  return await Oficina.find({ empresaInmobiliariaId })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email');
};

const createOficina = async (oficinaData) => {
  const newOficina = new Oficina(oficinaData);
  return await newOficina.save();
};

const updateOficina = async (id, payload) => {
  return await Oficina.findByIdAndUpdate(id, payload, { new: true });
};

const deleteOficina = async (id) => {
  return await Oficina.findByIdAndDelete(id);
};

const cambiarEstadoOficina = async (id, nuevoEstado) => {
  return await Oficina.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );
};

const getOficinasByCapacidad = async (capacidadMinima) => {
  return await Oficina.find({ capacidad: { $gte: capacidadMinima } })
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getOficinasByRangoPrecio = async (precioMin, precioMax, tipoPrecio = 'porDia') => {
  const query = {};
  query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };
  
  return await Oficina.find(query)
    .populate('ubicacion.edificioId')
    .populate('propietarioId', 'nombre email')
    .populate('empresaInmobiliariaId', 'nombre');
};

const getOficinasDisponibles = async (fecha, horaInicio, horaFin) => {
  const diasMap = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
  ];

  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    throw new Error(`Fecha inválida: ${fecha}`);
  }
  const diaNombre = diasMap[fechaObj.getUTCDay()];

  return await Oficina.find({
    activo: true,
    "disponibilidad.dias": diaNombre,
    "disponibilidad.horario.apertura": { $lte: horaInicio },
    "disponibilidad.horario.cierre":    { $gte: horaFin }
  })
    .populate("ubicacion.edificioId")
    .populate("propietarioId", "nombre email")
    .populate("empresaInmobiliariaId", "nombre");
};

const actualizarCalificacion = async (id, nuevaCalificacion) => {
  return await Oficina.findByIdAndUpdate(
    id,
    { calificacionPromedio: nuevaCalificacion },
    { new: true }
  );
};

module.exports = {
  getOficinas,
  findOficinaById,
  findOficinaByCodigo,
  getOficinasByEdificio,
  getOficinasByTipo,
  getOficinasByPropietario,
  getOficinasByEmpresa,
  createOficina,
  updateOficina,
  deleteOficina,
  cambiarEstadoOficina,
  getOficinasByCapacidad,
  getOficinasByRangoPrecio,
  getOficinasDisponibles,
  actualizarCalificacion
};