const Joi = require("joi");
const {
  getUsuarios,
  createUsuario,
  findUsuario,
  updateUsuario,
  deleteUsuario,
} = require("../models/storage/usuarioStorage.js");
const sendEmail = require("../services/mailjet.service.js");

const getUsuariosController = (req, res) => {
  res.status(200).json(getUsuarios());
};

const getUsuarioController = (req, res) => {
  const { id } = req.params;
  const usuario = findUsuario(id);
  if (usuario) {
    res.status(200).json(usuario);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado el usuario con id: ${id}`,
  });
};

const postUsuarioController = async (req, res) => {
  const { nombre, email, rol } = req.body;
  createUsuario(nombre, email, rol);
  // const response = await sendEmail(email);
  res.status(201).json({
    message: "Usuario creado correctamente",
  });
};

const putUsuarioController = (req, res) => {
  const { id } = req.params;
  let usuario = findUsuario(id);
  if (usuario) {
    usuario = updateUsuario(id, req.body);
    res.status(200).json(usuario);
    return;
  }
  res.status(404).json({
    message: `No se ha encontrado el usuario con id: ${id}`,
  });
};

const deleteUsuarioController = (req, res) => {
  const { id } = req.params;
  const eliminado = deleteUsuario(id);
  if (eliminado) {
    res.status(200).json({
      message: "Usuario eliminado correctamente",
    });
    return;
  }
  res.status(404).json({
    message: "Usuario no encontrado",
  });
};

module.exports = {
  getUsuariosController,
  getUsuarioController,
  postUsuarioController,
  putUsuarioController,
  deleteUsuarioController,
};
