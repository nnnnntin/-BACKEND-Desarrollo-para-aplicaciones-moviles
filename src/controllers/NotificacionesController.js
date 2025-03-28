const { 
    getNotificaciones, 
    createNotificacion, 
    findNotificacion, 
    updateNotificacion, 
    deleteNotificacion 
  } = require('../storage/NotificacionesStorage');
  
  exports.obtenerNotificaciones = (req, res) => {
    res.status(200).json(getNotificaciones());
  };
  
  exports.obtenerNotificacionPorId = (req, res) => {
    const { id } = req.params;
    const notificacion = findNotificacion(id);
    if (notificacion) {
      res.status(200).json(notificacion);
    } else {
      res.status(404).json({ message: "Notificación no encontrada" });
    }
  };
  
  exports.crearNotificacion = (req, res) => {
    const { mensaje, leido } = req.body;
    createNotificacion(mensaje, leido);
    res.status(201).json({ message: "Notificación creada correctamente" });
  };
  
  exports.actualizarNotificacion = (req, res) => {
    const { id } = req.params;
    const notificacion = updateNotificacion(id, req.body);
    if (notificacion) {
      res.status(200).json(notificacion);
    } else {
      res.status(404).json({ message: "Notificación no encontrada" });
    }
  };
  
  exports.eliminarNotificacion = (req, res) => {
    const { id } = req.params;
    const eliminado = deleteNotificacion(id);
    if (eliminado) {
      res.status(200).json({ message: "Notificación eliminada" });
    } else {
      res.status(404).json({ message: "Notificación no encontrada" });
    }
  };
  