import { useState } from 'react';
import {
  LayoutDashboard,
  UsersRound,
  ClipboardCheck,
  CalendarDays,
  CalendarRange,
  Users,
  House,
  TicketCheck,
  LogOut,
  Menu,
  Dot,
  ListChecks,
  BedDouble,
  ChartColumn,
  Settings,
} from 'lucide-react';

const nav = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Participantes', '/participantes', UsersRound],
  ['Inscripciones', '/inscripciones', ClipboardCheck],
  ['Asistencia', '/asistencia', ClipboardCheck],
  ['Eventos', '/eventos', CalendarDays],
  ['Actividades', '/actividades', ListChecks],
  ['Cronograma', '/cronograma', CalendarRange],
  ['Staff', '/staff', Users],
  ['Habitaciones', '/alojamiento', House],
  ['Reservaciones', '/reservaciones', TicketCheck],
  ['Check-in / Check-out', '/checkin', BedDouble],
  ['Reportes', '/reportes', ChartColumn],
];

function LinkItem({ label, url, Icon, active, navigate, close }) {
  return <button type="button" className={'side-link ' + (active === url || active.startsWith(url + '/') ? 'side-active' : '')} onClick={() => { navigate(url); close(); }}><Icon size={16} strokeWidth={1.8} /><span>{label}</span></button>;
}

export default function Layout({
  navigate,
  title,
  active,
  usuario,
  cerrarSesion,
  children,
}) {
  const [mobile, setMobile] = useState(false);
  const isStaff = usuario?.rol === 'STAFF';
  const role = ({ ADMINISTRADOR: 'Administrador', ORGANIZADOR: 'Organizador', STAFF: 'Staff' })[usuario?.rol] || 'Usuario';
  const dateText = new Intl.DateTimeFormat('es-NI', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());

  // La búsqueda de eventos vive en el Dashboard (pages/Dashboard.jsx).
  // Aquí había una copia huérfana de findEvent sin estado ni datos, lo que
  // rompía ESLint (no-undef / no-unused-vars) y el pipeline de CI.
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="mobile-overlay"
          onClick={() => setMobile(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside className={'sidebar ' + (mobile ? 'show-mobile' : '')}>
        <div className="sidebar-brand">
          <img src="/images/logo.png" alt="NicaAcro Festival Play" />
          <strong>NICACRO</strong>
          <span>F E S T I V A L &nbsp; P L A Y</span>
          <em>{role}</em>
        </div>

        <div className="sidebar-nav">
          {(isStaff ? [['Mi cronograma', '/cronograma', CalendarRange]] : nav).map(
            ([label, url, Icon]) => (
              <LinkItem
                key={url}
                {...{ label, url, Icon, active, navigate }}
                close={() => setMobile(false)}
              />
            )
          )}
          {usuario?.rol === 'ADMINISTRADOR' && (
            <LinkItem
              label="Usuarios"
              url="/administracion"
              Icon={Settings}
              {...{ active, navigate }}
              close={() => setMobile(false)}
            />
          )}
        </div>

        <button className="sidebar-logout" onClick={cerrarSesion}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </aside>

      <div className="page-column">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="hamburger"
              aria-label="Abrir menú"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1>{title}</h1>
              <p>NICACRO FESTIVAL PLAY · {role}</p>
            </div>
          </div>

          <div className="top-actions">
            <span className="today">
              {dateText} <Dot size={17} color="#8fbe61" />
            </span>
          </div>
        </header>
        {/* comentario de prueba */}

        <main id="contenido" className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
