const pagos = [
  {
    id: 1,
    idUsuario: 1,
    monto: 150,
    fecha: "2025-04-01",
    metodo: "Tarjeta",
  },
];

const getPagos = () => pagos;

const createPago = (idUsuario, monto, fecha, metodo) => {
  const lastPago = pagos[pagos.length - 1];
  const newPago = {
    idUsuario,
    monto,
    fecha,
    metodo,
  };
  if (lastPago) {
    newPago.id = lastPago.id + 1;
  } else {
    newPago.id = 1;
  }
  pagos.push(newPago);
};

const findPago = (id) => {
  return pagos.find((pago) => pago.id == id);
};

const findByIndex = (id) => {
  return pagos.findIndex((pago) => pago.id == id);
};

const updatePago = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    pagos[index] = { ...pagos[index], ...payload };
  }
  return pagos[index];
};

const deletePago = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    pagos.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  getPagos,
  createPago,
  findPago,
  findByIndex,
  updatePago,
  deletePago,
};
