const resenas = [
  {
    id: 1,
    idUsuario: 1,
    comentario: "Excelente servicio",
    calificacion: 5,
  },
];

const getResenas = () => resenas;

const createResena = (idUsuario, comentario, calificacion) => {
  const lastResena = resenas[resenas.length - 1];
  const newResena = {
    idUsuario,
    comentario,
    calificacion,
  };
  if (lastResena) {
    newResena.id = lastResena.id + 1;
  } else {
    newResena.id = 1;
  }
  resenas.push(newResena);
};

const findResena = (id) => {
  return resenas.find((resena) => resena.id == id);
};

const findByIndex = (id) => {
  return resenas.findIndex((resena) => resena.id == id);
};

const updateResena = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    resenas[index] = { ...resenas[index], ...payload };
  }
  return resenas[index];
};

const deleteResena = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    resenas.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  getResenas,
  createResena,
  findResena,
  findByIndex,
  updateResena,
  deleteResena,
};
