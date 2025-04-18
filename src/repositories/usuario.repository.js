const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario.model");

const getUsuarios = async () => {
  return await Usuario.find();
};

const findUsuarioByUsername = async (username) => {
  return await Usuario.findOne({ username });
};

const findUsuario = async (id) => {
  return await Usuario.findById(id);
};

const saveUsuario = async (name, username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUsuario = new Usuario({
    name,
    username,
    password: hashedPassword,
  });
  return await newUsuario.save();
};

const isValidPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

const updateUsuario = async (id, payload) => {
  return await Usuario.findByIdAndUpdate(id, payload, { new: true });
};

const deleteUsuario = async (id) => {
  return await Usuario.findByIdAndDelete(id);
};

module.exports = {
  getUsuarios,
  findUsuarioByUsername,
  findUsuario,
  saveUsuario,
  isValidPassword,
  updateUsuario,
  deleteUsuario,
};
