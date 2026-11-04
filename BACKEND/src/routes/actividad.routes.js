import { Router } from 'express';

import {
  obtenerActividades,
  obtenerActividadPorId,
  crearActividad,
  actualizarActividad,
  eliminarActividad
} from '../controllers/actividad.controller.js';

const router = Router();

// Consultar todas las actividades
router.get('/', obtenerActividades);

// Consultar actividad por ID
router.get('/:id', obtenerActividadPorId);

// Crear actividad
router.post('/', crearActividad);

// Actualizar actividad
router.put('/:id', actualizarActividad);

// Desactivar actividad
router.delete('/:id', eliminarActividad);

export default router;
