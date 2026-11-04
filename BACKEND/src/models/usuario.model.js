
import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {
    empleadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      required: [true, 'El empleado es obligatorio']
    },

    nombreUsuario: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
      trim: true
    },

    passwordHash: {
      type: String,
      required: [true, 'La contraseña cifrada es obligatoria'],
      minlength: 1,
      select: false
    },

    rol: {
      type: String,
      enum: {
        values: ['ADMINISTRADOR', 'ORGANIZADOR', 'STAFF'],
        message: 'El rol proporcionado no es válido'
      },
      required: [true, 'El rol es obligatorio']
    },

    estado: {
      type: String,
      enum: ['ACTIVO', 'INACTIVO'],
      required: true,
      default: 'ACTIVO'
    },

    ultimoAcceso: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'usuarios',
    autoIndex: false,
    versionKey: false
  }
);

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
