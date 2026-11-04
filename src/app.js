import express from 'express';
import cors from 'cors';
import personaRoutes from './routes/persona.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import categoriaEmpleadoRoutes from './routes/categoriaEmpleado.routes.js';
import empleadoRoutes from './routes/empleado.routes.js';
import actividadRoutes from './routes/actividad.routes.js';
const app = express();

// Middlewares
app.use(cors()); //cors es para configurar el acceso para que consuman la API
app.use(express.json()); //express es para crear la app HTTP y recibir JSON de las solicitudes


// Endpoint inicial de verificación
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API REST de NicaAcro esta en fucnionemiento',
    timestamp: new Date().toISOString()
  });
});

//rutas de la api
app.use('/api/personas', personaRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias-empleado', categoriaEmpleadoRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/actividades', actividadRoutes);

export default app;