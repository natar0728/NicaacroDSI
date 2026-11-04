import React from "react";
import { ArrowRight } from "lucide-react";
export default function AdminHome({ navigate }) {
  return (
    <section className="admin-home">
      <img
        src="/images/admin-poster.svg"
        alt="Fondo artístico geométrico NicaAcro Play"
      />
      <div className="admin-home-overlay">
        <div>
          <span>BIENVENIDO AL SISTEMA</span>
          <h2>
            Gestiona tu festival
            <br />
            con NicaAcro.
          </h2>
          <button onClick={() => navigate("/dashboard")}>
            Ir al Dashboard <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
