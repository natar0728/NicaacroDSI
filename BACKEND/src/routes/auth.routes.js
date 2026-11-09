
const express = require('express');

const router = express.Router();

const {
  login,
  miPerfil
} = require('../controllers/auth.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

// Ruta pública para iniciar sesión
router.post('/login', login);

// Ruta protegida para validar la sesión
router.get('/me', verificarToken, miPerfil);

module.exports = router;
