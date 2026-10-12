import mongoose from 'mongoose';

const eventoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      trim: true
      // Nota: El índice 'uq_evento_codigo' de MongoDB ya garantiza que sea único,
      // y como autoIndex está en false, no es estrictamente necesario poner 'unique: true' aquí.
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

    fechaInicio: {
      type: Date,
      required: true
    },

    fechaFin: {
      type: Date,
      required: true
    },

    lugar: {
      type: String,
      default: null,
      trim: true
    },

    estado: {
      type: String,
      enum: ['PLANIFICADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'],
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'eventos'
  }
);

// Los índices ya existen en MongoDB Atlas.
// Evitamos que Mongoose intente administrarlos automáticamente.
eventoSchema.set('autoIndex', false);

const Evento = mongoose.model('Evento', eventoSchema);

export default Evento;