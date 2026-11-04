import mongoose from 'mongoose';

const habitacionSchema = new mongoose.Schema(
  {
    codigoHabitacion: {
      type: String,
      required: true,
      trim: true
      // Nota: El índice 'uq_habitacion_codigo' de MongoDB ya garantiza que sea único.
    },

    nombre: {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    },

    descripcion: {
      type: String,
      default: null,
      trim: true
    },

    capacidad: {
      type: Number,
      required: true,
      min: 1
    },

    caracteristicas: {
      type: [String], // Mongoose valida automáticamente que los elementos sean strings
      required: true
    },

    estado: {
      type: String,
      enum: ['DISPONIBLE', 'MANTENIMIENTO', 'INACTIVA'],
      required: true
    }
  },
  {
    timestamps: true, // Esto manejará automáticamente los campos createdAt y updatedAt
    collection: 'habitaciones'
  }
);

// Los índices ya existen en MongoDB Atlas.
// Evitamos que Mongoose intente administrarlos automáticamente.
// Índices existentes en esta colección:
// - uq_habitacion_codigo (codigoHabitacion) [Único]
habitacionSchema.set('autoIndex', false);

const Habitacion = mongoose.model('Habitacion', habitacionSchema);

export default Habitacion;