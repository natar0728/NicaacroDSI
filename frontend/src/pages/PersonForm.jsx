import React,{useEffect,useState} from 'react';
import {Plus,ArrowRight,Save} from 'lucide-react';
import {api} from '../api/client';
import {Banner,Back} from '../components/UI';
import {idLabel} from '../data/demo';
const blank={tipoPersona:'PARTICIPANTE',primerNombre:'',segundoNombre:'',primerApellido:'',segundoApellido:'',tipoIdentificacion:'CEDULA',numeroIdentificacion:'',identificadorAlternativo:'',paisEmisor:'Nicaragua',correo:'',telefono:'',estado:'ACTIVA'};
const fields=[['tipoPersona','Tipo Persona','select'],['primerNombre','Primer nombre','text'],['segundoNombre','Segundo nombre','text'],['primerApellido','Primer apellido','text'],['segundoApellido','Segundo apellido','text'],['tipoIdentificacion','Tipo de identificación','select'],['numeroIdentificacion','Número de identificación','text'],['identificadorAlternativo','Identificador Alternativo','text'],['paisEmisor','País','text'],['correo','Correo','email'],['telefono','Teléfono','tel']];
const required=['tipoPersona','primerNombre','primerApellido','tipoIdentificacion'];
export default function PersonForm({navigate,people,id,mode,refresh,demo,notify}){
 const original=people.find(p=>p._id===id);
 const editing=mode==='edit';
 const[form,setForm]=useState(blank),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setForm(editing&&original?Object.fromEntries(Object.keys(blank).map(k=>[k,original[k]??''])):blank)},[editing,original?._id]);
 const set=(key,value)=>setForm(prev=>({...prev,[key]:value}));
 const demoRecord=editing&&(id?.startsWith('demo-')||demo);
 async function save(goToEnrollment){
  setError('');
  if(demoRecord){setError('Los registros de ejemplo no se pueden modificar. Conecta la API y usa un participante real.');return}
  if(!form.primerNombre.trim()||!form.primerApellido.trim()){setError('El primer nombre y primer apellido son obligatorios.');return}
  if(form.tipoIdentificacion!=='SIN_DOCUMENTO'&&!form.numeroIdentificacion.trim()){setError('Ingresa el número de identificación o selecciona “Sin documento”.');return}
  if(form.tipoIdentificacion==='SIN_DOCUMENTO'&&!form.identificadorAlternativo.trim()){setError('Ingresa un identificador alternativo para esta persona.');return}
  const payload=Object.fromEntries(Object.entries(form).map(([key,val])=>[key,typeof val==='string'?val.trim()||null:val]));
  if(payload.tipoIdentificacion==='SIN_DOCUMENTO')payload.numeroIdentificacion=null;
  try{setBusy(true);const saved=editing?await api.personas.update(id,payload):await api.personas.create(payload);await refresh();notify(editing?'Persona actualizada correctamente.':'Persona registrada correctamente.');navigate(goToEnrollment?`/inscripciones?persona=${saved._id}`:`/participantes/${saved._id}`)}
  catch(e){setError(e.message)}finally{setBusy(false)}
 }
 const getOptions=k=>k==='tipoPersona'?[['PARTICIPANTE','PARTICIPANTE'],['EMPLEADO','EMPLEADO']]:k==='tipoIdentificacion'?Object.entries(idLabel):[];
 if(editing&&!original)return <section className="white-panel detail-missing"><h2>Buscando persona…</h2><p>No se encontró el registro en la lista. Regresa y vuelve a intentarlo.</p><Back navigate={navigate}/></section>;
 return <div className="person-form-page"><form className="person-form-card" onSubmit={e=>{e.preventDefault();save(false)}}><div className="form-caption">{editing?'Editar Persona':'Nueva Persona'}</div><div className="form-inner"><h3>Datos Personales</h3>{error&&<div role="alert" className="message error">{error}</div>}{demoRecord&&<Banner>Este es un registro de ejemplo. No se puede guardar hasta disponer de datos reales.</Banner>}
  <div className="personal-fields">{fields.map(([key,label,type])=><label className="field-row" key={key}><span>{label}{required.includes(key)&&<i> *</i>}</span>{type==='select'?<select required={required.includes(key)} value={form[key]} onChange={e=>set(key,e.target.value)}>{getOptions(key).map(([value,text])=><option key={value} value={value}>{text}</option>)}</select>:<input type={type} value={form[key]} required={required.includes(key)} onChange={e=>set(key,e.target.value)} disabled={key==='numeroIdentificacion'&&form.tipoIdentificacion==='SIN_DOCUMENTO'} placeholder={key==='correo'?'nombre@correo.com':key==='numeroIdentificacion'?'Ej. NI-204831':''}/>}</label>)}
  <label className="field-row"><span>Estado</span><select value={form.estado} onChange={e=>set('estado',e.target.value)}><option value="ACTIVA">Activa</option><option value="INACTIVA">Inactiva</option></select></label></div></div></form>
  <div className="form-buttons"><Back navigate={navigate}/><button className="blue-button" onClick={()=>save(false)} disabled={busy||demoRecord}><Save size={15}/>{busy?'Guardando…':editing?'Guardar cambios':'Agregar Persona'}</button>{!editing&&<button className="blue-button" onClick={()=>save(true)} disabled={busy}><Plus size={15}/>Agregar e inscribir <ArrowRight size={15}/></button>}</div>
 </div>
}
