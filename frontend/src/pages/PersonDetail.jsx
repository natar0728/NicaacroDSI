import React, { useState } from "react";
import { Pencil, TicketCheck, ShieldCheck } from "lucide-react";
import { fullName, personCode, idLabel } from "../data/demo";
import { Banner, Back, PersonBadge } from "../components/UI";
const sampleHistory = [
  ["Festival de Música 2024", "Principiante", "Confirmado"],
  ["Encuentro de Danza 2025", "Intermedio", "Pendiente"],
  ["Festival Play 2026", "Avanzado", "Confirmado"],
];
export default function PersonDetail({ navigate, people, id, demo }) {
  const person = people.find((p) => p._id === id);
  if (!person)
    return (
      <div className="white-panel detail-missing">
        <h2>Participante no encontrado</h2>
        <p>Comprueba el registro o vuelve a la lista de participantes.</p>
        <Back navigate={navigate} />
      </div>
    );
  const fields = [
    [
      "Nombres",
      [person.primerNombre, person.segundoNombre].filter(Boolean).join(" "),
    ],
    [
      "Apellidos",
      [person.primerApellido, person.segundoApellido].filter(Boolean).join(" "),
    ],
    [
      "Tipo de identificación",
      idLabel[person.tipoIdentificacion] || person.tipoIdentificacion,
    ],
    ["Número de identificación", person.numeroIdentificacion],
    ["Identificador alternativo", person.identificadorAlternativo],
    ["País", person.paisEmisor],
    ["Correo", person.correo],
    ["Teléfono", person.telefono],
  ];
  return (
    <div className="person-detail white-panel">
      <div className="person-hero">
        <div>
          <h2>{fullName(person)}</h2>
          <p>Código: {personCode(person)}</p>
        </div>
        <div>
          <PersonBadge estado={person.estado} />
          <button
            className="blue-button"
            onClick={() => navigate(`/participantes/${id}/editar`)}
          >
            Editar
          </button>
        </div>
      </div>
      <div className="detail-section">
        <h3>Datos Personales</h3>
        <div className="detail-rows">
          {fields
            .filter(([, value]) => value)
            .map(([key, val]) => (
              <div className="detail-row" key={key}>
                <strong>{key}</strong>
                <span>{val}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="detail-section history-section">
        <h3>Historial de Participación</h3>
        {demo ? (
          <>
            <Banner>
              Las participaciones y códigos QR que siguen son tarjetas
              ilustrativas; no existen en la API.
            </Banner>
            {sampleHistory.map(([event, level, status], i) => (
              <div className="history-card" key={event}>
                <div>
                  <strong>{event}</strong>
                  <p>Categoría: {level}</p>
                  <p>Estado: {status}</p>
                  <p>Asistencia: sin datos reales</p>
                </div>
                <div
                  className="qr-placeholder"
                  title="Código QR ilustrativo; no es válido"
                >
                  <TicketCheck size={26} />
                  <span>QR demo</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="history-empty">
            <ShieldCheck size={26} />
            <p>
              El historial de inscripciones y la emisión de códigos QR estarán
              disponibles cuando el backend incorpore estos módulos.
            </p>
            <button
              className="outline-button"
              onClick={() => navigate("/inscripciones")}
            >
              Ver flujo de inscripción
            </button>
          </div>
        )}
      </div>
      <div className="detail-actions">
        <Back navigate={navigate} />
      </div>
    </div>
  );
}
