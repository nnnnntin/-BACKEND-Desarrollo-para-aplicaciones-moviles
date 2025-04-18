const Joi = require("joi");
const {
  getUsuarios,
  findUsuario,
  saveUsuario,
  updateUsuario,
  deleteUsuario,
} = require("../repositories/usuario.repository");
const { signupSchema, updateUserSchema } = require("../routes/validations/usuario.validation");

const getUsuariosController = async (req, res) => {
  try {
    const usuarios = await getUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getUsuarioController = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await findUsuario(id);
    if (!usuario) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${id}` });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postUsuarioController = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { name, username, password } = value;
  try {
    await saveUsuario(name, username, password);
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putUsuarioController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateUsuario(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado el usuario con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteUsuarioController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUsuario(id);
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getUsuariosController,
  getUsuarioController,
  postUsuarioController,
  putUsuarioController,
  deleteUsuarioController,
};
