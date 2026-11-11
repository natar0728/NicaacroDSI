import jwt from 'jsonwebtoken';

export function generarToken(usuario) {
  return jwt.sign({ tipo: 'access' }, process.env.JWT_SECRET, {
    subject: usuario._id.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256',
    ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
    ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {})
  });
}
export function validarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
    ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {})
  });
}
