import { Router } from 'express';

import {
  obtenerInscripciones,
  obtenerInscripcionPorId,
  crearInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
} from '../controllers/inscripciones.controller.js';

const router = Router();

// Consultar todas las inscripciones
router.get('/', obtenerInscripciones);

// Consultar una inscripción por ID
router.get('/:id', obtenerInscripcionPorId);

// Registrar una nueva inscripción
router.post('/', crearInscripcion);

// Actualizar una inscripción
router.put('/:id', actualizarInscripcion);

// Eliminar una inscripción
router.delete('/:id', eliminarInscripcion);

export default router;