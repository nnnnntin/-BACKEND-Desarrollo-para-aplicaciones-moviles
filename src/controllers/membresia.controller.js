const Joi = require("joi");
const {
  getMembresias,
  findMembresia,
  saveMembresia,
  updateMembresia,
  deleteMembresia,
} = require("../repositories/membresia.repository");
const {
  createMembresiaSchema,
  updateMembresiaSchema,
} = require("../routes/validations/membresia.validation");

const getMembresiasController = async (req, res) => {
  try {
    const membresias = await getMembresias();
    res.status(200).json(membresias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getMembresiaController = async (req, res) => {
  const { id } = req.params;
  try {
    const membresia = await findMembresia(id);
    if (!membresia) {
      return res.status(404).json({ message: `No se ha encontrado la membresía con id: ${id}` });
    }
    res.status(200).json(membresia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postMembresiaController = async (req, res) => {
  const { error, value } = createMembresiaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { tipo, beneficios, precio } = value;
  try {
    await saveMembresia(tipo, beneficios, precio);
    res.status(201).json({ message: "Membresía creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putMembresiaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateMembresiaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateMembresia(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado la membresía con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteMembresiaController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteMembresia(id);
    res.status(200).json({ message: "Membresía eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getMembresiasController,
  getMembresiaController,
  postMembresiaController,
  putMembresiaController,
  deleteMembresiaController,
};
