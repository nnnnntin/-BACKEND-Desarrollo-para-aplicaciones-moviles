const Joi = require("joi");
const {
  getNotificaciones,
  findNotificacion,
  saveNotificacion,
  updateNotificacion,
  deleteNotificacion,
} = require("../repositories/notificacion.repository");
const {
  createNotificacionSchema,
  updateNotificacionSchema,
} = require("../routes/validations/notificacion.validation");

const getNotificacionesController = async (req, res) => {
  try {
    const notificaciones = await getNotificaciones();
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getNotificacionController = async (req, res) => {
  const { id } = req.params;
  try {
    const notificacion = await findNotificacion(id);
    if (!notificacion) {
      return res.status(404).json({ message: `No se ha encontrado la notificación con id: ${id}` });
    }
    res.status(200).json(notificacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postNotificacionController = async (req, res) => {
  const { error, value } = createNotificacionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { mensaje, leido } = value;
  try {
    await saveNotificacion(mensaje, leido);
    res.status(201).json({ message: "Notificación creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putNotificacionController = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateNotificacionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const updated = await updateNotificacion(id, value);
    if (!updated) {
      return res.status(404).json({ message: `No se ha encontrado la notificación con id: ${id}` });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteNotificacionController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteNotificacion(id);
    res.status(200).json({ message: "Notificación eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getNotificacionesController,
  getNotificacionController,
  postNotificacionController,
  putNotificacionController,
  deleteNotificacionController,
};
