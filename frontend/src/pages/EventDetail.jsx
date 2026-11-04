import React from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Hotel,
  UsersRound,
} from "lucide-react";
import { exampleEvents } from "../data/demo";
import { StatCard, Banner } from "../components/UI";
export default function EventDetail({ navigate, id }) {
  const event = exampleEvents.find((x) => x._id === id) || exampleEvents[0];
  return (
    <div className="detail-event">
      <div className="breadcrumb">
        Dashboard / <strong>Detalle del evento</strong>
      </div>
      <h2 className="content-title">Detalle del evento</h2>
      <p className="content-subtitle">
        Consulta la información y los indicadores del evento seleccionado.
      </p>
      <Banner>
        Información ilustrativa tomada de las capturas. No existe todavía un
        endpoint de eventos en el backend.
      </Banner>
      <section className="white-panel event-info">
        <div className="section-heading">
          <h3>Información del evento</h3>
          <span className="soft-badge">Evento de ejemplo</span>
        </div>
        <div className="event-fields">
          <div>
            <span>Código</span>
            <strong>{event.codigo}</strong>
          </div>
          <div>
            <span>Nombre</span>
            <strong>{event.nombre}</strong>
          </div>
          <div>
            <span>Estado</span>
            <strong className="green-text">{event.estado}</strong>
          </div>
          <div>
            <span>Fecha de inicio</span>
            <strong>{event.inicio}</strong>
          </div>
          <div>
            <span>Fecha de finalización</span>
            <strong>{event.fin}</strong>
          </div>
          <div>
            <span>Lugar</span>
            <strong>{event.lugar}</strong>
          </div>
        </div>
      </section>
      <div className="event-indicator-title">
        <h3>Indicadores del evento</h3>
        <p>Participantes, alojamiento y equipo asignado · datos de muestra</p>
      </div>
      <div className="event-stats">
        <StatCard
          Icon={UsersRound}
          label="PARTICIPANTES"
          value={event.participantes}
          helper="Inscritos en este evento"
        />
        <StatCard
          Icon={Hotel}
          label="OCUPACIÓN DE ALOJAMIENTO"
          value={event.ocupacion}
          helper="Habitaciones ocupadas"
        />
        <StatCard
          Icon={Users}
          label="STAFF ASIGNADO"
          value={event.staff}
          helper="Personal asignado a este evento"
        />
      </div>
      <button className="dark-green-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={16} /> Regresar al dashboard principal
      </button>
    </div>
  );
}
