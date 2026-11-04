
import { Router } from 'express';

import {
  obtenerPersonas,
  obtenerPersonaPorId,
  crearPersona,
  actualizarPersona,
  eliminarPersona
} from '../controllers/persona.controller.js';

const router = Router();

// Consultar todas las personas
router.get('/', obtenerPersonas);

// Consultar una persona por ID
router.get('/:id', obtenerPersonaPorId);

// Registrar una nueva persona
router.post('/', crearPersona);

// Actualizar una persona
router.put('/:id', actualizarPersona);

// Eliminar una persona
router.delete('/:id', eliminarPersona);

export default router;
