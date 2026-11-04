
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuario.model.js';

const CAMPOS_CREACION = [
  'empleadoId',
  'nombreUsuario',
  'password',
  'rol',
  'estado'
];

const CAMPOS_ACTUALIZACION = [
  'nombreUsuario',
  'password',
  'rol',
  'estado'
];

// Evitar devolver el hash de contraseña
const limpiarUsuario = (usuario) => {
  const datos = usuario.toObject();
  delete datos.passwordHash;
  return datos;
};

// Verificar que un ID tenga formato válido
const idValido = (id) =>
  mongoose.isObjectIdOrHexString(id);

// Evitar campos desconocidos o no permitidos
const validarCampos = (datos, permitidos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return false;
  }

  return Object.keys(datos).every((campo) =>
    permitidos.includes(campo)
  );
};

// Manejo de errores
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'El nombre de usuario o empleado ya está registrado.',
      campos: Object.keys(error.keyPattern || {})
    });
  }

  if (
    error.name === 'ValidationError' ||
    error.name === 'CastError' ||
    error.code === 121
  ) {
    return res.status(400).json({
      success: false,
      message: 'Los datos proporcionados no son válidos.'
    });
  }

  console.error('Error en usuarios:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

// GET /api/usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/usuarios/:id
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no válido.'
      });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/usuarios
export const crearUsuario = async (req, res) => {
  try {
    if (!validarCampos(req.body, CAMPOS_CREACION)) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud contiene campos no permitidos.'
      });
    }

    const {
      empleadoId,
      nombreUsuario,
      password,
      rol,
      estado
    } = req.body;

    if (
      !idValido(empleadoId) ||
      typeof nombreUsuario !== 'string' ||
      typeof password !== 'string' ||
      password.length < 8 ||
      typeof rol !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar empleadoId válido, nombreUsuario, rol y una contraseña de al menos 8 caracteres.'
      });
    }

    // Verificar que el empleado exista
    const empleado = await mongoose.connection.db
      .collection('empleados')
      .findOne({
        _id: new mongoose.Types.ObjectId(empleadoId)
      });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'El empleado asociado no existe.'
      });
    }

    // Generar hash seguro
    const passwordHash = await bcrypt.hash(password, 12);

    const usuario = await Usuario.create({
      empleadoId,
      nombreUsuario,
      passwordHash,
      rol,
      ...(estado !== undefined ? { estado } : {})
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente.',
      data: limpiarUsuario(usuario)
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no válido.'
      });
    }

    if (
      !validarCampos(req.body, CAMPOS_ACTUALIZACION) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos válidos para actualizar.'
      });
    }

    const usuario = await Usuario.findById(req.params.id)
      .select('+passwordHash');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    const { nombreUsuario, password, rol, estado } = req.body;

    if (nombreUsuario !== undefined) {
      if (typeof nombreUsuario !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario debe ser texto.'
        });
      }
      usuario.nombreUsuario = nombreUsuario;
    }

    if (rol !== undefined) {
      usuario.rol = rol;
    }

    if (estado !== undefined) {
      usuario.estado = estado;
    }

    if (password !== undefined) {
      if (
        typeof password !== 'string' ||
        password.length < 8
      ) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres.'
        });
      }

      usuario.passwordHash = await bcrypt.hash(password, 12);
    }

    await usuario.save();

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente.',
      data: limpiarUsuario(usuario)
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/usuarios/:id
export const eliminarUsuario = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no válido.'
      });
    }

    const usuario = await Usuario.findByIdAndDelete(
      req.params.id
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente.'
    });
  } catch (error) {
    return manejarError(error, res);
  }
};
