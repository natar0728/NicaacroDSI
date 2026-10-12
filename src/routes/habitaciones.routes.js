import { Router } from 'express';

import {
  obtenerHabitaciones,
  obtenerHabitacionPorId,
  crearHabitacion,
  actualizarHabitacion,
  eliminarHabitacion
} from '../controllers/habitaciones.controller.js';

const router = Router();

// Consultar todas las habitaciones
router.get('/', obtenerHabitaciones);

// Consultar una habitación por ID
router.get('/:id', obtenerHabitacionPorId);

// Registrar una nueva habitación
router.post('/', crearHabitacion);

// Actualizar una habitación
router.put('/:id', actualizarHabitacion);

// Eliminar una habitación
router.delete('/:id', eliminarHabitacion);

export default router;