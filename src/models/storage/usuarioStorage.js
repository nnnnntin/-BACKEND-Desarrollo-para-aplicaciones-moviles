const usuarios = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan@example.com",
    rol: "empleado",
  },
];

const getUsuarios = () => usuarios;

const createUsuario = (nombre, email, rol) => {
  const lastUsuario = usuarios[usuarios.length - 1];
  const newUsuario = {
    nombre,
    email,
    rol,
  };
  if (lastUsuario) {
    newUsuario.id = lastUsuario.id + 1;
  } else {
    newUsuario.id = 1;
  }
  usuarios.push(newUsuario);
};

const findUsuario = (id) => {
  return usuarios.find((usuario) => usuario.id == id);
};

const findByIndex = (id) => {
  return usuarios.findIndex((usuario) => usuario.id == id);
};

const updateUsuario = (id, payload) => {
  const index = findByIndex(id);
  if (index >= 0) {
    usuarios[index] = { ...usuarios[index], ...payload };
  }
  return usuarios[index];
};

const deleteUsuario = (id) => {
  const index = findByIndex(id);
  if (index >= 0) {
    usuarios.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  getUsuarios,
  createUsuario,
  findUsuario,
  findByIndex,
  updateUsuario,
  deleteUsuario,
};
