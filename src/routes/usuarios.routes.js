
import { Router } from 'express';

import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuario.controller.js';

const router = Router();

router.get('/', obtenerUsuarios);

router.get('/:id', obtenerUsuarioPorId);

router.post('/', crearUsuario);

router.put('/:id', actualizarUsuario);

router.delete('/:id', eliminarUsuario);

export default router;
