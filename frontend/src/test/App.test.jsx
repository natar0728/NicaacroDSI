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
    // Asistencia solo lista eventos "En curso".
    await user.selectOptions(screen.getByLabelText(/^Estado/), 'EN_CURSO');
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

  it('confirma inscripciones, filtra asistencia, regresa a eventos, filtra reservaciones y muestra el cronograma', async () => {
    const id = n => n.toString(16).padStart(24, '0');
    const [eCurso, ePlan, pPart, pEmp, insc, emp, room] = [0xe1, 0xe2, 0xa1, 0xa2, 0xb1, 0xc1, 0xd1].map(id);
    const empleada = { _id:pEmp, tipoPersona:'EMPLEADO', primerNombre:'Elena', primerApellido:'Empleada', estado:'ACTIVA' };
    records.eventos.push(
      { _id:eCurso, codigo:'EVT-CURSO', nombre:'Evento en curso', fechaInicio:'2025-03-10T00:00:00.000Z', fechaFin:'2025-03-12T00:00:00.000Z', estado:'EN_CURSO' },
      { _id:ePlan, codigo:'EVT-PLAN', nombre:'Evento planificado', fechaInicio:'2025-04-10T00:00:00.000Z', fechaFin:'2025-04-11T00:00:00.000Z', estado:'PLANIFICADO' });
    records.personas.push({ _id:pPart, tipoPersona:'PARTICIPANTE', primerNombre:'Ana', primerApellido:'Participante', estado:'ACTIVA' }, empleada);
    records.inscripciones.push({ _id:insc, eventoId:eCurso, personaId:pPart, codigoInscripcion:null, origenRegistro:'PRE_REGISTRO', modalidad:'SOLO_EVENTO', estadoInscripcion:'PENDIENTE', asistencia:{ estado:'PENDIENTE', fechaRegistro:null } });
    records.empleados.push({ _id:emp, numeroEmpleado:'EMP-1', personaId:empleada, estado:'ACTIVO' });
    records.asignacionesActividad.push(
      { _id:id(0xf1), eventoId:eCurso, empleadoId:pEmp, actividadSnapshot:{ nombre:'Montaje' }, fecha:'2025-03-10T00:00:00.000Z', horaInicio:'09:00', horaFin:'11:00', estado:'PENDIENTE' },
      { _id:id(0xf2), eventoId:eCurso, empleadoId:emp, actividadSnapshot:{ nombre:'Limpieza' }, fecha:'2025-03-10T00:00:00.000Z', horaInicio:'13:00', horaFin:'14:00', estado:'PENDIENTE' });
    records.habitaciones.push({ _id:room, codigoHabitacion:'H-1', nombre:'Habitación 1', capacidad:2, estado:'DISPONIBLE' });
    sessionStorage.setItem('nicaacro_token', 'token-simulado');
    window.history.replaceState({}, '', `/inscripciones?persona=${pPart}&evento=${eCurso}`);
    const user = userEvent.setup(); render(<App/>);

    // 1. Inscripciones: una inscripción PENDIENTE se confirma con PUT (no se duplica con POST).
    await screen.findByText('Pendiente', { selector:'.nx-summary-row span' });
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name:'Confirmar inscripción' }));
    await screen.findByText(/Inscripción guardada correctamente/);
    expect(writes.map(w => `${w.method} ${w.resource}`)).toEqual(['PUT inscripciones']);
    expect(writes[0].body.estadoInscripcion).toBe('CONFIRMADA');
    expect(records.inscripciones[0].codigoInscripcion).toMatch(/^INS-EVT-CURSO-/);

    // 2. Asistencia: solo eventos "En curso" y botón para regresar a la pantalla inicial.
    await user.click(screen.getByRole('button', { name:'Asistencia', exact:true }));
    const eventSelect = screen.getByLabelText(/^Evento/);
    expect([...eventSelect.options].map(o => o.value)).toEqual(['', eCurso]);
    await user.selectOptions(eventSelect, eCurso);
    await user.click(screen.getByRole('button', { name:'Consultar evento' }));
    expect(screen.getByRole('cell', { name:'Ana Participante' })).toBeTruthy();
    expect(screen.queryByRole('button', { name:'Consultar evento' })).toBeNull();
    await user.click(screen.getByRole('button', { name:'← Regresar a pantalla inicial' }));
    expect(screen.getByRole('button', { name:'Consultar evento' })).toBeTruthy();
    expect(screen.queryByRole('button', { name:'Realizar registro' })).toBeNull();

    // 3. Detalle de evento: regresa a la pantalla de eventos, no al dashboard.
    await user.click(screen.getByRole('button', { name:'Eventos', exact:true }));
    const row = screen.getByRole('cell', { name:'Evento en curso' }).closest('tr');
    await user.click(within(row).getByRole('button', { name:'Ver' }));
    expect(screen.queryByRole('button', { name:/Regresar al dashboard/ })).toBeNull();
    await user.click(screen.getByRole('button', { name:'← Regresar a eventos' }));
    expect(window.location.pathname).toBe('/eventos');
    expect(screen.getByRole('button', { name:'+ Registrar evento' })).toBeTruthy();

    // 5. Reservar: solo personas de tipo participante.
    await user.click(screen.getByRole('button', { name:'Habitaciones', exact:true }));
    await user.click(screen.getByRole('button', { name:'Reservar', exact:true }));
    const personSelect = within(screen.getByRole('dialog')).getByLabelText(/^Persona/);
    expect([...personSelect.options].map(o => o.value)).toEqual(['', pPart]);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name:'Cancelar' }));

    // 4. Cronograma: al elegir el evento salta a su fecha, agrupa por persona y actualiza estados.
    await user.click(screen.getByRole('button', { name:'Cronograma', exact:true }));
    await user.selectOptions(screen.getByLabelText(/^Evento/), eCurso);
    expect(screen.getByLabelText('Fecha').value).toBe('2025-03-10');
    const stat = label => screen.getByText(label, { selector:'.nx-stat span' }).nextSibling.textContent;
    expect(stat('Total de actividades')).toBe('2');
    expect(stat('Personal asignado')).toBe('1');
    await user.selectOptions(screen.getByLabelText('Vista'), 'linea');
    const lanes = document.querySelectorAll('.nx-timeline-row');
    expect(lanes).toHaveLength(1);
    expect(lanes[0].querySelectorAll('span')).toHaveLength(2);
    await user.selectOptions(screen.getAllByLabelText('Estado de asignación')[0], 'COMPLETADA');
    await waitFor(() => expect(records.asignacionesActividad[0].estado).toBe('COMPLETADA'));
    expect(writes.at(-1)).toMatchObject({ method:'PUT', resource:'asignacionesActividad', body:{ estado:'COMPLETADA' } });
  }, 20000);
});
