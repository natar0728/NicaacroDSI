
const {
  validarToken
} = require('../services/jwt.service');

const {
  buscarPorId,
  cuentaInactiva,
  datosPublicos
} = require('../services/auth.service');

async function verificarToken(req, res, next) {
  const authorization = req.headers.authorization;

  const coincidencia =
    authorization?.match(/^Bearer ([^\s]+)$/i);

  if (!coincidencia) {
    return res.status(401).json({
      mensaje: 'Token requerido'
    });
  }

  try {
    // Verificar la firma y vigencia del JWT
    const decoded = validarToken(coincidencia[1]);

    if (
      decoded.tipo !== 'access' ||
      typeof decoded.sub !== 'string' ||
      !/^[0-9a-fA-F]{24}$/.test(decoded.sub)
    ) {
      return res.status(401).json({
        mensaje: 'Token inválido'
      });
    }

    // Consultar usuario con Mongoose
    const usuario = await buscarPorId(decoded.sub);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Usuario no autorizado'
      });
    }

    if (cuentaInactiva(usuario)) {
      return res.status(403).json({
        mensaje: 'Cuenta deshabilitada'
      });
    }

    req.usuario = datosPublicos(usuario);

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'Token expirado'
      });
    }

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        mensaje: 'Token inválido'
      });
    }

    next(error);
  }
}

module.exports = {
  verificarToken
};
