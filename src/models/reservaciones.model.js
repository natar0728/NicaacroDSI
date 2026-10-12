import mongoose from 'mongoose';

const reservacionSchema = new mongoose.Schema(
  {
    codigoReservacion: {
      type: String,
      required: true,
      trim: true
    },

    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Persona' // Referencia para poder usar populate() con la persona que reserva
    },

    habitacionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Habitacion' // Referencia para poder usar populate() con la habitación reservada
    },

    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Evento' // Opcional, por si la reserva está vinculada a un evento específico
    },

    fechaEntrada: {
      type: Date,
      required: true
    },

    fechaSalida: {
      type: Date,
      required: true
    },

    estado: {
      type: String,
      enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'],
      required: true
    },

    checkInReal: {
      type: Date,
      default: null
    },

    checkOutReal: {
      type: Date,
      default: null
    },

    observaciones: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true, // Maneja automáticamente createdAt y updatedAt
    collection: 'reservaciones'
  }
);

// Los índices ya existen en MongoDB Atlas.
// Evitamos que Mongoose intente administrarlos automáticamente.
// Índices existentes en esta colección:
// - ix_disponibilidad_habitacion (habitacionId, estado, fechaEntrada, fechaSalida)
// - ix_historial_reservaciones (personaId, fechaEntrada: -1)
reservacionSchema.set('autoIndex', false);

const Reservacion = mongoose.model('Reservacion', reservacionSchema);

export default Reservacion;