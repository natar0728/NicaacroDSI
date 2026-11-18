import { useState } from 'react';
import { api } from '../api/client';
import { Badge, Field, Notice, PageTitle, Problem, Table } from '../components/Common';
import { enumLabel, fold, formatDate, fullName, idOf, personCode } from '../lib/format';

// Estados de evento que admiten inscripciones (mismo criterio que el backend).
const OPEN_EVENT_STATES = ['PLANIFICADO', 'EN_CURSO'];
const isActiveParticipant = p => p?.tipoPersona === 'PARTICIPANTE' && p?.estado === 'ACTIVA';

// El backend no genera un código de inscripción; se crea uno legible aquí.
function enrollmentCode(event) {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INS-${event?.codigo || 'EVT'}-${stamp}${random}`;
}

export default function Enrollment({ data, errors, loading, refresh, navigate, notify, query, selectedEvent }) {
  const [search, setSearch] = useState('');
  const [personId, setPersonId] = useState(query.get('persona') || '');
  const [eventId, setEventId] = useState(query.get('evento') || selectedEvent || '');
  const [origin, setOrigin] = useState('PRE_REGISTRO');
  const [mode, setMode] = useState('SOLO_EVENTO');
  const [attendance, setAttendance] = useState('PENDIENTE');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const people = data.personas.filter(p => isActiveParticipant(p) && fold(`${fullName(p)} ${personCode(p)} ${idOf(p)} ${p.correo || ''}`).includes(fold(search)));
  const events = data.eventos.filter(e => OPEN_EVENT_STATES.includes(e.estado));
  const person = data.personas.find(p => idOf(p) === personId);
  // Solo se considera seleccionado un evento que aparece en el selector; así un
  // evento guardado en sesión que ya finalizó no se envía por error.
  const event = events.find(e => idOf(e) === eventId);
  const existing = personId && eventId
    ? data.inscripciones.find(i => idOf(i.personaId) === personId && idOf(i.eventoId) === eventId)
    : null;

  // Cambiar de persona o de evento habilita una nueva confirmación.
  function selectPerson(id) { setPersonId(id); setDone(null); setError(''); }
  function selectEvent(id) { setEventId(id); setDone(null); setError(''); }

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (errors.inscripciones) { setError('No se pudieron consultar las inscripciones existentes. Intente nuevamente.'); return; }
    if (!personId || !eventId || !accepted) { setError('Seleccione participante y evento y confirme que revisó los datos.'); return; }
    if (!isActiveParticipant(person)) { setError('La persona seleccionada debe ser un participante activo.'); return; }
    if (!event) { setError('Seleccione un evento planificado o en curso.'); return; }
    if (existing?.estadoInscripcion === 'CONFIRMADA') { setError('Esta persona ya tiene una inscripción confirmada para el evento.'); return; }

    const asistencia = { estado: attendance, fechaRegistro: attendance === 'PENDIENTE' ? null : new Date().toISOString() };
    setBusy(true);
    try {
      // Si ya existe una inscripción PENDIENTE o CANCELADA se confirma con PUT
      // (el índice único evento+persona impide crear otra). Si no, se crea.
      const result = existing
        ? await api.inscripciones.update(existing._id, {
          estadoInscripcion: 'CONFIRMADA',
          origenRegistro: origin,
          modalidad: mode,
          asistencia,
          codigoInscripcion: existing.codigoInscripcion || enrollmentCode(event),
        })
        : await api.inscripciones.create({
          personaId: personId,
          eventoId: eventId,
          codigoInscripcion: enrollmentCode(event),
          origenRegistro: origin,
          modalidad: mode,
          estadoInscripcion: 'CONFIRMADA',
          asistencia,
        });
      await refresh(['inscripciones']);
      setDone(result);
      setAccepted(false);
      notify(existing ? 'Inscripción pendiente confirmada.' : 'Inscripción confirmada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const summary = [
    ['Participante', person ? fullName(person) : 'Sin seleccionar'],
    ['Evento', event?.nombre || 'Sin seleccionar'],
    ['Tipo', enumLabel(origin)],
    ['Modalidad', enumLabel(mode)],
    ['Asistencia', enumLabel(attendance)],
  ];
  if (existing && !done) summary.push(['Inscripción actual', enumLabel(existing.estadoInscripcion)]);

  return <div className="nx-page"><PageTitle title="Inscribir participante existente" description="Seleccione la persona, el evento y confirme los datos."/><Problem errors={errors} keys={['personas','eventos','inscripciones']} loading={loading}/><div className="nx-two-column"><div className="nx-stack">
    <section className="nx-card"><h3>01 Buscar participante existente</h3><Field label="Buscar por nombre, identificación o código"><input value={search} onChange={e=>setSearch(e.target.value)}/></Field><Table headers={['Participante','Identificación','Selección']} rows={people.slice(0,15).map(p=>({key:p._id,cells:[fullName(p),personCode(p),<button type="button" className="nx-link" onClick={()=>selectPerson(p._id)}>{personId===p._id?'Seleccionada':'Seleccionar'}</button>]}))}/><button type="button" className="nx-secondary" onClick={()=>navigate('/personas/nueva?origen=inscripcion')}>+ Ir a registrar persona</button></section>
    <section className="nx-card"><h3>02 Seleccionar evento</h3><Field label="Evento" required><select value={event ? eventId : ''} onChange={e=>selectEvent(e.target.value)}><option value="">Seleccione un evento</option>{events.map(e=><option key={e._id} value={e._id}>{e.codigo} · {e.nombre}</option>)}</select></Field>{event&&<p className="nx-muted">{formatDate(event.fechaInicio)} al {formatDate(event.fechaFin)} · {event.lugar||'Lugar no indicado'}</p>}<small className="nx-muted">Se muestran eventos planificados o en curso.</small></section>
    <section className="nx-card"><h3>03 Datos de inscripción</h3><div className="nx-grid-two"><Field label="Tipo de registro"><select value={origin} onChange={e=>setOrigin(e.target.value)}><option value="PRE_REGISTRO">Anticipado</option><option value="WALK_IN">Walk-in</option></select></Field><Field label="Modalidad"><select value={mode} onChange={e=>setMode(e.target.value)}><option value="SOLO_EVENTO">Solo evento</option><option value="EVENTO_Y_HOSTAL">Evento y hostal</option></select></Field><Field label="Asistencia"><select value={attendance} onChange={e=>setAttendance(e.target.value)}>{['PENDIENTE','ASISTIO','NO_ASISTIO'].map(v=><option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field></div></section>
  </div><div className="nx-stack"><form className="nx-card" onSubmit={save}><h3>04 Confirmar inscripción</h3>{summary.map(([label,value])=><div className="nx-summary-row" key={label}><strong>{label}</strong><span>{value}</span></div>)}<label className="nx-check"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/> He verificado los datos de la inscripción.</label>{error&&<Notice error>{error}</Notice>}{done&&<Notice>Inscripción guardada correctamente. {done.codigoInscripcion&&<Badge>{done.codigoInscripcion}</Badge>}</Notice>}<button className="nx-primary nx-full" disabled={busy||Boolean(done)||Boolean(errors.inscripciones)}>{busy?'Guardando…':'Confirmar inscripción'}</button></form><section className="nx-card"><h3>Código QR</h3><p>La API actual no dispone de una función para generar, vincular o enviar códigos QR. La inscripción se guarda sin crear uno.</p></section></div></div></div>;
}
