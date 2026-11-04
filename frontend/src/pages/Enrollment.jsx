import { useMemo, useState, useEffect } from "react";
import {
  Check,
  Search,
  UserRound,
  CalendarDays,
  CalendarCheck2,
  LockKeyhole,
  ArrowDown,
  Info,
  ScanLine,
  CheckCircle2,
} from "lucide-react";
import { fullName, personCode, exampleEvents } from "../data/demo";
import { Banner, Back } from "../components/UI";
const labels = [
  "Participante",
  "Evento",
  "Datos de inscripción",
  "Confirmación",
  "Código QR",
];
export default function Enrollment({ navigate, people, demo, peopleLoading }) {
  const query = new URLSearchParams(window.location.search);
  const preselected = query.get("persona");
  const [search, setSearch] = useState(""),
    [personId, setPersonId] = useState(preselected || ""),
    [eventId, setEventId] = useState("demo-event-2"),
    [type, setType] = useState("ANTICIPADO"),
    [mode, setMode] = useState("EVENTO"),
    [attendance, setAttendance] = useState("PENDIENTE"),
    [accepted, setAccepted] = useState(false);
  useEffect(() => {
    if (preselected) setPersonId(preselected);
  }, [preselected]);
  const participants = people.filter((p) => p.tipoPersona === "PARTICIPANTE");
  const matches = useMemo(
    () =>
      participants
        .filter((p) =>
          [fullName(p), personCode(p), p.correo]
            .join(" ")
            .toLocaleLowerCase("es")
            .includes(search.toLocaleLowerCase("es")),
        )
        .slice(0, 8),
    [participants, search],
  );
  const person = participants.find((p) => p._id === personId);
  const event = exampleEvents.find((e) => e._id === eventId);
  return (
    <div className="enrollment">
      <div className="enrollment-heading">
        <div>
          <h2>Inscribir participante existente</h2>
          <p>
            Completa los datos, confirma la inscripción y luego genera o asocia
            su código QR.
          </p>
        </div>
        <span className="soft-badge">● Sin confirmar</span>
      </div>
      <Banner>
        Formulario preparado para integrarse. En el backend actual no hay
        endpoints de inscripciones, eventos ni emisión de QR. La confirmación
        permanece deshabilitada.
      </Banner>
      <div className="stepper">
        {labels.map((label, i) => (
          <div
            className={
              "step " + (i === 3 ? "current" : i === 4 ? "locked" : "done")
            }
            key={label}
          >
            <b>
              {i < 3 ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
            </b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="enroll-grid">
        <div className="enroll-left">
          <section className="white-panel enroll-box">
            <div className="step-title">
              <b>01</b>
              <div>
                <h3>Buscar participante existente</h3>
                <p>
                  Busca por nombre, documento o ID y selecciona un registro.
                </p>
              </div>
              <CheckCircle2 size={16} />
            </div>
            <div className="inline-search">
              <Search size={17} />
              <input
                aria-label="Buscar participante existente"
                placeholder="Ej. María Gómez"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={() => setSearch("")}>Limpiar</button>
            </div>
            <div className="picker-table">
              <div className="picker-row table-header">
                <strong>Participante</strong>
                <strong>ID / Documento</strong>
                <strong>Selección</strong>
              </div>
              {peopleLoading ? (
                <p>Cargando…</p>
              ) : matches.length ? (
                matches.map((p) => (
                  <button
                    className={
                      "picker-row " + (p._id === personId ? "is-selected" : "")
                    }
                    onClick={() => setPersonId(p._id)}
                    key={p._id}
                  >
                    <span>{fullName(p)}</span>
                    <span>{personCode(p)}</span>
                    <span>
                      {p._id === personId ? "✓ Seleccionado" : "Seleccionar"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="picker-no-results">
                  No se encontraron personas.
                </div>
              )}
            </div>
            {person && (
              <p className="selected-caption">
                <UserRound size={15} /> Registro seleccionado ·{" "}
                {person.correo || "Sin correo"} ·{" "}
                {person.telefono || "Sin teléfono"}
              </p>
            )}
            {demo && (
              <p className="small-warning">
                Estos registros son ejemplos, no datos reales.
              </p>
            )}
          </section>
          <section className="white-panel enroll-box">
            <div className="step-title">
              <b>02</b>
              <div>
                <h3>Seleccionar el evento</h3>
                <p>
                  Eventos de ejemplo; falta la colección de eventos en el
                  backend.
                </p>
              </div>
              <CheckCircle2 size={16} />
            </div>
            <label className="enroll-label">
              Evento *
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                {exampleEvents.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </label>
            <div className="info-strip">
              <CalendarDays size={16} /> {event?.inicio} · {event?.lugar}
            </div>
          </section>
          <section className="white-panel enroll-box">
            <div className="step-title">
              <b>03</b>
              <div>
                <h3>Datos específicos de la inscripción</h3>
                <p>Los campos con * son obligatorios para este evento.</p>
              </div>
              <CheckCircle2 size={16} />
            </div>
            <p className="enroll-label">Tipo de registro *</p>
            <div className="type-radio">
              <label className={type === "ANTICIPADO" ? "selected" : ""}>
                <input
                  type="radio"
                  name="register"
                  checked={type === "ANTICIPADO"}
                  onChange={() => setType("ANTICIPADO")}
                />
                <span>
                  <strong>Anticipado</strong>
                  <small>Antes del día del evento</small>
                </span>
              </label>
              <label className={type === "WALK_IN" ? "selected" : ""}>
                <input
                  type="radio"
                  name="register"
                  checked={type === "WALK_IN"}
                  onChange={() => setType("WALK_IN")}
                />
                <span>
                  <strong>Walk-in</strong>
                  <small>En el lugar del evento</small>
                </span>
              </label>
            </div>
            <label className="enroll-label">
              Modalidad *
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="EVENTO">Evento</option>
                <option value="EVENTO_Y_HOSTAL">Evento y hostal</option>
              </select>
            </label>
            <label className="enroll-label">
              Asistencia *
              <select
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="PRESENTE">Presente</option>
              </select>
            </label>
          </section>
        </div>
        <div className="enroll-right">
          <section className="white-panel enroll-box">
            <div className="step-title">
              <b className="dark-number">03</b>
              <div>
                <h3>Confirmar inscripción</h3>
                <p>Revisa los datos antes de guardar.</p>
              </div>
            </div>
            <div className="summary-table">
              {[
                ["Participante", person ? fullName(person) : "Sin seleccionar"],
                ["Evento", event?.nombre || "—"],
                ["Fecha del evento", event?.inicio || "—"],
                [
                  "Tipo de registro",
                  type === "WALK_IN" ? "Walk-in" : "Anticipado",
                ],
                ["Modalidad", mode === "EVENTO" ? "Evento" : "Evento y hostal"],
                [
                  "Asistencia",
                  attendance === "PENDIENTE" ? "Pendiente" : "Presente",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <strong>{label}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <label className="consent-check">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />{" "}
              He verificado los datos del participante y de esta inscripción.
            </label>
            <button
              className="dark-green-btn confirm-disabled"
              disabled
              title="La API no tiene endpoint de inscripciones"
            >
              <Check size={16} /> Confirmar inscripción
            </button>
            <p className="fine-print">
              Para confirmar se necesita el endpoint de creación de
              inscripciones y sus validaciones de negocio.
            </p>
          </section>
          <div className="down-guide">
            <ArrowDown size={17} />
            <small>SOLO DESPUÉS DE CONFIRMAR</small>
          </div>
          <section className="white-panel enroll-box qr-panel">
            <div className="step-title">
              <b className="number-disabled">05</b>
              <div>
                <h3>Generar o asociar QR</h3>
                <p>Pendiente de confirmar la inscripción.</p>
              </div>
              <LockKeyhole size={18} />
            </div>
            <div className="amber-note">
              <LockKeyhole size={17} /> Confirma primero. Después podrás generar
              o asociar un código QR.
            </div>
            <label className="qr-choice">
              <input type="radio" disabled /> Generar un QR nuevo{" "}
              <small>Crear un código único para esta inscripción.</small>
            </label>
            <label className="qr-choice">
              <input type="radio" disabled /> Asociar un QR existente{" "}
              <small>Escanear o introducir un código ya emitido.</small>
            </label>
            <label className="enroll-label">
              Código QR existente
              <input
                disabled
                placeholder="Escanear o introducir el identificador"
              />
            </label>
            <div className="qr-buttons">
              <button disabled>
                <ScanLine size={15} /> Escanear
              </button>
              <button disabled>Validar código</button>
            </div>
            <button className="disabled-long" disabled>
              Generar QR
            </button>
            <p className="fine-print">
              Sin QR emitido. La descarga estará disponible cuando se complete
              este paso.
            </p>
          </section>
        </div>
      </div>
      <div className="enroll-footer">
        <Back navigate={navigate} />
      </div>
    </div>
  );
}
