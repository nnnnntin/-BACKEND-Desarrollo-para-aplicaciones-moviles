const Joi = require("joi");
const {
  getEspacios,
  findEspacio,
  saveEspacio,
  updateEspacio,
  deleteEspacio,
} = require("../repositories/espacio.repository");
const {
  createEspacioSchema,
  updateEspacioSchema,
} = require("../routes/validations/espacio.validation");

const getEspaciosController = async (req, res) => {
  try {
    const espacios = await getEspacios();
    res.status(200).json(espacios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getEspacioController = async (req, res) => {
  const { id } = req.params;
  try {
    const espacio = await findEspacio(id);
    if (!espacio) {
      return res.status(404).json({ message: `No se ha encontrado el espacio con id: ${id}` });
    }
    res.status(200).json(espacio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postEspacioController = async (req, res) => {
  const { error, value } = createEspacioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { nombre, ubicacion, capacidad, completed } = value;
  try {
    await saveEspacio(nombre, ubicacion, capacidad, completed);
    res.status(201).json({ message: "Espacio creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putEspacioController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateEspacioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateEspacio(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado el espacio con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteEspacioController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteEspacio(id);
    res.status(200).json({ message: "Espacio eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getEspaciosController,
  getEspacioController,
  postEspacioController,
  putEspacioController,
  deleteEspacioController,
};
