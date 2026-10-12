import mongoose from 'mongoose';
import Inscripcion from '../models/inscripciones.model.js'; 

// Manejo centralizado de errores del módulo
const manejarError = (error, res) => {
  // El código 11000 se disparará si se viola el índice único 'uq_evento_persona'
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una inscripción con esos datos únicos (La persona ya está inscrita en este evento).',
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

  console.error('Error en inscripciones:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

const idValido = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/inscripciones
export const obtenerInscripciones = async (req, res) => {
  try {
    // Si en el futuro necesitas los datos completos del evento y la persona, 
    // puedes usar: await Inscripcion.find().populate('eventoId').populate('personaId').sort({ createdAt: -1 });
    const inscripciones = await Inscripcion.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: inscripciones.length,
      data: inscripciones
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/inscripciones/:id
export const obtenerInscripcionPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const inscripcion = await Inscripcion.findById(req.params.id);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: inscripcion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/inscripciones
export const crearInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Inscripción registrada correctamente.',
      data: inscripcion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/inscripciones/:id
export const actualizarInscripcion = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    // Evitar modificar directamente el identificador de MongoDB.
    const { _id, id, createdAt, updatedAt, ...datos } = req.body;

    const inscripcion = await Inscripcion.findById(req.params.id);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada.'
      });
    }

    inscripcion.set(datos);
    await inscripcion.save();

    return res.status(200).json({
      success: true,
      message: 'Inscripción actualizada correctamente.',
      data: inscripcion
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/inscripciones/:id
export const eliminarInscripcion = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const inscripcion = await Inscripcion.findByIdAndDelete(req.params.id);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inscripción eliminada correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};