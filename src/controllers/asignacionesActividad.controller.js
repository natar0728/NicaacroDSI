import mongoose from 'mongoose';
import AsignacionActividad from '../models/asignacionesActividad.model.js';

// Manejo centralizado de errores del módulo
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una asignación con esos datos únicos.',
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

  console.error('Error en asignacionesActividad:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

const idValido = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/asignacionesActividad
export const obtenerAsignacionesActividad = async (req, res) => {
  try {
    const asignaciones = await AsignacionActividad.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: asignaciones.length,
      data: asignaciones
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/asignacionesActividad/:id
export const obtenerAsignacionActividadPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const asignacion = await AsignacionActividad.findById(req.params.id);

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: asignacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/asignacionesActividad
export const crearAsignacionActividad = async (req, res) => {
  try {
    const asignacion = await AsignacionActividad.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Asignación registrada correctamente.',
      data: asignacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/asignacionesActividad/:id
export const actualizarAsignacionActividad = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    // Evitar modificar directamente el identificador de MongoDB.
    const { _id, id, createdAt, updatedAt, ...datos } = req.body;

    const asignacion = await AsignacionActividad.findById(req.params.id);

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada.'
      });
    }

    asignacion.set(datos);
    await asignacion.save();

    return res.status(200).json({
      success: true,
      message: 'Asignación actualizada correctamente.',
      data: asignacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/asignacionesActividad/:id
export const eliminarAsignacionActividad = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const asignacion = await AsignacionActividad.findByIdAndDelete(req.params.id);

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Asignación eliminada correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};