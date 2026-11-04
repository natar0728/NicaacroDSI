
import { Router } from 'express';

import {
  obtenerCategoriasEmpleado,
  obtenerCategoriaEmpleadoPorId,
  crearCategoriaEmpleado,
  actualizarCategoriaEmpleado,
  eliminarCategoriaEmpleado
} from '../controllers/categoriaEmpleado.controller.js';

const router = Router();

// Listar todas las categorías
router.get('/', obtenerCategoriasEmpleado);

// Obtener una categoría por ID
router.get('/:id', obtenerCategoriaEmpleadoPorId);

// Registrar una categoría
router.post('/', crearCategoriaEmpleado);

// Actualizar una categoría
router.put('/:id', actualizarCategoriaEmpleado);

// Desactivar una categoría
router.delete('/:id', eliminarCategoriaEmpleado);

export default router;
