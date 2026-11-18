import { useState } from 'react';
import { api } from '../api/client';
import { Field, Notice, PageTitle, Problem, Stats, Table } from '../components/Common';
import { dateValue, enumLabel, formatDate, fullName, idOf, localDate } from '../lib/format';

const STATES = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];
const DAY_MINUTES = 24 * 60;

// Las asignaciones antiguas guardan el id de la Persona y las nuevas el del
// Empleado: se acepta cualquiera de los dos.
function employeeFor(data, id) {
  const key = idOf(id);
  if (!key) return undefined;
  return data.empleados.find(e => idOf(e) === key || idOf(e.personaId) === key);
}
// "HH:mm" -> minutos desde las 00:00 (null si el formato no es válido).
function toMinutes(time) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(time || ''));
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes >= 0 && minutes <= DAY_MINUTES ? minutes : null;
}
function addDays(day, amount) {
  const d = new Date(`${day}T12:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  d.setDate(d.getDate() + amount);
  return localDate(d);
}

export default function Schedule({ data, errors, loading, refresh, notify, selectedEvent, usuario }) {
  const [eventId, setEventId] = useState(selectedEvent || '');
  const [employee, setEmployee] = useState('');
  const [day, setDay] = useState(localDate());
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState('dia');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');

  const isStaff = usuario?.rol === 'STAFF';
  const mine = data.empleados.find(e => idOf(e) === idOf(usuario?.empleadoId));
  const mineIds = [idOf(mine), idOf(mine?.personaId), idOf(usuario?.empleadoId)].filter(Boolean);
  const employeeKey = a => idOf(employeeFor(data, a.empleadoId)) || idOf(a.empleadoId);
  const weekEnd = addDays(day, 7);

  const inPeriod = a => {
    const date = dateValue(a.fecha);
    if (!day) return true; // sin fecha: se muestran todas
    return mode === 'semana' ? date >= day && date < weekEnd : date === day;
  };
  const rows = data.asignaciones
    .filter(a =>
      (!isStaff || mineIds.includes(idOf(a.empleadoId))) &&
      (!eventId || idOf(a.eventoId) === eventId) &&
      (!employee || employeeKey(a) === employee || idOf(a.empleadoId) === employee) &&
      (!status || a.estado === status) &&
      inPeriod(a))
    .sort((a, b) => dateValue(a.fecha).localeCompare(dateValue(b.fecha)) || String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')));
  const unique = new Set(rows.map(employeeKey)).size;

  const human = (id) => { const e = employeeFor(data, id); return e ? `${fullName(e.personaId)} · ${e.numeroEmpleado}` : 'Personal no encontrado'; };
  const activityName = a => a.actividadSnapshot?.nombre || data.actividades.find(x => idOf(x) === idOf(a.actividadId))?.nombre || 'Actividad';
  const eventName = a => data.eventos.find(x => idOf(x) === idOf(a.eventoId))?.nombre || '—';

  // Línea de tiempo: una fila por persona con todos sus bloques del día.
  const lanes = [];
  if (mode === 'linea') {
    const byEmployee = new Map();
    rows.forEach(a => {
      const start = toMinutes(a.horaInicio), end = toMinutes(a.horaFin);
      if (start === null || end === null || end <= start) return;
      const key = employeeKey(a);
      if (!byEmployee.has(key)) { byEmployee.set(key, { key, label: human(a.empleadoId), items: [] }); lanes.push(byEmployee.get(key)); }
      byEmployee.get(key).items.push({ a, start, end });
    });
  }

  // Al elegir un evento se salta a su primer día si la fecha actual queda fuera.
  function changeEvent(id) {
    setEventId(id);
    const event = data.eventos.find(e => idOf(e) === id);
    const start = dateValue(event?.fechaInicio), end = dateValue(event?.fechaFin);
    if (start && end && (!day || day < start || day > end)) setDay(start);
  }

  async function update(row, value) {
    if (isStaff || updating || value === row.estado) return;
    setError('');
    setUpdating(row._id);
    try {
      await api.asignaciones.update(row._id, { estado: value });
      await refresh(['asignaciones']);
      notify('Estado actualizado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating('');
    }
  }

  return <div className="nx-page"><PageTitle title={isStaff?'Mi cronograma':'Cronograma general del personal'} description="Consulte las asignaciones por evento, fecha y estado."/><Problem errors={errors} keys={['eventos','empleados','actividades','asignaciones']} loading={loading}/>{error&&<Notice error>{error}</Notice>}
    <section className="nx-card"><div className="nx-filter-grid"><Field label="Evento"><select value={eventId} onChange={e=>changeEvent(e.target.value)}><option value="">Todos</option>{data.eventos.map(e=><option key={e._id} value={e._id}>{e.nombre}</option>)}</select></Field><Field label="Empleado"><select value={employee} onChange={e=>setEmployee(e.target.value)}><option value="">Todos</option>{data.empleados.map(e=><option key={e._id} value={e._id}>{fullName(e.personaId)}</option>)}</select></Field><Field label="Fecha"><input type="date" value={day} onChange={e=>setDay(e.target.value)}/></Field><Field label="Estado"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos</option>{STATES.map(v=><option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field><Field label="Vista"><select value={mode} onChange={e=>setMode(e.target.value)}><option value="dia">Día</option><option value="semana">Semana</option><option value="linea">Línea de tiempo</option></select></Field></div></section>
    <Stats items={[{label:'Personal asignado',value:errors.asignaciones?'—':unique},{label:'Total de actividades',value:errors.asignaciones?'—':rows.length},{label:'Pendientes',value:errors.asignaciones?'—':rows.filter(x=>x.estado==='PENDIENTE').length},{label:'Completadas',value:errors.asignaciones?'—':rows.filter(x=>x.estado==='COMPLETADA').length}]}/>
    {mode==='linea'&&<section className="nx-card"><h3>Línea de tiempo · {day?formatDate(day):'Todas las fechas'}</h3><div className="nx-time-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div><div className="nx-timeline">{lanes.map(lane=><div className="nx-timeline-row" key={lane.key}><strong>{lane.label}</strong><div>{lane.items.map(({a,start,end})=><span key={a._id} title={`${activityName(a)} · ${a.horaInicio}–${a.horaFin} · ${enumLabel(a.estado)}`} style={{left:`${start/DAY_MINUTES*100}%`,width:`${Math.max(1,(end-start)/DAY_MINUTES*100)}%`}}>{activityName(a)}</span>)}</div></div>)}</div>{lanes.length===0&&<p className="nx-muted">No hay asignaciones para esta fecha.</p>}</section>}
    <section className="nx-card"><Table headers={['Fecha','Personal','Actividad','Horario','Evento','Estado']} rows={rows.map(a=>({key:a._id,cells:[formatDate(a.fecha),human(a.empleadoId),activityName(a),`${a.horaInicio||'—'}–${a.horaFin||'—'}`,eventName(a),isStaff?enumLabel(a.estado):<select aria-label="Estado de asignación" value={a.estado} disabled={updating===a._id} onChange={e=>update(a,e.target.value)}>{STATES.map(v=><option key={v} value={v}>{enumLabel(v)}</option>)}</select>]}))}/></section>
  </div>;
}
