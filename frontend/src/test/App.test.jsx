// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

let records, writes, sequence;
const newId = () => (sequence++).toString(16).padStart(24, '0');
beforeEach(() => {
  sequence = 1; writes = [];
  records = { eventos: [], personas: [], inscripciones: [], actividades: [], 'categorias-empleado': [], empleados: [], asignacionesActividad: [], habitaciones: [], reservaciones: [], usuarios: [] };
  sessionStorage.clear(); window.history.replaceState({}, '', '/');
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
    const [resource, id] = String(url).replace(/^\/api\/?/, '').split('/');
    const method = options.method || 'GET';
    const user = { id:'aaaaaaaaaaaaaaaaaaaaaaaa', nombreUsuario:'prueba', rol:'ADMINISTRADOR', estado:'ACTIVO' };
    let value;
    if (resource === 'auth') value = id === 'login' ? { token:'token-simulado', usuario:user } : user;
    else if (records[resource]) {
      if (method === 'GET') value = id ? records[resource].find(item => item._id === id) : records[resource];
      else {
        const body = JSON.parse(options.body); writes.push({ resource, method, body, headers:options.headers });
        if (method === 'POST') { value = { _id:newId(), createdAt:new Date().toISOString(), ...body }; records[resource].push(value); }
        else if (method === 'PUT') { value = records[resource].find(item => item._id === id); Object.assign(value, body); }
      }
    }
    return { ok:true, status:200, json:async () => ({ success:true, data:value }) };
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('flujos con la API simulada', () => {
  it('inicia sesión, registra evento y participante, y marca la asistencia', async () => {
    const user = userEvent.setup(); render(<App/>);
    await user.click(screen.getByRole('button', { name:'Ingresar al sistema NicaAcro' }));
    await user.type(screen.getByLabelText('Usuario'), 'prueba');
    await user.type(screen.getByLabelText('Contraseña'), 'clave-prueba');
    await user.click(screen.getByRole('button', { name:'EXPLORAR EL PANEL' }));
    await user.click(await screen.findByRole('button', { name:'Eventos', exact:true }));
    await user.click(screen.getByRole('button', { name:'+ Registrar evento' }));
    await user.type(screen.getByLabelText(/^Código/), 'EVT-TEST');
    await user.type(screen.getByLabelText(/^Nombre/), 'Evento de prueba');
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2026-11-12');
    await user.type(screen.getByLabelText(/^Fecha de finalización/), '2026-11-13');
    await user.click(screen.getByRole('button', { name:'Agregar evento' }));
    await screen.findByRole('cell', { name:'Evento de prueba' });
    await user.click(screen.getByRole('button', { name:'Inscripciones', exact:true }));
    await user.click(screen.getByRole('button', { name:'+ Ir a registrar persona' }));
    await user.type(screen.getByLabelText(/^Primer nombre/), 'Ana');
    await user.type(screen.getByLabelText(/^Primer apellido/), 'Prueba');
    await user.type(screen.getByLabelText('Número de identificación'), 'ABC123');
    await user.click(screen.getByRole('button', { name:'Agregar persona', exact:true }));
    await screen.findByText(/La persona se guardó correctamente/);
    await user.click(screen.getByRole('button', { name:'Ir a inscripciones' }));
    await user.selectOptions(screen.getByLabelText(/^Evento/), records.eventos[0]._id);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name:'Confirmar inscripción' }));
    await screen.findByText(/Inscripción guardada correctamente/);
    await user.click(screen.getByRole('button', { name:'Asistencia', exact:true }));
    await user.selectOptions(screen.getByLabelText(/^Evento/), records.eventos[0]._id);
    await user.click(screen.getByRole('button', { name:'Consultar evento' }));
    await user.click(screen.getByRole('button', { name:'Realizar registro' }));
    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name:'Registrar', exact:true }));
    await waitFor(() => expect(records.inscripciones[0].asistencia.estado).toBe('ASISTIO'));
    await user.click(screen.getByRole('button', { name:'Habitaciones', exact:true }));
    await user.click(screen.getByRole('button', { name:'+ Registrar habitación' }));
    let dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Código/), 'H-1');
    await user.type(within(dialog).getByLabelText(/^Nombre/), 'Habitación prueba');
    await user.click(within(dialog).getByRole('button', { name:'Guardar habitación' }));
    await screen.findByText('Habitación registrada.');
    await user.click(screen.getByRole('button', { name:'Reservar', exact:true }));
    dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Código/), 'R-1');
    await user.selectOptions(within(dialog).getByLabelText(/^Persona/), records.personas[0]._id);
    const entry = within(dialog).getByLabelText(/^Fecha de entrada/);
    const exit = within(dialog).getByLabelText(/^Fecha de salida/);
    await user.clear(entry); await user.type(entry, '2026-11-12');
    await user.clear(exit); await user.type(exit, '2026-11-13');
    await user.selectOptions(within(dialog).getByLabelText(/^Estado/), 'CONFIRMADA');
    await user.click(within(dialog).getByRole('button', { name:'Guardar reservación' }));
    await screen.findByText('Reservación registrada.');
    await user.click(screen.getByRole('button', { name:'Check-in / Check-out', exact:true }));
    await user.click(screen.getByRole('button', { name:'Registrar entrada' }));
    await user.click(await screen.findByRole('button', { name:'Registrar salida' }));
    await waitFor(() => expect(records.reservaciones[0].estado).toBe('FINALIZADA'));
    expect(records.reservaciones[0].checkInReal).toBeTruthy();
    expect(records.reservaciones[0].checkOutReal).toBeTruthy();
    expect(writes.map(item => `${item.method} ${item.resource}`)).toEqual(['POST eventos','POST personas','POST inscripciones','PUT inscripciones','POST habitaciones','POST reservaciones','PUT reservaciones','PUT reservaciones']);
    expect(writes.every(item => item.headers.Authorization === 'Bearer token-simulado')).toBe(true);
  }, 20000);
});
