import { Router } from 'express';

import {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento
} from '../controllers/eventos.controller.js';

const router = Router();

// Consultar todos los eventos
router.get('/', obtenerEventos);

// Consultar un evento por ID
router.get('/:id', obtenerEventoPorId);

// Registrar un nuevo evento
router.post('/', crearEvento);

// Actualizar un evento
router.put('/:id', actualizarEvento);

// Eliminar un evento
router.delete('/:id', eliminarEvento);

export default router;