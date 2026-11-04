
import mongoose from 'mongoose';

const empleadoSchema = new mongoose.Schema(
  {
    numeroEmpleado: {
      type: String,
      required: [
        true,
        'El número de empleado es obligatorio'
      ],
      trim: true,
      validate: {
        validator: (valor) => valor.trim().length > 0,
        message: 'El número de empleado no puede estar vacío'
      }
    },

    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Persona',
      required: [
        true,
        'La persona asociada es obligatoria'
      ]
    },

    categoriaEmpleadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaEmpleado',
      required: [
        true,
        'La categoría del empleado es obligatoria'
      ]
    },

    fechaIngreso: {
      type: Date
    },

    estado: {
      type: String,
      enum: {
        values: ['ACTIVO', 'INACTIVO'],
        message: 'El estado debe ser ACTIVO o INACTIVO'
      },
      required: true,
      default: 'ACTIVO'
    }
  },
  {
    timestamps: true,
    collection: 'empleados',
    autoIndex: false,
    versionKey: false
  }
);

const Empleado = mongoose.model(
  'Empleado',
  empleadoSchema
);

export default Empleado;
