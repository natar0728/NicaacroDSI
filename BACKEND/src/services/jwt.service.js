import jwt from 'jsonwebtoken';

// Crear un token para el usuario que inició sesión.
export function generarToken(usuario) {
  return jwt.sign(
    {
      tipo: 'access'
    },
    process.env.JWT_SECRET,
    {
      subject: usuario._id.toString(),
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  );
}

// Comprobar la firma y la vigencia del token.
export function validarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256']
  });
}