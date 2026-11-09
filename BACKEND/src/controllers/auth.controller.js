import bcrypt from 'bcrypt';

import {
  buscarPorNombreUsuario,
  cuentaInactiva,
  datosPublicos
} from '../services/auth.service.js';

import { generarToken } from '../services/jwt.service.js';

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { nombreUsuario, password } = req.body || {};

    if (
      typeof nombreUsuario !== 'string' ||
      !nombreUsuario.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar usuario y contraseña.'
      });
    }

    const usuario = await buscarPorNombreUsuario(
      nombreUsuario.trim()
    );

    // Comprobar que el usuario exista y que la contraseña coincida.
    if (
      !usuario ||
      typeof usuario.passwordHash !== 'string' ||
      !await bcrypt.compare(password, usuario.passwordHash)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos.'
      });
    }

    if (cuentaInactiva(usuario)) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está inactiva.'
      });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión correcto.',
      data: {
        token,
        usuario: datosPublicos(usuario)
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    return res.status(500).json({
      success: false,
      message: 'No fue posible iniciar sesión.'
    });
  }
}

// GET /api/auth/me
export function miPerfil(req, res) {
  return res.status(200).json({
    success: true,
    data: req.usuario
  });
}