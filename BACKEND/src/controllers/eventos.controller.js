import mongoose from 'mongoose';
import Evento from '../models/eventos.model.js';

// Manejo centralizado de errores del módulo
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un evento con esos datos únicos.',
      campos: Object.keys(error.keyPattern || {})
    });
  }

  if (error.name === 'ValidationError' ||
      error.name === 'CastError' ||
      error.code === 121) {
    return res.status(400).json({
      success: false,
      message: 'Los datos proporcionados no son válidos.',
      error: error.message
    });
  }

  console.error('Error en eventos:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

const idValido = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/eventos
export const obtenerEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: eventos.length,
      data: eventos
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/eventos/:id
export const obtenerEventoPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      data: evento
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/eventos
export const crearEvento = async (req, res) => {
  try {
    const evento = await Evento.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Evento registrado correctamente.',
      data: evento
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/eventos/:id
export const actualizarEvento = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    // Evitar modificar directamente el identificador de MongoDB.
    const { _id, id, createdAt, updatedAt, ...datos } = req.body;

    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado.'
      });
    }

    evento.set(datos);
    await evento.save();

    return res.status(200).json({
      success: true,
      message: 'Evento actualizado correctamente.',
      data: evento
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/eventos/:id
export const eliminarEvento = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const evento = await Evento.findByIdAndDelete(req.params.id);

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Evento eliminado correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};