import Usuario from '../models/usuario.model.js';

// Buscar el usuario y obtener también el hash de su contraseña.
export function buscarPorNombreUsuario(nombreUsuario) {
  return Usuario.findOne({ nombreUsuario }).select('+passwordHash');
}

// Buscar al usuario a partir del ID guardado en el token.
export function buscarPorId(id) {
  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id)
  ) {
    return null;
  }

  return Usuario.findById(id);
}

// Comprobar si la cuenta existe y está activa.
export function cuentaInactiva(usuario) {
  return !usuario || usuario.estado !== 'ACTIVO';
}

// Devolver únicamente los datos que puede conocer el frontend.
export function datosPublicos(usuario) {
  return {
    id: usuario._id.toString(),
    nombreUsuario: usuario.nombreUsuario,
    empleadoId: usuario.empleadoId
      ? usuario.empleadoId.toString()
      : null,
    rol: usuario.rol,
    estado: usuario.estado
  };
}