
import mongoose from 'mongoose';
import Empleado from '../models/empleado.model.js';
import Persona from '../models/persona.model.js';
import CategoriaEmpleado from '../models/categoriaEmpleado.model.js';

const CAMPOS_CREACION = [
  'numeroEmpleado',
  'personaId',
  'categoriaEmpleadoId',
  'fechaIngreso',
  'estado'
];

const CAMPOS_ACTUALIZACION = [
  'numeroEmpleado',
  'categoriaEmpleadoId',
  'fechaIngreso',
  'estado'
];

const idValido = (id) =>
  mongoose.isObjectIdOrHexString(id);

// Validar campos recibidos
const validarCampos = (datos, permitidos) => {
  if (
    !datos ||
    typeof datos !== 'object' ||
    Array.isArray(datos)
  ) {
    return false;
  }

  return Object.keys(datos).every(
    (campo) => permitidos.includes(campo)
  );
};

// Manejo centralizado de errores
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'El número de empleado o la persona ya están registrados.',
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

  console.error('Error en empleados:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

// Comprobar que la categoría exista y esté activa
const comprobarCategoria = async (categoriaId) => {
  if (!idValido(categoriaId)) {
    return {
      status: 400,
      message: 'El ID de categoría no es válido.'
    };
  }

  const categoria = await CategoriaEmpleado.findById(categoriaId);

  if (!categoria) {
    return {
      status: 404,
      message: 'La categoría de empleado no existe.'
    };
  }

  if (categoria.estado !== 'ACTIVA') {
    return {
      status: 409,
      message: 'No se puede asignar una categoría inactiva.'
    };
  }

  return null;
};

// Comprobar si existe una cuenta activa asociada
const tieneUsuarioActivo = async (empleadoId) => {
  const usuario = await mongoose.connection.db
    .collection('usuarios')
    .findOne({
      empleadoId: new mongoose.Types.ObjectId(empleadoId),
      estado: 'ACTIVO'
    });

  return Boolean(usuario);
};

// GET /api/empleados
export const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find()
      .populate({
        path: 'personaId',
        select: 'tipoPersona primerNombre segundoNombre primerApellido segundoApellido tipoIdentificacion numeroIdentificacion correo telefono estado'
      })
      .populate({
        path: 'categoriaEmpleadoId',
        select: 'codigo nombre descripcion estado'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: empleados.length,
      data: empleados
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/empleados/:id
export const obtenerEmpleadoPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del empleado no es válido.'
      });
    }

    const empleado = await Empleado.findById(req.params.id)
      .populate({
        path: 'personaId',
        select: 'tipoPersona primerNombre segundoNombre primerApellido segundoApellido tipoIdentificacion numeroIdentificacion correo telefono estado'
      })
      .populate({
        path: 'categoriaEmpleadoId',
        select: 'codigo nombre descripcion estado'
      });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      data: empleado
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/empleados
export const crearEmpleado = async (req, res) => {
  try {
    if (!validarCampos(req.body, CAMPOS_CREACION)) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud contiene campos no permitidos.'
      });
    }

    const {
      numeroEmpleado,
      personaId,
      categoriaEmpleadoId,
      fechaIngreso,
      estado
    } = req.body;

    if (
      typeof numeroEmpleado !== 'string' ||
      numeroEmpleado.trim().length === 0 ||
      !idValido(personaId) ||
      !idValido(categoriaEmpleadoId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un número de empleado y referencias válidas.'
      });
    }

    // Verificar que la persona exista
    const persona = await Persona.findById(personaId);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'La persona asociada no existe.'
      });
    }

    if (persona.tipoPersona !== 'EMPLEADO') {
      return res.status(409).json({
        success: false,
        message: 'La persona debe tener tipoPersona EMPLEADO.'
      });
    }

    if (persona.estado !== 'ACTIVA') {
      return res.status(409).json({
        success: false,
        message: 'No se puede registrar un empleado con una persona inactiva.'
      });
    }

    const errorCategoria = await comprobarCategoria(
      categoriaEmpleadoId
    );

    if (errorCategoria) {
      return res.status(errorCategoria.status).json({
        success: false,
        message: errorCategoria.message
      });
    }

    const empleado = await Empleado.create({
      numeroEmpleado,
      personaId,
      categoriaEmpleadoId,
      ...(fechaIngreso !== undefined ? { fechaIngreso } : {}),
      ...(estado !== undefined ? { estado } : {})
    });

    return res.status(201).json({
      success: true,
      message: 'Empleado registrado correctamente.',
      data: empleado
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/empleados/:id
export const actualizarEmpleado = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del empleado no es válido.'
      });
    }

    if (
      !validarCampos(req.body, CAMPOS_ACTUALIZACION) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos válidos.'
      });
    }

    const empleado = await Empleado.findById(req.params.id);

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado.'
      });
    }

    // Verificar la categoría cuando se cambie
    if (req.body.categoriaEmpleadoId !== undefined) {
      const errorCategoria = await comprobarCategoria(
        req.body.categoriaEmpleadoId
      );

      if (errorCategoria) {
        return res.status(errorCategoria.status).json({
          success: false,
          message: errorCategoria.message
        });
      }
    }

    // Evitar números de empleado vacíos
    if (req.body.numeroEmpleado !== undefined) {
      if (
        typeof req.body.numeroEmpleado !== 'string' ||
        req.body.numeroEmpleado.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'El número de empleado no puede estar vacío.'
        });
      }
    }

    // No desactivar empleados con cuentas activas
    if (
      req.body.estado === 'INACTIVO' &&
      empleado.estado !== 'INACTIVO'
    ) {
      if (await tieneUsuarioActivo(empleado._id)) {
        return res.status(409).json({
          success: false,
          message: 'Desactive primero la cuenta de usuario asociada.'
        });
      }
    }

    // Verificar la categoría al reactivar un empleado
    if (
      req.body.estado === 'ACTIVO' &&
      empleado.estado === 'INACTIVO'
    ) {
      const categoriaId =
        req.body.categoriaEmpleadoId ??
        empleado.categoriaEmpleadoId;

      const errorCategoria = await comprobarCategoria(categoriaId);

      if (errorCategoria) {
        return res.status(errorCategoria.status).json({
          success: false,
          message: errorCategoria.message
        });
      }

      const persona = await Persona.findById(empleado.personaId);

      if (
        !persona ||
        persona.estado !== 'ACTIVA' ||
        persona.tipoPersona !== 'EMPLEADO'
      ) {
        return res.status(409).json({
          success: false,
          message: 'La persona asociada no está habilitada para reactivar al empleado.'
        });
      }
    }

    empleado.set(req.body);
    await empleado.save();

    return res.status(200).json({
      success: true,
      message: 'Empleado actualizado correctamente.',
      data: empleado
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/empleados/:id
// Baja lógica del empleado
export const eliminarEmpleado = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del empleado no es válido.'
      });
    }

    const empleado = await Empleado.findById(req.params.id);

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado.'
      });
    }

    if (empleado.estado === 'INACTIVO') {
      return res.status(409).json({
        success: false,
        message: 'El empleado ya se encuentra inactivo.'
      });
    }

    if (await tieneUsuarioActivo(empleado._id)) {
      return res.status(409).json({
        success: false,
        message: 'Desactive primero la cuenta de usuario asociada.'
      });
    }

    empleado.estado = 'INACTIVO';
    await empleado.save();

    return res.status(200).json({
      success: true,
      message: 'Empleado desactivado correctamente.',
      data: empleado
    });
  } catch (error) {
    return manejarError(error, res);
  }
};
