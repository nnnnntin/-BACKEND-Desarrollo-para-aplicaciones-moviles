const {
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
  actualizarHorario,
  buscarEdificiosCercanos
} = require("../repositories/edificio.repository");
const { 
  createEdificioSchema, 
  updateEdificioSchema,
  filtrarEdificiosSchema
} = require("../routes/validations/edificio.validation");

const getEdificiosController = async (req, res) => {
  try {
    const edificios = await getEdificios();
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener los edificios", 
      details: error.message 
    });
  }
};

const getEdificioByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const edificio = await findEdificioById(id);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json(edificio);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al buscar el edificio", 
      details: error.message 
    });
  }
};

const getEdificiosByPropietarioController = async (req, res) => {
  const { propietarioId } = req.params;
  try {
    const edificios = await getEdificiosByPropietario(propietarioId);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de propietario inválido", 
        details: `El formato del ID '${propietarioId}' no es válido`
      });
    }
    
    if (error.message && (error.message.includes('no encontrado') || error.message.includes('not found'))) {
      return res.status(404).json({ 
        message: "Propietario no encontrado", 
        details: `No existe un propietario con id: ${propietarioId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener edificios por propietario", 
      details: error.message 
    });
  }
};

const getEdificiosByEmpresaController = async (req, res) => {
  const { empresaId } = req.params;
  try {
    const edificios = await getEdificiosByEmpresa(empresaId);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de empresa inválido", 
        details: `El formato del ID '${empresaId}' no es válido`
      });
    }
    
    if (error.message && (error.message.includes('no encontrada') || error.message.includes('not found'))) {
      return res.status(404).json({ 
        message: "Empresa no encontrada", 
        details: `No existe una empresa inmobiliaria con id: ${empresaId}`
      });
    }
    
    res.status(500).json({ 
      message: "Error al obtener edificios por empresa", 
      details: error.message 
    });
  }
};

const getEdificiosByCiudadController = async (req, res) => {
  const { ciudad } = req.params;
  try {
    const edificios = await getEdificiosByCiudad(ciudad);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener edificios por ciudad", 
      details: error.message 
    });
  }
};

const getEdificiosByPaisController = async (req, res) => {
  const { pais } = req.params;
  try {
    const edificios = await getEdificiosByPais(pais);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener edificios por país", 
      details: error.message 
    });
  }
};

const getEdificiosConAmenidadController = async (req, res) => {
  const { tipoAmenidad } = req.params;
  try {
    const edificios = await getEdificiosConAmenidad(tipoAmenidad);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al obtener edificios con amenidad", 
      details: error.message 
    });
  }
};

const createEdificioController = async (req, res) => {
  const { error, value } = createEdificioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const edificio = await createEdificio(value);
    res.status(201).json({ message: "Edificio creado correctamente", edificio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en modelo", 
        details: errors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: "Error de duplicación", 
        details: `Ya existe un edificio con el mismo ${field}`,
        field
      });
    }
    
    if (error.message && (error.message.includes('propietario no encontrado') || error.message.includes('owner not found'))) {
      return res.status(404).json({ 
        message: "Propietario no encontrado", 
        details: "El propietario especificado no existe"
      });
    }
    
    if (error.message && (error.message.includes('empresa no encontrada') || error.message.includes('company not found'))) {
      return res.status(404).json({ 
        message: "Empresa no encontrada", 
        details: "La empresa inmobiliaria especificada no existe"
      });
    }
    
    if (error.message && error.message.includes('coordenadas')) {
      return res.status(400).json({ 
        message: "Error en coordenadas", 
        details: "Las coordenadas geográficas no son válidas"
      });
    }
    
    res.status(500).json({ 
      message: "Error al crear el edificio", 
      details: error.message 
    });
  }
};

const updateEdificioController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateEdificioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const edificio = await updateEdificio(id, value);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json(edificio);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en modelo", 
        details: errors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: "Error de duplicación", 
        details: `Ya existe un edificio con el mismo ${field}`,
        field
      });
    }
    
    if (error.message && error.message.includes('espacios activos') || error.message.includes('active spaces')) {
      return res.status(400).json({ 
        message: "Edificio con espacios", 
        details: "No se pueden modificar ciertos campos porque el edificio tiene espacios activos"
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar el edificio", 
      details: error.message 
    });
  }
};

const deleteEdificioController = async (req, res) => {
  const { id } = req.params;
  try {
    const edificio = await deleteEdificio(id);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json({ message: "Edificio desactivado correctamente" });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('espacios activos') || error.message.includes('active spaces')) {
      return res.status(400).json({ 
        message: "Edificio con espacios", 
        details: "No se puede desactivar el edificio porque tiene espacios activos"
      });
    }
    
    if (error.message && error.message.includes('reservas pendientes') || error.message.includes('pending bookings')) {
      return res.status(400).json({ 
        message: "Edificio con reservas", 
        details: "No se puede desactivar el edificio porque tiene reservas pendientes"
      });
    }
    
    res.status(500).json({ 
      message: "Error al desactivar el edificio", 
      details: error.message 
    });
  }
};

const activarEdificioController = async (req, res) => {
  const { id } = req.params;
  try {
    const edificio = await activarEdificio(id);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json({ message: "Edificio activado correctamente", edificio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.message && error.message.includes('propietario inactivo') || error.message.includes('owner inactive')) {
      return res.status(400).json({ 
        message: "Propietario inactivo", 
        details: "No se puede activar el edificio porque su propietario está inactivo"
      });
    }
    
    if (error.message && error.message.includes('empresa inactiva') || error.message.includes('company inactive')) {
      return res.status(400).json({ 
        message: "Empresa inactiva", 
        details: "No se puede activar el edificio porque la empresa inmobiliaria está inactiva"
      });
    }
    
    res.status(500).json({ 
      message: "Error al activar el edificio", 
      details: error.message 
    });
  }
};

const actualizarCalificacionController = async (req, res) => {
  const { id } = req.params;
  const { calificacion } = req.body;
  
  if (isNaN(calificacion) || calificacion < 0 || calificacion > 5) {
    return res.status(400).json({ 
      message: "Calificación inválida", 
      details: "Se requiere una calificación válida entre 0 y 5"
    });
  }
  
  try {
    const edificio = await actualizarCalificacion(id, calificacion);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json({ message: "Calificación actualizada correctamente", edificio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar la calificación", 
      details: error.message 
    });
  }
};

const agregarAmenidadController = async (req, res) => {
  const { id } = req.params;
  const { amenidad } = req.body;
  
  if (!amenidad || !amenidad.tipo) {
    return res.status(400).json({ 
      message: "Datos inválidos", 
      details: "Se requiere información de amenidad con un tipo"
    });
  }
  
  try {
    const edificio = await agregarAmenidad(id, amenidad);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json({ message: "Amenidad agregada correctamente", edificio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en datos de amenidad", 
        details: errors
      });
    }
    
    if (error.message && error.message.includes('ya existe') || error.message.includes('already exists')) {
      return res.status(400).json({ 
        message: "Amenidad duplicada", 
        details: "El edificio ya tiene registrada esta amenidad"
      });
    }
    
    res.status(500).json({ 
      message: "Error al agregar amenidad", 
      details: error.message 
    });
  }
};

const eliminarAmenidadController = async (req, res) => {
  const { id, amenidadId } = req.params;
  
  try {
    const edificio = await eliminarAmenidad(id, amenidadId);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json({ message: "Amenidad eliminada correctamente", edificio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      const field = error.path === 'id' ? 'edificio' : 'amenidad';
      return res.status(400).json({ 
        message: `ID de ${field} inválido`, 
        details: `El formato del ID no es válido`
      });
    }
    
    if (error.message && error.message.includes('no encontrada') || error.message.includes('not found')) {
      return res.status(404).json({ 
        message: "Amenidad no encontrada", 
        details: `No se encontró la amenidad con id: ${amenidadId} en este edificio`
      });
    }
    
    res.status(500).json({ 
      message: "Error al eliminar amenidad", 
      details: error.message 
    });
  }
};

const actualizarHorarioController = async (req, res) => {
  const { id } = req.params;
  const { horario } = req.body;
  
  if (!horario || !horario.apertura || !horario.cierre || !horario.diasOperacion) {
    return res.status(400).json({ 
      message: "Datos incompletos", 
      details: "Se requiere un horario completo con apertura, cierre y días de operación"
    });
  }
  
  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horario.apertura) || !horaRegex.test(horario.cierre)) {
    return res.status(400).json({ 
      message: "Formato de hora inválido", 
      details: "Las horas deben tener formato HH:MM (24h)"
    });
  }
  
  const [aperturaHora, aperturaMin] = horario.apertura.split(':').map(Number);
  const [cierreHora, cierreMin] = horario.cierre.split(':').map(Number);
  
  if (aperturaHora > cierreHora || (aperturaHora === cierreHora && aperturaMin >= cierreMin)) {
    return res.status(400).json({ 
      message: "Horario inválido", 
      details: "La hora de apertura debe ser anterior a la hora de cierre"
    });
  }
  
  if (!Array.isArray(horario.diasOperacion) || horario.diasOperacion.length === 0) {
    return res.status(400).json({ 
      message: "Días de operación inválidos", 
      details: "Se requiere al menos un día de operación"
    });
  }
  
  const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const diasInvalidos = horario.diasOperacion.filter(dia => !diasValidos.includes(dia));
  
  if (diasInvalidos.length > 0) {
    return res.status(400).json({ 
      message: "Días no válidos", 
      details: `Los siguientes días no son válidos: ${diasInvalidos.join(', ')}`
    });
  }
  
  try {
    const edificio = await actualizarHorario(id, horario);
    if (!edificio) {
      return res.status(404).json({ message: `No se ha encontrado el edificio con id: ${id}` });
    }
    res.status(200).json({ message: "Horario actualizado correctamente", edificio });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de edificio inválido", 
        details: `El formato del ID '${id}' no es válido`
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación en datos de horario", 
        details: errors
      });
    }
    
    if (error.message && error.message.includes('reservas afectadas') || error.message.includes('affected bookings')) {
      return res.status(400).json({ 
        message: "Reservas afectadas", 
        details: "El cambio de horario afectaría a reservas existentes"
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar horario", 
      details: error.message 
    });
  }
};

const buscarEdificiosCercanosController = async (req, res) => {
  const { lat, lng, distanciaMax } = req.query;
  
  if (!lat || !lng || !distanciaMax || isNaN(lat) || isNaN(lng) || isNaN(distanciaMax)) {
    return res.status(400).json({ 
      message: "Parámetros inválidos", 
      details: "Se requieren coordenadas y distancia máxima válidas"
    });
  }
  
  const latFloat = parseFloat(lat);
  const lngFloat = parseFloat(lng);
  const distFloat = parseFloat(distanciaMax);
  
  if (latFloat < -90 || latFloat > 90) {
    return res.status(400).json({ 
      message: "Latitud fuera de rango", 
      details: "La latitud debe estar entre -90 y 90 grados"
    });
  }
  
  if (lngFloat < -180 || lngFloat > 180) {
    return res.status(400).json({ 
      message: "Longitud fuera de rango", 
      details: "La longitud debe estar entre -180 y 180 grados"
    });
  }
  
  if (distFloat <= 0) {
    return res.status(400).json({ 
      message: "Distancia inválida", 
      details: "La distancia máxima debe ser un valor positivo"
    });
  }
  
  try {
    const edificios = await buscarEdificiosCercanos(latFloat, lngFloat, distFloat);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    
    if (error.message && error.message.includes('coordenadas')) {
      return res.status(400).json({ 
        message: "Error en coordenadas", 
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: "Error al buscar edificios cercanos", 
      details: error.message 
    });
  }
};

const filtrarEdificiosController = async (req, res) => {
  const { error, value } = filtrarEdificiosSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      message: "Error de validación en los filtros", 
      details: error.details[0].message,
      field: error.details[0].context.key
    });
  }
  
  try {
    const filtros = {};
    
    if (value.ciudad) filtros['direccion.ciudad'] = value.ciudad;
    if (value.pais) filtros['direccion.pais'] = value.pais;
    if (value.propietarioId) filtros.propietarioId = value.propietarioId;
    if (value.empresaInmobiliariaId) filtros.empresaInmobiliariaId = value.empresaInmobiliariaId;
    if (value.amenidades) {
      filtros['amenidades.tipo'] = { $in: Array.isArray(value.amenidades) ? value.amenidades : [value.amenidades] };
    }
    if (value.accesibilidad !== undefined) filtros.accesibilidad = value.accesibilidad;
    if (value.estacionamiento !== undefined) filtros.estacionamiento = value.estacionamiento;
    if (value.activo !== undefined) filtros.activo = value.activo;
    
    const edificios = await getEdificios(filtros);
    res.status(200).json(edificios);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Error en formato de ID", 
        details: `El valor '${error.value}' no es válido para el campo '${error.path}'`,
        field: error.path
      });
    }
    
    res.status(500).json({ 
      message: "Error al filtrar edificios", 
      details: error.message 
    });
  }
};

module.exports = {
  getEdificiosController,
  getEdificioByIdController,
  getEdificiosByPropietarioController,
  getEdificiosByEmpresaController,
  getEdificiosByCiudadController,
  getEdificiosByPaisController,
  getEdificiosConAmenidadController,
  createEdificioController,
  updateEdificioController,
  deleteEdificioController,
  activarEdificioController,
  actualizarCalificacionController,
  agregarAmenidadController,
  eliminarAmenidadController,
  actualizarHorarioController,
  buscarEdificiosCercanosController,
  filtrarEdificiosController
};