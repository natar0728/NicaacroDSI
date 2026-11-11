import { useCallback, useEffect, useState } from 'react';
import { api, borrarToken, obtenerToken } from './api/client';
import { useCollections } from './hooks/useCollections';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import Dashboard from './pages/Dashboard';
import { Events, EventForm, EventDetail } from './pages/Events';
import Participants from './pages/Participants';
import PersonForm from './pages/PersonForm';
import Enrollment from './pages/Enrollment';
import Attendance from './pages/Attendance';
import { Activities, Assignment } from './pages/Activities';
import Schedule from './pages/Schedule';
import { Staff, StaffForm } from './pages/Staff';
import { Rooms, Reservations, LodgingCheckIn } from './pages/Lodging';
import Administration from './pages/Administration';
import Reports from './pages/Reports';

function locationNow() { return { path: decodeURIComponent(window.location.pathname).replace(/\/+$/, '') || '/', search: window.location.search }; }
export default function App() {
  const [location, setLocation] = useState(locationNow); const [usuario, setUsuario] = useState(null); const [checking, setChecking] = useState(() => Boolean(obtenerToken())); const [sessionError, setSessionError] = useState(''); const [toast, setToast] = useState(''); const [selectedEvent, setEvent] = useState(() => sessionStorage.getItem('nicaacro_evento') || '');
  const { data, errors, loading, refresh, clear } = useCollections(usuario);
  const navigate = useCallback((to) => { window.history.pushState({}, '', to); setLocation(locationNow()); window.scrollTo({ top: 0, behavior: 'auto' }); }, []);
  const setSelectedEvent = useCallback((id) => { setEvent(id); if (id) sessionStorage.setItem('nicaacro_evento', id); else sessionStorage.removeItem('nicaacro_evento'); }, []);
  const notify = useCallback((message) => { setToast(message); }, []);
  const cerrarSesion = useCallback(() => { borrarToken(); setUsuario(null); clear(); setSelectedEvent(''); navigate('/login'); }, [clear, navigate, setSelectedEvent]);
  useEffect(() => { const onPop = () => setLocation(locationNow()); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, []);
  useEffect(() => { window.addEventListener('nicaacro:sesion-finalizada', cerrarSesion); return () => window.removeEventListener('nicaacro:sesion-finalizada', cerrarSesion) }, [cerrarSesion]);
  useEffect(() => { if (!obtenerToken()) return; let active = true; api.auth.me().then(user => { if (active) setUsuario(user) }).catch(error => { if (active) { if (error.status === 401) borrarToken(); setSessionError(error.message) } }).finally(() => { if (active) setChecking(false) }); return () => { active = false } }, []);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 4500); return () => window.clearTimeout(t) }, [toast]);
  if (checking) return <div className="nx-loading">Comprobando sesión…</div>;
  if (location.path === '/') return <Welcome navigate={navigate} />;
  if (!usuario) return <><Login onLogin={(user) => { setSessionError(''); setUsuario(user); navigate('/menu') }} />{sessionError && <div className="nx-session-error" role="alert">{sessionError}</div>}</>;
  const common = { data, errors, loading, refresh, navigate, notify, selectedEvent, setSelectedEvent, query: new URLSearchParams(location.search), usuario };
  const path = location.path; let page, title;
  if (usuario.rol === 'STAFF') { title = 'Mi cronograma'; page = <Schedule {...common} /> }
  else if (path === '/login' || path === '/menu') { title = 'Menú principal'; page = <AdminHome navigate={navigate} /> }
  else if (path === '/dashboard') { title = 'Dashboard'; page = <Dashboard {...common} /> }
  else if (path === '/eventos') { title = 'Eventos'; page = <Events {...common} /> }
  else if (path === '/eventos/nuevo') { title = 'Nuevo evento'; page = <EventForm {...common} /> }
  else if (/^\/eventos\/[^/]+\/editar$/.test(path)) { title = 'Editar evento'; page = <EventForm {...common} id={path.split('/')[2]} /> }
  else if (/^\/eventos\/[^/]+$/.test(path)) { title = 'Detalle del evento'; page = <EventDetail {...common} id={path.split('/')[2]} /> }
  else if (path === '/participantes') { title = 'Participantes'; page = <Participants {...common} /> }
  else if (path === '/personas/nueva' || path === '/participantes/nuevo') { title = 'Registrar persona'; page = <PersonForm {...common} /> }
  else if (/^\/participantes\/[^/]+\/editar$/.test(path)) { title = 'Editar persona'; page = <PersonForm {...common} id={path.split('/')[2]} /> }
  else if (path === '/inscripciones') { title = 'Inscripciones'; page = <Enrollment {...common} key={location.search} /> }
  else if (path === '/asistencia') { title = 'Control de asistencia'; page = <Attendance {...common} /> }
  else if (path === '/actividades') { title = 'Actividades'; page = <Activities {...common} /> }
  else if (path === '/actividades/asignar') { title = 'Asignar actividad'; page = <Assignment {...common} /> }
  else if (path === '/cronograma') { title = 'Cronograma'; page = <Schedule {...common} /> }
  else if (path === '/staff') { title = 'Staff'; page = <Staff {...common} /> }
  else if (path === '/staff/nuevo') { title = 'Registrar empleado'; page = <StaffForm {...common} key={location.search} /> }
  else if (path === '/alojamiento') { title = 'Alojamiento'; page = <Rooms {...common} /> }
  else if (path === '/reservaciones') { title = 'Reservaciones'; page = <Reservations {...common} key={location.search} /> }
  else if (path === '/checkin') { title = 'Check-in / Check-out'; page = <LodgingCheckIn {...common} /> }
  else if (path === '/reportes') { title = 'Reportes'; page = <Reports {...common} /> }
  else if (path === '/administracion' && usuario.rol === 'ADMINISTRADOR') { title = 'Usuarios'; page = <Administration {...common} /> }
  else { title = 'Página no encontrada'; page = <div className="nx-page"><p>No se encontró esta pantalla.</p><button className="nx-secondary" onClick={() => navigate('/dashboard')}>Ir al dashboard</button></div> }
  return <Layout navigate={navigate} title={title} active={path} usuario={usuario} eventos={data.eventos} errores={errors} cerrarSesion={cerrarSesion}>{toast && <div className="nx-toast" role="status">{toast}<button onClick={() => setToast('')} aria-label="Cerrar">×</button></div>}{page}</Layout>;
}
