
import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema(
  {
    tipoPersona: {
      type: String,
      enum: ['PARTICIPANTE', 'EMPLEADO'],
      required: true
    },

    primerNombre: {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    },

    segundoNombre: {
      type: String,
      default: null,
      trim: true
    },

    primerApellido: {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    },

    segundoApellido: {
      type: String,
      default: null,
      trim: true
    },

    tipoIdentificacion: {
      type: String,
      enum: [
        'CEDULA',
        'PASAPORTE',
        'DOCUMENTO_EXTRANJERO',
        'SIN_DOCUMENTO'
      ],
      required: true
    },

    numeroIdentificacion: {
      type: String,
      default: null,
      trim: true
    },

    paisEmisor: {
      type: String,
      default: null,
      trim: true
    },

    identificadorAlternativo: {
      type: String,
      default: null,
      trim: true
    },

    correo: {
      type: String,
      default: null,
      trim: true
    },

    telefono: {
      type: String,
      default: null,
      trim: true
    },

    estado: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA'],
      required: true,
      default: 'ACTIVA'
    }
  },
  {
    timestamps: true,
    collection: 'personas'
  }
);

// Los índices ya existen en MongoDB Atlas.
// Evitamos que Mongoose intente administrarlos automáticamente.
personaSchema.set('autoIndex', false);

const Persona = mongoose.model('Persona', personaSchema);

export default Persona;
