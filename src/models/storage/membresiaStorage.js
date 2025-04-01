const membresias = [
  {
    id: 1,
    tipo: "Premium",
    beneficios: "Acceso prioritario a reservas",
    precio: 100,
  },
];

const getMembresias = () => membresias;

const createMembresia = (tipo, beneficios, precio) => {
  const lastMembresia = membresias[membresias.length - 1];
  const newMembresia = {
    tipo,
    beneficios,
    precio,
  };
  if (lastMembresia) {
    newMembresia.id = lastMembresia.id + 1;
  } else {
    newMembresia.id = 1;
  }
  membresias.push(newMembresia);
};

const findMembresia = (id) => {
  return membresias.find((membresia) => membresia.id == id);
};

const findByIndex = (id) => {
  return membresias.findIndex((membresia) => membresia.id == id);
};

const updateMembresia = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    membresias[index] = { ...membresias[index], ...payload };
  }
  return membresias[index];
};

const deleteMembresia = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    membresias.splice(index, 1);
    return true;
  }
  return false;

};

module.exports = {
  getMembresias,
  createMembresia,
  findMembresia,
  findByIndex,
  updateMembresia,
  deleteMembresia,
};
