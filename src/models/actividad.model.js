
import mongoose from 'mongoose';

const actividadSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código de la actividad es obligatorio'],
      trim: true,
      validate: {
        validator: (valor) => valor.trim().length > 0,
        message: 'El código no puede estar vacío'
      }
    },

    nombre: {
      type: String,
      required: [true, 'El nombre de la actividad es obligatorio'],
      minlength: [1, 'El nombre no puede estar vacío'],
      trim: true
    },

    descripcion: {
      type: String,
      default: null,
      trim: true
    },

    categoriaSugeridaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaEmpleado',
      default: null
    },

    origen: {
      type: String,
      enum: {
        values: ['CATALOGO', 'IMPREVISTO'],
        message: 'El origen debe ser CATALOGO o IMPREVISTO'
      },
      required: [true, 'El origen es obligatorio']
    },

    estado: {
      type: String,
      enum: {
        values: ['ACTIVA', 'INACTIVA'],
        message: 'El estado debe ser ACTIVA o INACTIVA'
      },
      required: true,
      default: 'ACTIVA'
    },

    createdByUsuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
      immutable: true
    }
  },
  {
    timestamps: true,
    collection: 'actividades',
    autoIndex: false,
    versionKey: false
  }
);

const Actividad = mongoose.model('Actividad', actividadSchema);

export default Actividad;
