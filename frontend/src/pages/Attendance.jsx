import { useState } from 'react';
import { api } from '../api/client';
import { Badge, EventSelector, Field, Modal, Notice, PageTitle, Problem, Stats, Table } from '../components/Common';
import { enumLabel, fold, formatDateTime, fullName, idOf, personCode } from '../lib/format';

// Solo se controla la asistencia de eventos que se están realizando.
const ATTENDANCE_EVENT_STATE = 'EN_CURSO';

export default function Attendance({ data, errors, loading, refresh, notify, selectedEvent, setSelectedEvent }) {
  const [draft, setDraft] = useState(selectedEvent || '');
  const [ready, setReady] = useState(Boolean(selectedEvent));
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const activeEvents = data.eventos.filter(e => e.estado === ATTENDANCE_EVENT_STATE);
  // El evento consultado debe seguir "En curso"; si cambió de estado se vuelve
  // automáticamente a la pantalla inicial.
  const event = activeEvents.find(e => idOf(e) === selectedEvent);
  const consulted = ready && Boolean(event);
  // Evita que el selector apunte a un evento que no está en la lista.
  const draftValue = activeEvents.some(e => idOf(e) === draft) ? draft : '';

  const records = consulted ? data.inscripciones.filter(i => idOf(i.eventoId) === selectedEvent && i.estadoInscripcion === 'CONFIRMADA') : [];
  const rows = records.map(i => ({ record: i, person: data.personas.find(p => idOf(p) === idOf(i.personaId)) })).filter(({ person: p }) => p && fold(`${fullName(p)} ${personCode(p)} ${idOf(p)}`).includes(fold(search)));
  const count = (state) => records.filter(r => (r.asistencia?.estado || 'PENDIENTE') === state).length;

  function consult() {
    if (!draftValue) return;
    setSelectedEvent(draftValue);
    setSearch('');
    setReady(true);
  }
  function backToStart() {
    setReady(false);
    setSearch('');
    setSelected(null);
  }

  return <div className="nx-page"><PageTitle title="Control de asistencia" description="Seleccione el evento para registrar la asistencia de sus participantes." action={consulted&&<button type="button" className="nx-secondary" onClick={backToStart}>← Regresar a pantalla inicial</button>}/><Problem errors={errors} keys={['eventos','inscripciones','personas']} loading={loading}/>
    {!consulted&&<section className="nx-card"><EventSelector events={activeEvents} value={draftValue} onChange={v=>{setDraft(v);setReady(false)}} onSubmit={consult}/>{!loading&&!errors.eventos&&!activeEvents.length&&<p className="nx-muted">No hay eventos en curso para controlar la asistencia.</p>}</section>}
    {consulted&&<><h3 className="nx-subheading">{event.codigo} · {event.nombre}</h3><Stats items={[{label:'Confirmados',value:errors.inscripciones?'—':records.length},{label:'Asistió',value:errors.inscripciones?'—':count('ASISTIO')},{label:'Sin marcar',value:errors.inscripciones?'—':count('PENDIENTE')},{label:'No asistió',value:errors.inscripciones?'—':count('NO_ASISTIO')}]}/>
      <section className="nx-card"><Field label="Buscar participante"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, código o documento"/></Field><Table headers={['Código','Participante','Identificación','Modalidad','Asistencia','Registro','Acción']} rows={rows.map(({record:r,person:p})=>({key:r._id,cells:[r.codigoInscripcion||personCode(p),fullName(p),personCode(p),enumLabel(r.modalidad),<Badge>{enumLabel(r.asistencia?.estado||'PENDIENTE')}</Badge>,formatDateTime(r.asistencia?.fechaRegistro),<div className="nx-actions"><button onClick={()=>setSelected({record:r,person:p})}>Realizar registro</button></div>]}))}/></section></>}
    {selected&&<AttendanceModal selected={selected} event={event} close={()=>setSelected(null)} refresh={refresh} notify={notify}/>}
  </div>;
}

function AttendanceModal({ selected, event, close, refresh, notify }) {
  const [state, setState] = useState(selected.record.asistencia?.estado === 'NO_ASISTIO' ? 'NO_ASISTIO' : 'ASISTIO');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    if (event?.estado !== ATTENDANCE_EVENT_STATE) { setError('Solo se puede registrar asistencia de eventos en curso.'); return; }
    setBusy(true);
    try {
      await api.inscripciones.update(selected.record._id, { asistencia: { estado: state, fechaRegistro: new Date().toISOString() } });
      await refresh(['inscripciones']);
      notify('Asistencia registrada.');
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return <Modal title="Registrar asistencia" onClose={close}><form className="nx-form" onSubmit={save}><p><strong>Participante:</strong> {fullName(selected.person)}</p><p><strong>Evento:</strong> {event?.nombre||'—'}</p>{error&&<Notice error>{error}</Notice>}<div className="nx-radio-row"><label><input type="radio" name="asistencia" checked={state==='ASISTIO'} onChange={()=>setState('ASISTIO')}/> Asistió</label><label><input type="radio" name="asistencia" checked={state==='NO_ASISTIO'} onChange={()=>setState('NO_ASISTIO')}/> No asistió</label></div><div className="nx-form-actions"><button type="button" className="nx-secondary" onClick={close}>Cancelar</button><button className="nx-primary" disabled={busy}>{busy?'Guardando…':'Registrar'}</button></div></form></Modal>;
}
