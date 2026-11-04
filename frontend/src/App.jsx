import React,{useEffect,useState,useCallback} from 'react';
import {api} from './api/client';
import {examplePeople} from './data/demo';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import Participants from './pages/Participants';
import PersonDetail from './pages/PersonDetail';
import PersonForm from './pages/PersonForm';
import Enrollment from './pages/Enrollment';
import Administration from './pages/Administration';
import Pending from './pages/Pending';

function currentPath(){return decodeURIComponent(window.location.pathname).replace(/\/+$/,'')||'/';}

export default function App(){
  const[path,setPath]=useState(currentPath);
  const[people,setPeople]=useState([]);
  const[peopleLoading,setPeopleLoading]=useState(true);
  const[peopleError,setPeopleError]=useState('');
  const[online,setOnline]=useState(null);
  const[toast,setToast]=useState('');
  const[preview,setPreview]=useState(false);
  const navigate=useCallback((to)=>{window.history.pushState({},'',to);setPath(currentPath());window.scrollTo({top:0,behavior:'instant'});},[]);
  useEffect(()=>{const handle=()=>setPath(currentPath());window.addEventListener('popstate',handle);return()=>window.removeEventListener('popstate',handle)},[]);
  const refresh=useCallback(async()=>{
    setPeopleLoading(true);
    try{const result=await api.personas.list();setPeople(Array.isArray(result)?result:[]);setPeopleError('');}
    catch(e){setPeople([]);setPeopleError(e.message)}
    finally{setPeopleLoading(false)}
  },[]);
  useEffect(()=>{refresh();api.health().then(()=>setOnline(true)).catch(()=>setOnline(false));},[refresh]);
  const demo=preview||Boolean(peopleError);
  const visiblePeople=demo?examplePeople:people;
  const context={navigate,people:visiblePeople,peopleLoading,peopleError,online,demo,preview,setPreview,refresh,notify:setToast};
  let page,title='NicaAcro';
  if(path==='/')return <Welcome navigate={navigate}/>;
  if(path==='/login')return <Login navigate={navigate}/>;
  if(path==='/menu'){page=<AdminHome navigate={navigate}/>;title='Menú administrador';}
  else if(path==='/dashboard'){page=<Dashboard {...context}/>;title='Dashboard';}
  else if(path==='/participantes'){page=<Participants {...context}/>;title='Participantes';}
  else if(path==='/participantes/nuevo'){page=<PersonForm {...context} mode="create"/>;title='Registrar persona';}
  else if(/^\/participantes\/[^/]+\/editar$/.test(path)){page=<PersonForm {...context} mode="edit" id={path.split('/')[2]}/>;title='Editar persona';}
  else if(/^\/participantes\/[^/]+$/.test(path)){page=<PersonDetail {...context} id={path.split('/')[2]}/>;title='Detalle participante';}
  else if(path==='/inscripciones'){page=<Enrollment {...context}/>;title='Inscripciones';}
  else if(/^\/eventos\/[^/]+$/.test(path)){page=<EventDetail {...context} id={path.split('/')[2]}/>;title='Detalle del evento';}
  else if(path==='/administracion'){page=<Administration {...context}/>;title='Administración';}
  else if(path==='/eventos'){page=<Pending title="Eventos y actividades" detail="El backend no incluye un recurso de eventos. El detalle de evento es una vista de ejemplo, accesible desde Dashboard." navigate={navigate}/>;title='Eventos y actividades';}
  else {const names={'/asistencia':'Check in / Check out','/cronograma':'Visualizar cronograma','/staff':'Staff','/alojamiento':'Alojamiento','/reservaciones':'Reservaciones','/reportes':'Reportes'};title=names[path]||'Página no encontrada';page=<Pending title={title} navigate={navigate}/>;}
  return <Layout {...context} title={title} active={path}>
    {toast&&<div role="status" className="toast" onClick={()=>setToast('')}>{toast}<button aria-label="Cerrar aviso">×</button></div>}
    {page}
  </Layout>;
}
