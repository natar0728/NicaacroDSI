import { Router } from 'express';

import {
  login,
  miPerfil
} from '../controllers/auth.controller.js';

import {
  verificarToken
} from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta pública: recibe usuario y contraseña.
router.post('/login', login);

// Ruta protegida: devuelve los datos del usuario autenticado.
router.get('/me', verificarToken, miPerfil);

export default router;