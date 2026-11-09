import { validarToken } from '../services/jwt.service.js';

import {
  buscarPorId,
  cuentaInactiva,
  datosPublicos
} from '../services/auth.service.js';

// Verificar que la petición incluya un JWT válido.
export async function verificarToken(req, res, next) {
  const coincidencia = req.headers.authorization?.match(
    /^Bearer ([^\s]+)$/i
  );

  if (!coincidencia) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido.'
    });
  }

  try {
    const decoded = validarToken(coincidencia[1]);

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      decoded.tipo !== 'access' ||
      typeof decoded.sub !== 'string' ||
      !/^[0-9a-fA-F]{24}$/.test(decoded.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    // Volver a consultar al usuario para comprobar su estado actual.
    const usuario = await buscarPorId(decoded.sub);

    if (cuentaInactiva(usuario)) {
      return res.status(401).json({
        success: false,
        message: 'La cuenta no existe o está inactiva.'
      });
    }

    req.usuario = datosPublicos(usuario);

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Inicie sesión nuevamente.'
      });
    }

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    console.error('Error al verificar el token:', error);

    return res.status(500).json({
      success: false,
      message: 'No fue posible verificar la sesión.'
    });
  }
}

// Restringir una ruta a los roles indicados.
export function permitirRoles(...roles) {
  return (req, res, next) => {
    if (
      !req.usuario ||
      !roles.includes(req.usuario.rol)
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso.'
      });
    }

    return next();
  };
}