import mongoose from 'mongoose';
import Reservacion from '../models/reservaciones.model.js';
import Persona from '../models/persona.model.js';
import Habitacion from '../models/habitaciones.model.js';
import Evento from '../models/eventos.model.js'; // Asegúrate de que el nombre del archivo coincida

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

async function validarReservacion(datos, id = null, comprobarDisponibilidad = true) {
  if (!idValido(datos.personaId) || !idValido(datos.habitacionId) || (datos.eventoId && !idValido(datos.eventoId))) return 'Seleccione una persona, habitación y evento válidos.';
  const entrada = new Date(datos.fechaEntrada), salida = new Date(datos.fechaSalida);
  if (Number.isNaN(entrada.getTime()) || Number.isNaN(salida.getTime()) || salida <= entrada) return 'La fecha de salida debe ser posterior a la de entrada.';
  if (datos.checkOutReal && !datos.checkInReal) return 'Primero debe registrar el check-in.';
  if (datos.checkOutReal && new Date(datos.checkOutReal) < new Date(datos.checkInReal)) return 'El check-out no puede ser anterior al check-in.';
  if (!comprobarDisponibilidad) return null;
  const [persona, habitacion, evento] = await Promise.all([Persona.findById(datos.personaId), Habitacion.findById(datos.habitacionId), datos.eventoId ? Evento.findById(datos.eventoId) : null]);
  if (!persona || persona.estado !== 'ACTIVA') return 'La persona seleccionada no existe o está inactiva.';
  if (!habitacion) return 'La habitación seleccionada no existe.';
  if (datos.eventoId && !evento) return 'El evento seleccionado no existe.';
  if (!['PENDIENTE', 'CONFIRMADA'].includes(datos.estado)) return null;
  if (habitacion.estado !== 'DISPONIBLE') return 'La habitación no está disponible.';
  const filtro = { habitacionId: datos.habitacionId, estado: { $in: ['PENDIENTE', 'CONFIRMADA'] }, fechaEntrada: { $lt: salida }, fechaSalida: { $gt: entrada } };
  if (id) filtro._id = { $ne: id };
  const registros = await Reservacion.find(filtro).lean();
  const puntos = registros.flatMap(r => [[Math.max(+new Date(r.fechaEntrada), +entrada), 1], [Math.min(+new Date(r.fechaSalida), +salida), -1]]).sort((a,b) => a[0]-b[0] || a[1]-b[1]);
  let ocupacion = 0, maximo = 0;
  for (const [, cambio] of puntos) { ocupacion += cambio; maximo = Math.max(maximo, ocupacion); }
  return maximo >= habitacion.capacidad ? 'No hay cupo disponible en esa habitación para el período indicado.' : null;
}

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
    const error = await validarReservacion(req.body || {});
    if (error) return res.status(400).json({ success: false, message: error });
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
    const cambiaReserva = ['personaId', 'habitacionId', 'eventoId', 'fechaEntrada', 'fechaSalida', 'estado'].some(campo => Object.hasOwn(datos, campo));
    const error = await validarReservacion(reservacion, reservacion._id, cambiaReserva);
    if (error) return res.status(400).json({ success: false, message: error });
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