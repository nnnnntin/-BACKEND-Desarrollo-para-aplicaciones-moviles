const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario.model");

const getUsuarios = async (filtros = {}) => {
  return await Usuario.find(filtros);
};

const findUsuarioById = async (id) => {
  return await Usuario.findById(id);
};

const findUsuarioByEmail = async (email) => {
  return await Usuario.findOne({ email });
};

const findUsuarioByUsername = async (username) => {
  return await Usuario.findOne({ username });
};

const registerUsuario = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUsuario = new Usuario({
    ...userData,
    password: hashedPassword
  });
  
  return await newUsuario.save();
};

const loginUsuario = async (email, password) => {
  const usuario = await findUsuarioByEmail(email);
  if (!usuario) return null;
  
  const isPasswordValid = await bcrypt.compare(password, usuario.password);
  if (!isPasswordValid) return null;
  
  return usuario;
};

const isValidPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

const updateUsuario = async (id, payload) => {
  // Si el payload incluye password, hashearlo
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  
  return await Usuario.findByIdAndUpdate(id, payload, { new: true });
};

const deleteUsuario = async (id) => {
  return await Usuario.findByIdAndDelete(id);
};

const updateMembresiaUsuario = async (id, membresiaData) => {
  return await Usuario.findByIdAndUpdate(
    id, 
    { membresia: membresiaData }, 
    { new: true }
  );
};

const getUsuariosByTipo = async (tipoUsuario) => {
  return await Usuario.find({ tipoUsuario });
};

const cambiarRolUsuario = async (id, nuevoRol) => {
  return await Usuario.findByIdAndUpdate(
    id,
    { rol: nuevoRol },
    { new: true }
  );
};

module.exports = {
  getUsuarios,
  findUsuarioById,
  findUsuarioByEmail,
  findUsuarioByUsername,
  registerUsuario,
  loginUsuario,
  isValidPassword,
  updateUsuario,
  deleteUsuario,
  updateMembresiaUsuario,
  getUsuariosByTipo,
  cambiarRolUsuario
};