const oficinas = [
  {
    id: 1,
    nombre: "Oficina Central",
    ubicacion: "Av. Principal 123",
    capacidad: 20,
  },
];

const getOficinas = () => oficinas;

const createOficina = (nombre, ubicacion, capacidad) => {
  const lastOficina = oficinas[oficinas.length - 1];
  const newOficina = {
    nombre,
    ubicacion,
    capacidad,
  };
  if (lastOficina) {
    newOficina.id = lastOficina.id + 1;
  } else {
    newOficina.id = 1;
  }
  oficinas.push(newOficina);
};

const findOficina = (id) => {
  return oficinas.find((oficina) => oficina.id == id);
};

const findByIndex = (id) => {
  return oficinas.findIndex((oficina) => oficina.id == id);
};

const updateOficina = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    oficinas[index] = { ...oficinas[index], ...payload };
  }
  return oficinas[index];
};

const deleteOficina = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    oficinas.splice(index, 1);
    return true;
  }
  return false;

};

module.exports = {
  getOficinas,
  createOficina,
  findOficina,
  findByIndex,
  updateOficina,
  deleteOficina,
};
