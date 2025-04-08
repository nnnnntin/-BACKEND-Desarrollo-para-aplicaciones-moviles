const reservas = [
  {
    id: 1,
    idUsuario: 1,
    idOficina: 1,
    fecha: "2025-04-01",
    estado: "pendiente",
  },
];

const getReservas = () => reservas;

const createReserva = (idUsuario, idOficina, fecha, estado) => {
  const lastReserva = reservas[reservas.length - 1];
  const newReserva = {
    idUsuario,
    idOficina,
    fecha,
    estado,
  };
  if (lastReserva) {
    newReserva.id = lastReserva.id + 1;
  } else {
    newReserva.id = 1;
  }
  reservas.push(newReserva);
};

const findReserva = (id) => {
  return reservas.find((reserva) => reserva.id == id);
};

const findByIndex = (id) => {
  return reservas.findIndex((reserva) => reserva.id == id);
};

const updateReserva = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    reservas[index] = { ...reservas[index], ...payload };
  }
  return reservas[index];
};

const deleteReserva = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    reservas.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  getReservas,
  createReserva,
  findReserva,
  findByIndex,
  updateReserva,
  deleteReserva,
};
