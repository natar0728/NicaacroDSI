import { Router } from 'express';

import {
  obtenerReservaciones,
  obtenerReservacionPorId,
  crearReservacion,
  actualizarReservacion,
  eliminarReservacion
} from '../controllers/reservaciones.controller.js';

const router = Router();

// Consultar todas las reservaciones
router.get('/', obtenerReservaciones);

// Consultar una reservación por ID
router.get('/:id', obtenerReservacionPorId);

// Registrar una nueva reservación
router.post('/', crearReservacion);

// Actualizar una reservación
router.put('/:id', actualizarReservacion);

// Eliminar una reservación
router.delete('/:id', eliminarReservacion);

export default router;