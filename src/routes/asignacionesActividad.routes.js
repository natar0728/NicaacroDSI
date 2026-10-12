import { Router } from 'express';

import {
  obtenerAsignacionesActividad,
  obtenerAsignacionActividadPorId,
  crearAsignacionActividad,
  actualizarAsignacionActividad,
  eliminarAsignacionActividad
} from '../controllers/asignacionesActividad.controller.js';

const router = Router();

// Consultar todas las asignaciones de actividad
router.get('/', obtenerAsignacionesActividad);

// Consultar una asignación por ID
router.get('/:id', obtenerAsignacionActividadPorId);

// Registrar una nueva asignación
router.post('/', crearAsignacionActividad);

// Actualizar una asignación
router.put('/:id', actualizarAsignacionActividad);

// Eliminar una asignación
router.delete('/:id', eliminarAsignacionActividad);

export default router;

