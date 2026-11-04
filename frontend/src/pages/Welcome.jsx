import React from "react";
export default function Welcome({ navigate }) {
  return (
    <main className="splash">
      <img
        className="splash-image"
        src="/images/referencia-inicio.png"
        alt="Arte del Festival Play de NicaAcro"
      />
      <div className="splash-bottom">
        <span>NICACRO · FESTIVAL PLAY</span>
        <button onClick={() => navigate("/login")}>
          Acceder al sistema <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}
