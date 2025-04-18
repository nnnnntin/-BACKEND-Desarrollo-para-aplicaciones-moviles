const Joi = require("joi");
const {
  getOficinas,
  findOficina,
  saveOficina,
  updateOficina,
  deleteOficina,
} = require("../repositories/oficina.repository");
const {
  createOficinaSchema,
  updateOficinaSchema,
} = require("../routes/validations/oficina.validation");

const getOficinasController = async (req, res) => {
  try {
    const oficinas = await getOficinas();
    res.status(200).json(oficinas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getOficinaController = async (req, res) => {
  const { id } = req.params;
  try {
    const oficina = await findOficina(id);
    if (!oficina) {
      return res.status(404).json({ message: `No se ha encontrado la oficina con id: ${id}` });
    }
    res.status(200).json(oficina);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postOficinaController = async (req, res) => {
  const { error, value } = createOficinaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { nombre, ubicacion, capacidad } = value;
  try {
    await saveOficina(nombre, ubicacion, capacidad);
    res.status(201).json({ message: "Oficina creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putOficinaController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateOficinaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateOficina(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado la oficina con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteOficinaController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteOficina(id);
    res.status(200).json({ message: "Oficina eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getOficinasController,
  getOficinaController,
  postOficinaController,
  putOficinaController,
  deleteOficinaController,
};
