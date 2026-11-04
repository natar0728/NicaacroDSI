
import mongoose from 'mongoose';

const categoriaEmpleadoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código de la categoría es obligatorio'],
      trim: true
    },

    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      minlength: [1, 'El nombre no puede estar vacío'],
      trim: true
    },

    descripcion: {
      type: String,
      default: null,
      trim: true
    },

    actividadesSugeridas: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Actividad'
        }
      ],
      required: true,
      default: []
    },

    estado: {
      type: String,
      enum: {
        values: ['ACTIVA', 'INACTIVA'],
        message: 'El estado debe ser ACTIVA o INACTIVA'
      },
      required: true,
      default: 'ACTIVA'
    }
  },
  {
    timestamps: true,
    collection: 'categoriasEmpleado',
    autoIndex: false,
    versionKey: false
  }
);

const CategoriaEmpleado = mongoose.model(
  'CategoriaEmpleado',
  categoriaEmpleadoSchema
);

export default CategoriaEmpleado;
