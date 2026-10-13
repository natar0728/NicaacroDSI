
import mongoose from 'mongoose';
import Persona from '../models/persona.model.js';

// Manejo centralizado de errores del módulo
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una persona con esos datos únicos.', //validacion de que persona ya existe
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

  console.error('Error en personas:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

const idValido = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/personas
// obtener todas las personas
export const obtenerPersonas = async (req, res) => {
  try {
    const personas = await Persona.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: personas.length,
      data: personas
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/personas/:id
//obtener todas las personas 
export const obtenerPersonaPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const persona = await Persona.findById(req.params.id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: persona
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/personas

export const crearPersona = async (req, res) => {
  try {
    const persona = await Persona.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Persona registrada correctamente.',
      data: persona
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/personas/:id
export const actualizarPersona = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    // Evitar modificar directamente el identificador de MongoDB.
    const { _id, id, createdAt, updatedAt, ...datos } = req.body;

    const persona = await Persona.findById(req.params.id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada.'
      });
    }

    persona.set(datos);
    await persona.save();

    return res.status(200).json({
      success: true,
      message: 'Persona actualizada correctamente.',
      data: persona
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/personas/:id
export const eliminarPersona = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID proporcionado no es válido.'
      });
    }

    const persona = await Persona.findByIdAndDelete(req.params.id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Persona eliminada correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};
