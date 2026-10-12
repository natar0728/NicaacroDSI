import mongoose from 'mongoose';
import Reservacion from '../models/reservaciones.model.js'; // Asegúrate de que el nombre del archivo coincida

// Manejo centralizado de errores del módulo
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una reservación con esos datos únicos.',
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

  console.error('Error en reservaciones:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

const idValido = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/reservaciones
export const obtenerReservaciones = async (req, res) => {
  try {
    // Si necesitas traer la información de la habitación y la persona, puedes usar:
    // await Reservacion.find().populate('personaId').populate('habitacionId').sort({ createdAt: -1 });
    const reservaciones = await Reservacion.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: reservaciones.length,
      data: reservaciones
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/reservaciones/:id
export const obtenerReservacionPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const reservacion = await Reservacion.findById(req.params.id);

    if (!reservacion) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: reservacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/reservaciones
export const crearReservacion = async (req, res) => {
  try {
    const reservacion = await Reservacion.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Reservación registrada correctamente.',
      data: reservacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/reservaciones/:id
export const actualizarReservacion = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    // Evitar modificar directamente el identificador de MongoDB.
    const { _id, id, createdAt, updatedAt, ...datos } = req.body;

    const reservacion = await Reservacion.findById(req.params.id);

    if (!reservacion) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada.'
      });
    }

    reservacion.set(datos);
    await reservacion.save();

    return res.status(200).json({
      success: true,
      message: 'Reservación actualizada correctamente.',
      data: reservacion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/reservaciones/:id
export const eliminarReservacion = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const reservacion = await Reservacion.findByIdAndDelete(req.params.id);

    if (!reservacion) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reservación eliminada correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};