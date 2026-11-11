import { useState } from 'react';
import { api } from '../api/client';
import { Badge, Field, PageTitle, Problem, Stats, Table, Notice } from '../components/Common';
import { dateValue, enumLabel, fold, formatDate, idOf } from '../lib/format';

const initial = { codigo:'', nombre:'', descripcion:'', fechaInicio:'', fechaFin:'', lugar:'', estado:'PLANIFICADO' };
const statuses = ['PLANIFICADO','EN_CURSO','FINALIZADO','CANCELADO'];
export function Events({ data, errors, loading, navigate }) {
  const [search,setSearch]=useState(''); const [status,setStatus]=useState('');
  const items=data.eventos.filter((e)=>(!status||e.estado===status)&&fold(`${e.codigo} ${e.nombre} ${e.lugar||''}`).includes(fold(search)));
  const count=(s)=>data.eventos.filter(e=>e.estado===s).length;
  return <div className="nx-page"><PageTitle title="Eventos" description="Consulte y organice los eventos de NicaAcro." action={<button className="nx-primary" onClick={()=>navigate('/eventos/nuevo')}>+ Registrar evento</button>}/>
    <Problem errors={errors} keys={['eventos']} loading={loading}/><Stats items={[{label:'Total de eventos',value:errors.eventos?'—':data.eventos.length},{label:'Planificados',value:errors.eventos?'—':count('PLANIFICADO')},{label:'En curso',value:errors.eventos?'—':count('EN_CURSO')}]}/>
    <section className="nx-card"><div className="nx-toolbar"><Field label="Buscar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, código o lugar"/></Field><Field label="Estado"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos</option>{statuses.map(s=><option key={s} value={s}>{enumLabel(s)}</option>)}</select></Field></div>
      <Table headers={['Código','Nombre del evento','Inicio','Fin','Lugar','Estado','Acciones']} rows={items.map(e=>({key:e._id,cells:[e.codigo,e.nombre,formatDate(e.fechaInicio),formatDate(e.fechaFin),e.lugar||'—',<Badge>{enumLabel(e.estado)}</Badge>,<div className="nx-actions"><button onClick={()=>navigate(`/eventos/${e._id}`)}>Ver</button><button onClick={()=>navigate(`/eventos/${e._id}/editar`)}>Editar</button></div>]}))}/>
    </section></div>;
}
export function EventForm({ id, data, errors, loading, refresh, navigate, notify }) {
  const existing=id?data.eventos.find(e=>idOf(e)===id):null;
  if (id && !existing) return <div className="nx-page"><Problem errors={errors} keys={['eventos']} loading={loading}/>{!loading&&!errors.eventos&&<Notice error>No se encontró el evento.</Notice>}<button className="nx-secondary" onClick={()=>navigate('/eventos')}>Regresar</button></div>;
  return <EventFormBody key={id||'new'} existing={existing} refresh={refresh} navigate={navigate} notify={notify}/>;
}
function EventFormBody({ existing, refresh, navigate, notify }) {
  const [form,setForm]=useState(existing?{...initial,...existing,fechaInicio:dateValue(existing.fechaInicio),fechaFin:dateValue(existing.fechaFin)}:initial);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const change=(key)=>(e)=>setForm(f=>({...f,[key]:e.target.value}));
  async function save(e){e.preventDefault();setError('');if(form.fechaFin<form.fechaInicio){setError('La fecha de finalización no puede ser anterior a la fecha de inicio.');return;}setBusy(true);try{const payload={codigo:form.codigo.trim(),nombre:form.nombre.trim(),descripcion:(form.descripcion||'').trim()||null,fechaInicio:form.fechaInicio,fechaFin:form.fechaFin,lugar:(form.lugar||'').trim()||null,estado:form.estado};if(existing)await api.eventos.update(existing._id,payload);else await api.eventos.create(payload);await refresh(['eventos']);notify(existing?'Evento actualizado.':'Evento registrado.');navigate('/eventos');}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div className="nx-page"><PageTitle title={existing?'Editar evento':'Nuevo evento'} description="Complete la información general del evento."/><form className="nx-card nx-form" onSubmit={save}>{error&&<Notice error>{error}</Notice>}<div className="nx-grid-two"><Field label="Código" required><input required value={form.codigo} onChange={change('codigo')}/></Field><Field label="Nombre" required><input required value={form.nombre} onChange={change('nombre')}/></Field><Field label="Fecha de inicio" required><input type="date" required value={form.fechaInicio} onChange={change('fechaInicio')}/></Field><Field label="Fecha de finalización" required><input type="date" required value={form.fechaFin} onChange={change('fechaFin')}/></Field><Field label="Lugar"><input value={form.lugar||''} onChange={change('lugar')}/></Field><Field label="Estado" required><select value={form.estado} onChange={change('estado')}>{statuses.map(s=><option key={s} value={s}>{enumLabel(s)}</option>)}</select></Field></div><Field label="Descripción"><textarea rows="3" value={form.descripcion||''} onChange={change('descripcion')}/></Field><div className="nx-form-actions"><button type="button" className="nx-secondary" onClick={()=>navigate('/eventos')}>Regresar</button><button className="nx-primary" disabled={busy}>{busy?'Guardando…':existing?'Guardar cambios':'Agregar evento'}</button></div></form></div>;
}
export function EventDetail({ id, data, errors, loading, navigate }) {
  const event=data.eventos.find(e=>idOf(e)===id);
  if(!event)return <div className="nx-page"><Problem errors={errors} keys={['eventos']} loading={loading}/>{!loading&&!errors.eventos&&<Notice error>No se encontró el evento.</Notice>}<button className="nx-secondary" onClick={()=>navigate('/dashboard')}>Regresar al dashboard</button></div>;
  const ins=data.inscripciones.filter(i=>idOf(i.eventoId)===id && i.estadoInscripcion!=='CANCELADA');
  const staff=new Set(data.asignaciones.filter(a=>idOf(a.eventoId)===id && a.estado!=='CANCELADA').map(a=>idOf(a.empleadoId))).size;
  return <div className="nx-page"><PageTitle title="Detalle del evento" description="Información e indicadores del evento seleccionado."/><Problem errors={errors} keys={['inscripciones','asignaciones']} loading={loading}/><section className="nx-card"><div className="nx-detail-grid">{[['Código',event.codigo],['Nombre',event.nombre],['Estado',enumLabel(event.estado)],['Fecha de inicio',formatDate(event.fechaInicio)],['Fecha de finalización',formatDate(event.fechaFin)],['Lugar',event.lugar||'—']].map(([a,b])=><div key={a}><small>{a}</small><strong>{b}</strong></div>)}</div></section><h3 className="nx-subheading">Indicadores del evento</h3><Stats items={[{label:'Participantes inscritos',value:errors.inscripciones?'—':ins.length},{label:'Staff asignado',value:errors.asignaciones?'—':staff}]}/><button className="nx-secondary" onClick={()=>navigate('/dashboard')}>← Regresar al dashboard</button></div>;
}
