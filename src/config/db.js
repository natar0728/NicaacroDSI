import mongoose from 'mongoose';
//establecer la consexion con mongodb atlas
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB Atlas conectado correctamente');
    console.log(`Base de datos: ${conn.connection.name}`);

  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;