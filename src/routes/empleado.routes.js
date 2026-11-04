
import { Router } from 'express';

import {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
} from '../controllers/empleado.controller.js';

const router = Router();

// Listar todos los empleados
router.get('/', obtenerEmpleados);

// Obtener empleado por ID
router.get('/:id', obtenerEmpleadoPorId);

// Registrar empleado
router.post('/', crearEmpleado);

// Actualizar empleado
router.put('/:id', actualizarEmpleado);

// Desactivar empleado
router.delete('/:id', eliminarEmpleado);

export default router;
