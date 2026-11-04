
import mongoose from 'mongoose';
import CategoriaEmpleado from '../models/categoriaEmpleado.model.js';

const CAMPOS_PERMITIDOS = [
  'codigo',
  'nombre',
  'descripcion',
  'actividadesSugeridas',
  'estado'
];

const idValido = (id) =>
  mongoose.isObjectIdOrHexString(id);

// Validar campos permitidos
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

// Validar y comprobar las actividades sugeridas
const validarActividades = async (actividades) => {
  if (!Array.isArray(actividades)) {
    return 'Las actividades sugeridas deben ser un arreglo.';
  }

  if (!actividades.every(idValido)) {
    return 'Una o más actividades tienen un ID inválido.';
  }

  const ids = actividades.map((id) => id.toString().toLowerCase());

  if (new Set(ids).size !== ids.length) {
    return 'No se permiten actividades repetidas.';
  }

  if (ids.length === 0) {
    return null;
  }

  const objectIds = ids.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const cantidad = await mongoose.connection.db
    .collection('actividades')
    .countDocuments({
      _id: { $in: objectIds }
    });

  if (cantidad !== objectIds.length) {
    return 'Una o más actividades no existen.';
  }

  return null;
};

// Manejar errores de MongoDB y Mongoose
const manejarError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una categoría con ese código.'
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

  console.error('Error en categorías de empleados:', error);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
};

// GET /api/categorias-empleado
export const obtenerCategoriasEmpleado = async (req, res) => {
  try {
    const categorias = await CategoriaEmpleado.find()
      .sort({ nombre: 1 });

    return res.status(200).json({
      success: true,
      total: categorias.length,
      data: categorias
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// GET /api/categorias-empleado/:id
export const obtenerCategoriaEmpleadoPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría no válido.'
      });
    }

    const categoria = await CategoriaEmpleado.findById(
      req.params.id
    );

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// POST /api/categorias-empleado
export const crearCategoriaEmpleado = async (req, res) => {
  try {
    if (!validarCampos(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud contiene campos no permitidos.'
      });
    }

    const {
      codigo,
      nombre,
      descripcion,
      actividadesSugeridas = [],
      estado = 'ACTIVA'
    } = req.body;

    if (
      typeof codigo !== 'string' ||
      codigo.trim().length === 0 ||
      typeof nombre !== 'string' ||
      nombre.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'El código y el nombre son obligatorios.'
      });
    }

    const errorActividades = await validarActividades(
      actividadesSugeridas
    );

    if (errorActividades) {
      return res.status(400).json({
        success: false,
        message: errorActividades
      });
    }

    const categoria = await CategoriaEmpleado.create({
      codigo,
      nombre,
      descripcion,
      actividadesSugeridas,
      estado
    });

    return res.status(201).json({
      success: true,
      message: 'Categoría registrada correctamente.',
      data: categoria
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// PUT /api/categorias-empleado/:id
export const actualizarCategoriaEmpleado = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría no válido.'
      });
    }

    if (
      !validarCampos(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos válidos.'
      });
    }

    const categoria = await CategoriaEmpleado.findById(
      req.params.id
    );

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.'
      });
    }

    if (req.body.actividadesSugeridas !== undefined) {
      const errorActividades = await validarActividades(
        req.body.actividadesSugeridas
      );

      if (errorActividades) {
        return res.status(400).json({
          success: false,
          message: errorActividades
        });
      }
    }

    if (req.body.codigo !== undefined) {
      if (
        typeof req.body.codigo !== 'string' ||
        req.body.codigo.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'El código no puede estar vacío.'
        });
      }
    }

    if (req.body.nombre !== undefined) {
      if (
        typeof req.body.nombre !== 'string' ||
        req.body.nombre.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío.'
        });
      }
    }

    categoria.set(req.body);

    await categoria.save();

    return res.status(200).json({
      success: true,
      message: 'Categoría actualizada correctamente.',
      data: categoria
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

// DELETE /api/categorias-empleado/:id
// Baja lógica: se conserva el documento
export const eliminarCategoriaEmpleado = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría no válido.'
      });
    }

    const categoria = await CategoriaEmpleado.findById(
      req.params.id
    );

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.'
      });
    }

    if (categoria.estado === 'INACTIVA') {
      return res.status(409).json({
        success: false,
        message: 'La categoría ya se encuentra inactiva.'
      });
    }

    categoria.estado = 'INACTIVA';
    await categoria.save();

    return res.status(200).json({
      success: true,
      message: 'Categoría desactivada correctamente.',
      data: categoria
    });
  } catch (error) {
    return manejarError(error, res);
  }
};
