
import mongoose from 'mongoose';
import Actividad from '../models/actividad.model.js';
import CategoriaEmpleado from '../models/categoriaEmpleado.model.js';

const CAMPOS_PERMITIDOS = [
  'codigo',
  'nombre',
  'descripcion',
  'categoriaSugeridaId',
  'origen',
  'estado'
];

const idValido = (id) =>
  mongoose.isObjectIdOrHexString(id);

const validarCampos = (datos) => {
  if (
    !datos ||
    typeof datos !== 'object' ||
    Array.isArray(datos)
  ) {
    return false;
  }

  return Object.keys(datos).every((campo) =>
    CAMPOS_PERMITIDOS.includes(campo)
  );
};

const respuestaError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

// Comprobar la categoría sugerida
const comprobarCategoria = async (categoriaId) => {
  if (categoriaId === null) {
    return null;
  }

  if (!idValido(categoriaId)) {
    return {
      status: 400,
      message: 'El ID de la categoría no es válido.'
    };
  }

  const categoria = await CategoriaEmpleado.findById(categoriaId);

  if (!categoria) {
    return {
      status: 404,
      message: 'La categoría sugerida no existe.'
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

// Manejo de errores del módulo
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return respuestaError(
      res,
      409,
      'Ya existe una actividad con ese código.'
    );
  }

  if (
    error.name === 'ValidationError' ||
    error.name === 'CastError' ||
    error.code === 121
  ) {
    return respuestaError(
      res,
      400,
      'Los datos proporcionados no son válidos.'
    );
  }

  console.error('Error en actividades:', error);

  return respuestaError(
    res,
    500,
    'Error interno del servidor.'
  );
};

// GET /api/actividades
export const obtenerActividades = async (req, res) => {
  try {
    const actividades = await Actividad.find()
      .populate({
        path: 'categoriaSugeridaId',
        select: 'codigo nombre estado'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: actividades.length,
      data: actividades
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/actividades/:id
export const obtenerActividadPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return respuestaError(res, 400, 'ID de actividad no válido.');
    }

    const actividad = await Actividad.findById(req.params.id)
      .populate({
        path: 'categoriaSugeridaId',
        select: 'codigo nombre estado'
      });

    if (!actividad) {
      return respuestaError(res, 404, 'Actividad no encontrada.');
    }

    return res.status(200).json({
      success: true,
      data: actividad
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/actividades
export const crearActividad = async (req, res) => {
  try {
    if (!validarCampos(req.body)) {
      return respuestaError(
        res,
        400,
        'La solicitud contiene campos no permitidos.'
      );
    }

    const {
      codigo,
      nombre,
      descripcion,
      categoriaSugeridaId,
      origen,
      estado
    } = req.body;

    if (
      typeof codigo !== 'string' ||
      codigo.trim().length === 0 ||
      typeof nombre !== 'string' ||
      nombre.trim().length === 0
    ) {
      return respuestaError(
        res,
        400,
        'El código y el nombre son obligatorios.'
      );
    }

    if (!['CATALOGO', 'IMPREVISTO'].includes(origen)) {
      return respuestaError(
        res,
        400,
        'El origen debe ser CATALOGO o IMPREVISTO.'
      );
    }

    if (
      categoriaSugeridaId !== undefined &&
      categoriaSugeridaId !== null
    ) {
      const errorCategoria = await comprobarCategoria(
        categoriaSugeridaId
      );

      if (errorCategoria) {
        return respuestaError(
          res,
          errorCategoria.status,
          errorCategoria.message
        );
      }
    }

    const actividad = await Actividad.create({
      codigo,
      nombre,
      descripcion,
      categoriaSugeridaId,
      origen,
      ...(estado !== undefined ? { estado } : {})
    });

    return res.status(201).json({
      success: true,
      message: 'Actividad registrada correctamente.',
      data: actividad
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/actividades/:id
export const actualizarActividad = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return respuestaError(res, 400, 'ID de actividad no válido.');
    }

    if (
      !validarCampos(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return respuestaError(
        res,
        400,
        'No se proporcionaron campos válidos.'
      );
    }

    const actividad = await Actividad.findById(req.params.id);

    if (!actividad) {
      return respuestaError(res, 404, 'Actividad no encontrada.');
    }

    if (req.body.codigo !== undefined) {
      if (
        typeof req.body.codigo !== 'string' ||
        req.body.codigo.trim().length === 0
      ) {
        return respuestaError(res, 400, 'El código no puede estar vacío.');
      }
    }

    if (req.body.nombre !== undefined) {
      if (
        typeof req.body.nombre !== 'string' ||
        req.body.nombre.trim().length === 0
      ) {
        return respuestaError(res, 400, 'El nombre no puede estar vacío.');
      }
    }

    if (
      req.body.categoriaSugeridaId !== undefined &&
      req.body.categoriaSugeridaId !== null
    ) {
      const errorCategoria = await comprobarCategoria(
        req.body.categoriaSugeridaId
      );

      if (errorCategoria) {
        return respuestaError(
          res,
          errorCategoria.status,
          errorCategoria.message
        );
      }
    }

    // Evitar reactivar una actividad ligada
    // a una categoría que ahora está inactiva.
    if (
      req.body.estado === 'ACTIVA' &&
      actividad.estado === 'INACTIVA'
    ) {
      const categoriaId =
        req.body.categoriaSugeridaId !== undefined
          ? req.body.categoriaSugeridaId
          : actividad.categoriaSugeridaId;

      if (categoriaId !== null) {
        const errorCategoria = await comprobarCategoria(categoriaId);

        if (errorCategoria) {
          return respuestaError(
            res,
            errorCategoria.status,
            errorCategoria.message
          );
        }
      }
    }

    actividad.set(req.body);
    await actividad.save();

    return res.status(200).json({
      success: true,
      message: 'Actividad actualizada correctamente.',
      data: actividad
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/actividades/:id
// Baja lógica
export const eliminarActividad = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return respuestaError(res, 400, 'ID de actividad no válido.');
    }

    const actividad = await Actividad.findById(req.params.id);

    if (!actividad) {
      return respuestaError(res, 404, 'Actividad no encontrada.');
    }

    if (actividad.estado === 'INACTIVA') {
      return respuestaError(res, 409, 'La actividad ya está inactiva.');
    }

    actividad.estado = 'INACTIVA';
    await actividad.save();

    return res.status(200).json({
      success: true,
      message: 'Actividad desactivada correctamente.',
      data: actividad
    });
  } catch (error) {
    return manejarError(error, res);
  }
};
