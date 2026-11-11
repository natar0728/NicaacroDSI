import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Usuario from '../src/models/usuario.model.js';
import Persona from '../src/models/persona.model.js';
import Evento from '../src/models/eventos.model.js';
import Habitacion from '../src/models/habitaciones.model.js';
import Empleado from '../src/models/empleado.model.js';
import Actividad from '../src/models/actividad.model.js';
import Inscripcion from '../src/models/inscripciones.model.js';
import Asignacion from '../src/models/asignacionesActividad.model.js';
import Reservacion from '../src/models/reservaciones.model.js';
import { generarToken } from '../src/services/jwt.service.js';

// Pruebas HTTP con colecciones simuladas: no tocan MongoDB Atlas.
process.env.JWT_SECRET = 'test-secret-exclusivo-para-pruebas';
delete process.env.JWT_ISSUER;
delete process.env.JWT_AUDIENCE;
const objectId = value => new mongoose.Types.ObjectId(value);
const ids = {
  admin: objectId('100000000000000000000001'), staff: objectId('100000000000000000000002'),
  employee: objectId('200000000000000000000001'), person: objectId('300000000000000000000001'),
  event: objectId('400000000000000000000001'), room: objectId('500000000000000000000001')
};
let server, base, adminToken, staffToken;
const users = {
  [ids.admin]: { _id: ids.admin, empleadoId: ids.employee, nombreUsuario: 'admin', rol: 'ADMINISTRADOR', estado: 'ACTIVO' },
  [ids.staff]: { _id: ids.staff, empleadoId: ids.employee, nombreUsuario: 'staff', rol: 'STAFF', estado: 'ACTIVO' }
};
const chain = value => ({ sort: async () => value, populate() { return this; }, select() { return this; }, lean: async () => value, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });
async function call(path, { token, body, ...options } = {}) {
  const headers = { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...(token ? { authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(base + path, { ...options, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, json: await response.json() };
}
before(async () => {
  Usuario.findById = async id => users[id] || null;
  const passwordHash = await bcrypt.hash('clave-prueba', 4);
  Usuario.findOne = query => chain(query.nombreUsuario === 'admin' ? { ...users[ids.admin], passwordHash } : null);
  adminToken = generarToken(users[ids.admin]); staffToken = generarToken(users[ids.staff]);
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server?.close());

test('inicio de sesión, token, perfil y cierre a peticiones sin autorización', async () => {
  assert.equal((await call('/api/health')).status, 200);
  assert.equal((await call('/api/eventos')).status, 401);
  assert.equal((await call('/api/auth/login', { method:'POST', body:{nombreUsuario:'admin', password:'incorrecta'} })).status, 401);
  const login = await call('/api/auth/login', { method:'POST', body:{nombreUsuario:'admin', password:'clave-prueba'} });
  assert.equal(login.status, 200); assert.ok(login.json.data.token); assert.equal(login.json.data.usuario.rol, 'ADMINISTRADOR');
  assert.equal((await call('/api/auth/me', { token:login.json.data.token })).json.data.id, String(ids.admin));
});

test('el personal no puede acceder a datos privados ni modificar eventos', async () => {
  assert.equal((await call('/api/personas', { token:staffToken })).status, 403);
  assert.equal((await call('/api/usuarios', { token:staffToken })).status, 403);
  assert.equal((await call('/api/eventos', { token:staffToken, method:'POST', body:{} })).status, 403);
  assert.equal((await call(`/api/empleados/${ids.employee}`, { token:staffToken })).status, 403);
  let filter;
  Empleado.findById = async () => ({ _id:ids.employee, personaId:ids.person });
  Asignacion.find = query => { filter = query; return chain([]); };
  assert.equal((await call('/api/asignacionesActividad', { token:staffToken })).status, 200);
  assert.deepEqual(filter.empleadoId.$in.map(String), [String(ids.employee), String(ids.person)]);
});

test('el backend acepta un evento válido y rechaza fechas invertidas', async () => {
  let saved;
  Evento.create = async body => { saved = body; return { _id:ids.event, ...body }; };
  const body = { codigo:'EVT-TEST', nombre:'Encuentro', fechaInicio:'2026-11-12', fechaFin:'2026-11-13', estado:'PLANIFICADO' };
  assert.equal((await call('/api/eventos', { token:adminToken, method:'POST', body:{...body, fechaFin:'2026-11-11'} })).status, 400);
  assert.equal((await call('/api/eventos', { token:adminToken, method:'POST', body })).status, 201);
  assert.equal(saved.codigo, 'EVT-TEST');
});

test('la inscripción requiere participante y evento válidos y evita duplicados', async () => {
  Persona.findById = async () => ({ _id:ids.person, tipoPersona:'PARTICIPANTE', estado:'ACTIVA' });
  Evento.findById = async () => ({ _id:ids.event, estado:'PLANIFICADO' });
  let duplicate = false;
  Inscripcion.findOne = async () => duplicate ? { _id:ids.person } : null;
  Inscripcion.create = async body => ({ _id:ids.person, ...body });
  const body = { personaId:String(ids.person), eventoId:String(ids.event), origenRegistro:'PRE_REGISTRO', modalidad:'SOLO_EVENTO', estadoInscripcion:'CONFIRMADA', asistencia:{estado:'PENDIENTE'} };
  assert.equal((await call('/api/inscripciones', { token:adminToken, method:'POST', body })).status, 201);
  duplicate = true;
  assert.equal((await call('/api/inscripciones', { token:adminToken, method:'POST', body })).status, 409);
});

test('la reservación comprueba las fechas y la capacidad de la habitación', async () => {
  Persona.findById = async () => ({ _id:ids.person, estado:'ACTIVA' });
  Habitacion.findById = async () => ({ _id:ids.room, estado:'DISPONIBLE', capacidad:1 });
  let occupied = false;
  Reservacion.find = () => chain(occupied ? [{ fechaEntrada:'2026-11-12', fechaSalida:'2026-11-14' }] : []);
  Reservacion.create = async body => ({ _id:ids.room, ...body });
  const body = { codigoReservacion:'RES-TEST', personaId:String(ids.person), habitacionId:String(ids.room), fechaEntrada:'2026-11-12', fechaSalida:'2026-11-14', estado:'CONFIRMADA' };
  assert.equal((await call('/api/reservaciones', { token:adminToken, method:'POST', body:{...body, fechaSalida:'2026-11-11'} })).status, 400);
  assert.equal((await call('/api/reservaciones', { token:adminToken, method:'POST', body })).status, 201);
  occupied = true;
  assert.equal((await call('/api/reservaciones', { token:adminToken, method:'POST', body })).status, 400);
});


test('la asignación verifica el horario y registra al usuario responsable', async () => {
  const activityId = objectId('600000000000000000000001');
  Evento.findById = async () => ({ _id:ids.event, estado:'PLANIFICADO', fechaInicio:new Date('2026-11-12'), fechaFin:new Date('2026-11-13') });
  Actividad.findById = async () => ({ _id:activityId, estado:'ACTIVA' });
  Empleado.findOne = async () => ({ _id:ids.employee, personaId:ids.person, estado:'ACTIVO' });
  let occupied = false, saved;
  Asignacion.exists = async () => occupied;
  Asignacion.create = async body => { const assignment = new Asignacion(body); await assignment.validate(); saved = body; return assignment; };
  const body = { eventoId:String(ids.event), empleadoId:String(ids.person), actividadId:String(activityId), fecha:'2026-11-12', horaInicio:'09:00', horaFin:'10:00', estado:'PENDIENTE' };
  assert.equal((await call('/api/asignacionesActividad', { token:adminToken, method:'POST', body })).status, 201);
  assert.equal(saved.createdByUsuarioId, String(ids.admin));
  occupied = true;
  assert.equal((await call('/api/asignacionesActividad', { token:adminToken, method:'POST', body })).status, 400);
  assert.equal((await call('/api/asignacionesActividad', { token:adminToken, method:'POST', body:{...body,horaFin:'08:30'} })).status, 400);
});
