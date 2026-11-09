
/*
 * IMPORTANTE:
 * Cambia 'usuarios.model' por el nombre real
 * del archivo que ya tienes en src/models/.
 */
const Usuario = require('../models/usuarios.model');

// Buscar usuario para iniciar sesión
async function buscarPorNombreUsuario(nombreUsuario) {
  return await Usuario.findOne({
    nombreUsuario
  }).select('+passwordHash');
}

// Buscar usuario mediante el ID del JWT
async function buscarPorId(id) {
  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id)
  ) {
    return null;
  }

  return await Usuario.findById(id);
}

// Verificar si el usuario está deshabilitado
function cuentaInactiva(usuario) {
  if (!usuario) return true;

  // Ajustar a los estados reales de Nicaacro
  const estado = String(usuario.estado || '')
    .toUpperCase();

  return (
    usuario.activo === false ||
    [
      'INACTIVO',
      'INACTIVA',
      'BLOQUEADO',
      'BLOQUEADA'
    ].includes(estado)
  );
}

// Datos seguros para devolver al frontend
function datosPublicos(usuario) {
  return {
    id: usuario._id.toString(),
    nombreUsuario: usuario.nombreUsuario,
    empleadoId: usuario.empleadoId
      ? usuario.empleadoId.toString()
      : null
  };
}

module.exports = {
  buscarPorNombreUsuario,
  buscarPorId,
  cuentaInactiva,
  datosPublicos
};
