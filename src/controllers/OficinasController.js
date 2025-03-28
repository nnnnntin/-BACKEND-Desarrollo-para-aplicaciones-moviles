const { 
    getOficinas, 
    createOficina, 
    findOficina, 
    updateOficina, 
    deleteOficina 
  } = require('../storage/OficinasStorage');
  
  exports.obtenerOficinas = (req, res) => {
    const { nombre } = req.query;
    let resultado = getOficinas();
    if (nombre) {
      resultado = resultado.filter(oficina =>
        oficina.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
    }
    res.status(200).json(resultado);
  };
  
  exports.obtenerOficinaPorId = (req, res) => {
    const { id } = req.params;
    const oficina = findOficina(id);
    if (oficina) {
      res.status(200).json(oficina);
    } else {
      res.status(404).json({ message: "Oficina no encontrada" });
    }
  };
  
  exports.crearOficina = (req, res) => {
    const { nombre, ubicacion, capacidad } = req.body;
    createOficina(nombre, ubicacion, capacidad);
    res.status(201).json({ message: "Oficina creada correctamente" });
  };
  
  exports.actualizarOficina = (req, res) => {
    const { id } = req.params;
    const oficina = updateOficina(id, req.body);
    if (oficina) {
      res.status(200).json(oficina);
    } else {
      res.status(404).json({ message: "Oficina no encontrada" });
    }
  };
  
  exports.eliminarOficina = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteOficina(id);
    if (eliminado) {
      res.status(200).json({ message: "Oficina eliminada" });
    } else {
      res.status(404).json({ message: "Oficina no encontrada" });
    }
  };
  