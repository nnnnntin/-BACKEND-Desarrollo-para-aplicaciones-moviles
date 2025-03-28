const notificaciones = [
    {
      id: 1,
      mensaje: "Nueva reserva solicitada",
      leido: false,
    },
  ];
  
  const getNotificaciones = () => notificaciones;
  
  const createNotificacion = (mensaje, leido = false) => {
    const lastNotificacion = notificaciones[notificaciones.length - 1];
    const newNotificacion = {
      id: lastNotificacion ? lastNotificacion.id + 1 : 1,
      mensaje,
      leido,
    };
    notificaciones.push(newNotificacion);
  };
  
  const findNotificacion = (id) =>
    notificaciones.find((notificacion) => notificacion.id == id);
  
  const updateNotificacion = (id, payload) => {
    const index = notificaciones.findIndex((notificacion) => notificacion.id == id);
    if (index >= 0) {
      notificaciones[index] = { ...notificaciones[index], ...payload };
      return notificaciones[index];
    }
    return null;
  };
  
  const deleteNotificacion = (id) => {
    const index = notificaciones.findIndex((notificacion) => notificacion.id == id);
    if (index >= 0) {
      return notificaciones.splice(index, 1);
    }
    return null;
  };
  
  module.exports = {
    getNotificaciones,
    createNotificacion,
    findNotificacion,
    updateNotificacion,
    deleteNotificacion,
  };
  