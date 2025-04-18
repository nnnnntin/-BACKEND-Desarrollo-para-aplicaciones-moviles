const Joi = require("joi");
const {
  getResenas,
  findResena,
  saveResena,
  updateResena,
  deleteResena,
} = require("../repositories/resena.repository");
const {
  createResenaSchema,
  updateResenaSchema,
} = require("../routes/validations/resena.validation");

const getResenasController = async (req, res) => {
  try {
    const resenas = await getResenas();
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getResenaController = async (req, res) => {
  const { id } = req.params;
  try {
    const resena = await findResena(id);
    if (!resena) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }
    res.status(200).json(resena);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postResenaController = async (req, res) => {
  const { error, value } = createResenaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { idUsuario, comentario, calificacion } = value;
  try {
    await saveResena(idUsuario, comentario, calificacion);
    res.status(201).json({ message: "Reseña creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putResenaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateResenaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateResena(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado la reseña con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteResenaController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteResena(id);
    res.status(200).json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getResenasController,
  getResenaController,
  postResenaController,
  putResenaController,
  deleteResenaController,
};
