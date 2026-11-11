import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

// El personal consulta únicamente su propio cronograma. Las operaciones de
// gestión quedan para organizadores y administradores.
const gestion = permitirRoles('ADMINISTRADOR', 'ORGANIZADOR');
const lecturaStaff = (req, res, next) => {
  if (req.usuario.rol === 'STAFF' && req.method !== 'GET') {
    return res.status(403).json({ success: false, message: 'No tiene permisos para modificar este recurso.' });
  }
  return next();
};
const soloListaStaff = (req, res, next) => {
  if (req.usuario.rol === 'STAFF' && (req.method !== 'GET' || req.path !== '/')) {
    return res.status(403).json({ success: false, message: 'No tiene permisos para acceder a este recurso.' });
  }
  return next();
};
app.use('/api/personas', gestion, personaRoutes);
app.use('/api/usuarios', permitirRoles('ADMINISTRADOR'), usuariosRoutes);
app.use('/api/categorias-empleado', gestion, categoriaEmpleadoRoutes);
app.use('/api/empleados', soloListaStaff, empleadoRoutes);
app.use('/api/actividades', lecturaStaff, actividadRoutes);
app.use('/api/eventos', lecturaStaff, eventosRoutes);
app.use('/api/inscripciones', gestion, inscripcionesRoutes);
app.use('/api/asignacionesActividad', soloListaStaff, asignacionesActividadRoutes);
app.use('/api/habitaciones', gestion, habitacionesRoutes);
app.use('/api/reservaciones', gestion, reservacionesRoutes);

// Respuesta para rutas de API inexistentes.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta de API no encontrada.'
  });
});

// Ubicación del frontend compilado.
const directorioActual = path.dirname(
  fileURLToPath(import.meta.url)
);

const directorioFrontend = path.resolve(
  directorioActual,
  '../public'
);

// Servir los archivos del frontend.
app.use(express.static(directorioFrontend));

// Permitir que las rutas del frontend funcionen al recargar.
app.get('/{*splat}', (req, res) => {
  res.sendFile(
    path.join(directorioFrontend, 'index.html')
  );
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'El JSON de la solicitud no es válido.' });
  }
  console.error('Error en la solicitud:', err.message);
  return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
});
export default app;
