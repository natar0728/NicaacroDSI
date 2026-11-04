import mongoose from 'mongoose';
import Habitacion from '../models/habitaciones.model.js';

// Manejo centralizado de errores del módulo
const manejarError = (error, res) => {
  // El código 11000 se disparará si se viola el índice único 'uq_habitacion_codigo'
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una habitación con ese código u otros datos únicos.',
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

  console.error('Error en habitaciones:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

const idValido = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/habitaciones
export const obtenerHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: habitaciones.length,
      data: habitaciones
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/habitaciones/:id
export const obtenerHabitacionPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const habitacion = await Habitacion.findById(req.params.id);

    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/habitaciones
export const crearHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Habitación registrada correctamente.',
      data: habitacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/habitaciones/:id
export const actualizarHabitacion = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    // Evitar modificar directamente el identificador de MongoDB.
    const { _id, id, createdAt, updatedAt, ...datos } = req.body;

    const habitacion = await Habitacion.findById(req.params.id);

    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada.'
      });
    }

    habitacion.set(datos);
    await habitacion.save();

    return res.status(200).json({
      success: true,
      message: 'Habitación actualizada correctamente.',
      data: habitacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/habitaciones/:id
export const eliminarHabitacion = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const habitacion = await Habitacion.findByIdAndDelete(req.params.id);

    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Habitación eliminada correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};