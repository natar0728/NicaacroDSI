import 'dotenv/config';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import Usuario from './models/usuario.model.js';

const entrada = createInterface({
  input: stdin,
  output: stdout
});

try {
  if (!process.env.MONGODB_URI) {
    throw new Error('Falta MONGODB_URI en el archivo .env.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const administradorExistente = await Usuario.exists({
    rol: 'ADMINISTRADOR'
  });

  if (administradorExistente) {
    throw new Error(
      'Ya existe un administrador. Utilice esa cuenta.'
    );
  }

  const empleadoId = (
    await entrada.question('ID del empleado: ')
  ).trim();

  const nombreUsuario = (
    await entrada.question('Nombre de usuario: ')
  ).trim();

  const password = await entrada.question(
    'Contraseña temporal, visible al escribir: '
  );

  if (
    !mongoose.isObjectIdOrHexString(empleadoId) ||
    nombreUsuario.length < 3 ||
    password.length < 8
  ) {
    throw new Error(
      'Revise el ID, el usuario y la contraseña. La contraseña debe tener al menos 8 caracteres.'
    );
  }

  const empleado = await mongoose.connection.db
    .collection('empleados')
    .findOne({
      _id: new mongoose.Types.ObjectId(empleadoId)
    });

  if (!empleado) {
    throw new Error('El empleado indicado no existe.');
  }

  const cuentaExistente = await Usuario.exists({
    $or: [
      { nombreUsuario },
      { empleadoId }
    ]
  });

  if (cuentaExistente) {
    throw new Error(
      'El nombre de usuario o el empleado ya tienen una cuenta.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await Usuario.create({
    empleadoId,
    nombreUsuario,
    passwordHash,
    rol: 'ADMINISTRADOR',
    estado: 'ACTIVO'
  });

  console.log('Administrador creado correctamente.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  entrada.close();
  await mongoose.disconnect();
}