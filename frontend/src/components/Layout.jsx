import React, { useState } from "react";
import {
  LayoutDashboard,
  UsersRound,
  ClipboardCheck,
  CalendarDays,
  ArrowLeftRight,
  CalendarRange,
  Users,
  House,
  TicketCheck,
  ChartColumn,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Dot,
  PanelTop,
} from "lucide-react";
import { exampleEvents } from "../data/demo";
const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Participantes", "/participantes", UsersRound],
  ["Inscripciones", "/inscripciones", ClipboardCheck],
  ["Check in / Check out", "/asistencia", ArrowLeftRight],
  ["Eventos y Actividades", "/eventos", CalendarDays],
  ["Visualizar Cronograma", "/cronograma", CalendarRange],
  ["Staff", "/staff", Users],
  ["Alojamiento", "/alojamiento", House],
  ["Reservaciones", "/reservaciones", TicketCheck],
];
function LinkItem({ label, url, Icon, active, navigate, close }) {
  return (
    <button
      className={
        "side-link " +
        (active === url || active.startsWith(url + "/") ? "side-active" : "")
      }
      onClick={() => {
        navigate(url);
        close();
      }}
    >
      <Icon size={16} strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}
export default function Layout({
  navigate,
  title,
  active,
  online,
  demo,
  preview,
  setPreview,
  cerrarSesion,
  children,
}) {
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const dateText = new Intl.DateTimeFormat("es-NI", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="mobile-overlay"
          onClick={() => setMobile(false)}
          aria-label="Cerrar menú"
        />
      )}
      <aside className={"sidebar " + (mobile ? "show-mobile" : "")}>
        <div className="sidebar-brand">
          <img src="/images/logo.svg" alt="NicaAcro Festival Play" />
          <strong>NICACRO</strong>
          <span>F E S T I V A L &nbsp; P L A Y</span>
          <em>Administrador</em>
        </div>
        <div className="sidebar-nav">
          {nav.map(([label, url, Icon]) => (
            <LinkItem
              key={url}
              label={label}
              url={url}
              Icon={Icon}
              active={active}
              navigate={navigate}
              close={() => setMobile(false)}
            />
          ))}
        </div>
        <div className="sidebar-lower">
          <LinkItem
            label="Reportes"
            url="/reportes"
            Icon={ChartColumn}
            active={active}
            navigate={navigate}
            close={() => setMobile(false)}
          />
          <LinkItem
            label="Administración"
            url="/administracion"
            Icon={Settings}
            active={active}
            navigate={navigate}
            close={() => setMobile(false)}
          />
        </div>
        <button className="sidebar-logout" onClick={cerrarSesion}>
          <LogOut size={16} /> Cerrar Sesión
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
              <p>NICACRO FESTIVAL PLAY · Administrador</p>
            </div>
          </div>
          <div className="top-actions">
            <button
              className="preview-switch"
              type="button"
              onClick={() => setPreview((v) => !v)}
            >
              {preview ? "Ver datos reales" : "Ver ejemplo"}
            </button>
            <form
              className="event-search"
              onSubmit={(e) => {
                e.preventDefault();
                const term = search.trim().toLocaleLowerCase("es");
                const event = exampleEvents.find((ev) =>
                  [ev.nombre, ev.codigo].some((t) =>
                    t.toLocaleLowerCase("es").includes(term),
                  ),
                );
                if (term && event) {
                  setSearchError("");
                  navigate("/eventos/" + event._id);
                } else
                  setSearchError(
                    "Solo se pueden buscar los dos eventos visuales de ejemplo; la API de eventos está pendiente.",
                  );
              }}
            >
              <Search size={16} />
              <input
                aria-label="Buscar evento"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar evento"
              />
              <button type="submit">Buscar</button>
            </form>
            <span className="today">
              {dateText} <Dot size={17} color="#8fbe61" />
            </span>
          </div>
        </header>
        {searchError && (
          <div className="system-banner" role="status">
            {searchError}
            <button
              onClick={() => setSearchError("")}
              aria-label="Cerrar"
              className="ghost-button"
            >
              ×
            </button>
          </div>
        )}
        {(demo || online === false) && (
          <div className="system-banner">
            <span>
              <strong>{demo ? "Vista previa" : "API desconectada"}</strong> ·{" "}
              {demo
                ? "Los participantes visibles son ejemplos de diseño; no son registros de MongoDB."
                : "Comprueba la conexión con el backend."}
            </span>
            <div className="banner-actions">
              <label>
                <input
                  type="checkbox"
                  checked={preview}
                  onChange={(e) => setPreview(e.target.checked)}
                />{" "}
                Forzar ejemplos
              </label>
              {demo && (
                <button onClick={() => setPreview(false)}>
                  Usar datos reales
                </button>
              )}
            </div>
          </div>
        )}
        <main id="contenido" className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
