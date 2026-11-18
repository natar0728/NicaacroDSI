import 'dotenv/config';

import app from './app.js';
import connectDB from './config/db.js';

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Servidor NicaAcro iniciado en: http://localhost:${PORT}`
    );
  });
};

startServer();