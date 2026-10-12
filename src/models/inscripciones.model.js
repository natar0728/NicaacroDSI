import mongoose from 'mongoose';

const inscripcionSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Evento' // Recomendado si en el futuro necesitas usar populate()
    },

    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Persona' // Recomendado si en el futuro necesitas usar populate()
    },

    codigoInscripcion: {
      type: String,
      default: null,
      trim: true
    },

    origenRegistro: {
      type: String,
      enum: ['PRE_REGISTRO', 'WALK_IN'],
      required: true
    },

    modalidad: {
      type: String,
      enum: ['SOLO_EVENTO', 'EVENTO_Y_HOSTAL'],
      required: true
    },

    estadoInscripcion: {
      type: String,
      enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'],
      required: true
    },

    asistencia: {
      estado: {
        type: String,
        enum: ['PENDIENTE', 'ASISTIO', 'NO_ASISTIO'],
        required: true,
        default: 'PENDIENTE'
      },
      fechaRegistro: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true, // Esto manejará automáticamente los campos createdAt y updatedAt
    collection: 'inscripciones'
  }
);

// Los índices ya existen en MongoDB Atlas.
// Evitamos que Mongoose intente administrarlos automáticamente.
// Nota sobre los índices de esta colección:
// - uq_evento_persona (eventoId, personaId) [Único]
// - ix_evento_asistencia (eventoId, asistencia.estado)
inscripcionSchema.set('autoIndex', false);

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);

export default Inscripcion;