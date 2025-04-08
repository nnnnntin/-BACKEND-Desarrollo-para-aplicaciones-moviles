const espacios = [
  {
    id: 1,
    nombre: "Sala de Reuniones",
    ubicacion: "Piso 2",
    capacidad: 10,
  },
];

const getEspacios = () => espacios;

const createEspacio = (nombre, ubicacion, capacidad) => {
  const lastEspacio = espacios[espacios.length - 1];
  const newEspacio = {
    nombre,
    ubicacion,
    capacidad,
    completed: false,
  };
  if (lastEspacio) {
    newEspacio.id = lastEspacio.id + 1;
  } else {
    newEspacio.id = 1;
  }
  espacios.push(newEspacio);
};

const findEspacio = (id) => {
  return espacios.find((espacio) => espacio.id == id);
};

const findByIndex = (id) => {
  return espacios.findIndex((espacio) => espacio.id == id);
};

const deleteEspacio = (id) => {
  const indexToBeDeleted = findByIndex(id);
  if (indexToBeDeleted >= 0) {
    espacios.splice(indexToBeDeleted, 1);
    return true;
  }
  return false; 
};


const updateEspacio = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    espacios[index] = { ...espacios[index], ...payload };
  }
  return espacios[index];
};

module.exports = {
  getEspacios,
  createEspacio,
  findEspacio,
  findByIndex,
  deleteEspacio,
  updateEspacio,
};
