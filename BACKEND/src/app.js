import express from 'express';
import cors from 'cors';

import personaRoutes from './routes/persona.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import categoriaEmpleadoRoutes from './routes/categoriaEmpleado.routes.js';
import empleadoRoutes from './routes/empleado.routes.js';
import actividadRoutes from './routes/actividad.routes.js';
import authRoutes from './routes/auth.routes.js';

import {
  verificarToken,
  permitirRoles
} from './middlewares/auth.middleware.js';

// Rutas de Cinthia.
import eventosRoutes from './routes/eventos.routes.js';
import inscripcionesRoutes from './routes/inscripciones.routes.js';
import asignacionesActividadRoutes from './routes/asignacionesActividad.routes.js';
import habitacionesRoutes from './routes/habitaciones.routes.js';
import reservacionesRoutes from './routes/reservaciones.routes.js';

const app = express();

// Middlewares generales.
app.use(cors());
app.use(express.json());

// Ruta pública para verificar que la API está funcionando.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API REST de NicaAcro está en funcionamiento',
    timestamp: new Date().toISOString()
  });
});

// Las rutas de autenticación se registran antes de la protección general.
// /login es pública y /me tiene su propio verificarToken.
app.use('/api/auth', authRoutes);

// Todas las rutas de /api registradas después de esta línea
// requieren un token válido.
app.use('/api', verificarToken);

// Rutas protegidas.
app.use('/api/personas', personaRoutes);

// Solo ADMINISTRADOR puede consultar o modificar cuentas de usuario.
app.use(
  '/api/usuarios',
  permitirRoles('ADMINISTRADOR'),
  usuariosRoutes
);

app.use('/api/categorias-empleado', categoriaEmpleadoRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/actividades', actividadRoutes);

// Rutas de Cinthia.
app.use('/api/eventos', eventosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/asignacionesActividad', asignacionesActividadRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/reservaciones', reservacionesRoutes);

export default app;