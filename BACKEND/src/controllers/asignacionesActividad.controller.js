import mongoose from 'mongoose';
import AsignacionActividad from '../models/asignacionesActividad.model.js';
import Empleado from '../models/empleado.model.js';
import Evento from '../models/eventos.model.js';
import Actividad from '../models/actividad.model.js';

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
async function validarAsignacion(datos, id = null, comprobarReferencias = true) {
  if (![datos.eventoId, datos.empleadoId, datos.actividadId].every(idValido)) return 'Seleccione un evento, empleado y actividad válidos.';
  if (!datos.fecha || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(datos.horaInicio || '') || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(datos.horaFin || '') || datos.horaFin <= datos.horaInicio) return 'Indique una fecha y un horario válido.';
  if (!comprobarReferencias) return null;
  const [evento, actividad, empleado] = await Promise.all([Evento.findById(datos.eventoId), Actividad.findById(datos.actividadId), Empleado.findOne({ $or: [{ _id: datos.empleadoId }, { personaId: datos.empleadoId }] })]);
  if (!evento || evento.estado === 'CANCELADO') return 'El evento seleccionado no existe o está cancelado.';
  if (!actividad || actividad.estado !== 'ACTIVA') return 'La actividad seleccionada no existe o está inactiva.';
  if (!empleado || empleado.estado !== 'ACTIVO') return 'El empleado seleccionado no existe o está inactivo.';
  const fecha = new Date(datos.fecha);
  if (Number.isNaN(+fecha) || fecha < new Date(evento.fechaInicio) || fecha > new Date(evento.fechaFin)) return 'La fecha debe estar dentro del período del evento.';
  const filtro = { empleadoId: { $in: [empleado._id, empleado.personaId] }, fecha, estado: { $ne: 'CANCELADA' }, horaInicio: { $lt: datos.horaFin }, horaFin: { $gt: datos.horaInicio } };
  if (id) filtro._id = { $ne: id };
  if (datos.estado !== 'CANCELADA' && await AsignacionActividad.exists(filtro)) return 'El empleado ya tiene una actividad en ese horario.';
  return null;
}

// GET /api/asignacionesActividad
export const obtenerAsignacionesActividad = async (req, res) => {
  try {
    let filtro = {};
    if (req.usuario?.rol === 'STAFF') {
      const empleado = await Empleado.findById(req.usuario.empleadoId);
      if (!empleado) return res.status(200).json({ success: true, total: 0, data: [] });
      // Se admiten registros históricos vinculados tanto a Persona como a Empleado.
      filtro = { empleadoId: { $in: [empleado._id, empleado.personaId] } };
    }
    const asignaciones = await AsignacionActividad.find(filtro).sort({ createdAt: -1 });

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
    const error = await validarAsignacion(req.body || {});
    if (error) return res.status(400).json({ success: false, message: error });
    const asignacion = await AsignacionActividad.create({ ...req.body, createdByUsuarioId: req.usuario.id });

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

    delete datos.createdByUsuarioId;
    asignacion.set(datos);
    const cambiaHorario = ['eventoId', 'empleadoId', 'actividadId', 'fecha', 'horaInicio', 'horaFin'].some(campo => Object.hasOwn(datos, campo));
    const error = await validarAsignacion(asignacion, asignacion._id, cambiaHorario);
    if (error) return res.status(400).json({ success: false, message: error });
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