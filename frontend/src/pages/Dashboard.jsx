import React from "react";
import {
  CalendarDays,
  CalendarCheck2,
  CheckCheck,
  ArrowRight,
  UsersRound,
  BedDouble,
} from "lucide-react";
import { StatCard, Banner } from "../components/UI";
import { exampleEvents } from "../data/demo";
const distribution = [
  ["Lun", 63, 37],
  ["Mar", 58, 42],
  ["Mié", 73, 27],
  ["Jue", 57, 43],
  ["Vie", 68, 32],
  ["Sáb", 76, 24],
  ["Dom", 66, 34],
];
export default function Dashboard({ navigate, people, demo, peopleLoading }) {
  return (
    <div className="dashboard-screen">
      <div className="breadcrumb">
        Dashboard / <strong>Panel de control</strong>
      </div>
      <h2 className="content-title">Dashboard</h2>
      <p className="content-subtitle">
        Consulta el estado general del festival y los recursos disponibles.
      </p>
      <div className="dashboard-stats">
        <StatCard
          Icon={CalendarDays}
          label="EVENTOS PLANIFICADOS"
          value="12"
          helper="Datos de ejemplo · sin API"
        />
        <StatCard
          Icon={CalendarCheck2}
          label="EVENTOS ACTIVOS"
          value="3"
          helper="Datos de ejemplo · sin API"
        />
        <StatCard
          Icon={CheckCheck}
          label="EVENTOS FINALIZADOS"
          value="8"
          helper="Datos de ejemplo · sin API"
        />
      </div>
      <Banner>
        Los indicadores de eventos y alojamiento corresponden a la maqueta. El
        backend proporcionado aún no dispone de estas colecciones.
      </Banner>
      <section className="white-panel dashboard-chart">
        <div className="section-heading">
          <div>
            <h3>Inscripciones por modalidad</h3>
            <p>Distribución visual de ejemplo por día</p>
          </div>
          <div className="legend">
            <span>
              <i style={{ background: "#9fcb63" }} />
              Anticipado
            </span>
            <span>
              <i style={{ background: "#0879ba" }} />
              Walk-in
            </span>
          </div>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label="Gráfico de ejemplo con inscripciones por modalidad"
        >
          <div className="chart-bars">
            {distribution.map(([day, green, blue]) => (
              <div className="bar-column" key={day}>
                <div className="bar-stack">
                  <div className="bar-cap" />
                  <div className="bar-blue" style={{ height: `${blue}%` }} />
                  <div className="bar-green" style={{ height: `${green}%` }} />
                </div>
                <small>{day}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="white-panel room-panel">
        <h3>Resumen de alojamiento</h3>
        <p>Estado visual de reservas y ocupación · ejemplo</p>
        <div className="room-grid">
          <StatCard
            label="RESERVACIONES CONFIRMADAS"
            value="42"
            helper="Dato de la maqueta"
          />
          <StatCard
            label="HABITACIONES OCUPADAS"
            value="38"
            helper="Dato de la maqueta"
          />
        </div>
      </section>
      <div className="dashboard-bottom">
        <div className="white-panel mini-panel">
          <h3>Participantes del sistema</h3>
          <div className="real-stat">
            <strong>
              {peopleLoading
                ? "…"
                : people.filter((p) => p.tipoPersona === "PARTICIPANTE").length}
            </strong>
            <span>
              {demo ? "Personas de ejemplo" : "Registros obtenidos de la API"}
            </span>
          </div>
          <button
            className="outline-button"
            onClick={() => navigate("/participantes")}
          >
            Ver participantes <ArrowRight size={15} />
          </button>
        </div>
        <div className="white-panel mini-panel">
          <h3>Evento destacado</h3>
          <p>{exampleEvents[0].nombre}</p>
          <span className="caption">
            {exampleEvents[0].codigo} · Vista de ejemplo
          </span>
          <button
            className="outline-button"
            onClick={() => navigate("/eventos/demo-event-1")}
          >
            Ver detalle del evento <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
