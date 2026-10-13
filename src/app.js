import express from 'express';
import cors from 'cors';
import personaRoutes from './routes/persona.routes.js';

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

export default app;
