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
    mensaje,
    leido,
  };
  if (lastNotificacion) {
    newNotificacion.id = lastNotificacion.id + 1;
  } else {
    newNotificacion.id = 1;
  }
  notificaciones.push(newNotificacion);
};

const findNotificacion = (id) =>
  notificaciones.find((notificacion) => notificacion.id == id);

const findByIndex = (id) =>
  notificaciones.findIndex((notificacion) => notificacion.id == id);

const updateNotificacion = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    notificaciones[index] = { ...notificaciones[index], ...payload };
  }
  return notificaciones[index];
};

const deleteNotificacion = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    notificaciones.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  getNotificaciones,
  createNotificacion,
  findNotificacion,
  findByIndex,
  updateNotificacion,
  deleteNotificacion,
};
