import mongoose from 'mongoose';

const asignacionActividadSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Evento' // Recomendado para usar populate()
    },

    empleadoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Persona' // Asumiendo que los empleados están en la colección 'personas'
    },

    actividadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
      // ref: 'Actividad' (Si tienes una colección de actividades, puedes descomentar esto)
    },

    actividadSnapshot: {
      codigo: {
        type: String,
        trim: true
      },
      nombre: {
        type: String,
        trim: true
      },
      descripcion: {
        type: String,
        default: null,
        trim: true
      }
    },

    fecha: {
      type: Date,
      required: true
    },

    horaInicio: {
      type: String,
      required: true,
      match: [/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de horaInicio debe ser HH:mm']
    },

    horaFin: {
      type: String,
      required: true,
      match: [/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de horaFin debe ser HH:mm']
    },

    estado: {
      type: String,
      enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'],
      required: true
    },

    observaciones: {
      type: String,
      default: null,
      trim: true
    },

    createdByUsuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
      // ref: 'Usuario' (Si tienes una colección separada para usuarios del sistema)
    }
  },
  {
    timestamps: true, // Manejará automáticamente createdAt y updatedAt
    collection: 'asignacionesActividad'
  }
);

// Los índices ya existen en MongoDB Atlas.
// Evitamos que Mongoose intente administrarlos automáticamente.
// Índices existentes en esta colección:
// - ix_cronograma_empleado (empleadoId, eventoId, fecha, horaInicio)
// - ix_cronograma_evento (eventoId, fecha, empleadoId, horaInicio)
asignacionActividadSchema.set('autoIndex', false);

const AsignacionActividad = mongoose.model('AsignacionesActividad', asignacionActividadSchema);

export default AsignacionActividad;