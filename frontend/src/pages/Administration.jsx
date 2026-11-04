import React, { useEffect, useState } from "react";
import { Database, RefreshCw, Settings } from "lucide-react";
import { api } from "../api/client";
import { Banner } from "../components/UI";
const entries = [
  ["empleados", "Empleados"],
  ["categorias-empleado", "Categorías de empleado"],
  ["actividades", "Actividades"],
  ["usuarios", "Usuarios"],
];
export default function Administration() {
  const [items, setItems] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.all(
      entries.map(async ([id]) => {
        try {
          return [id, await api.catalogo(id), null];
        } catch (e) {
          return [id, [], e.message];
        }
      }),
    );
    setItems(
      Object.fromEntries(
        results.map(([id, result]) => [
          id,
          Array.isArray(result) ? result : [],
        ]),
      ),
    );
    setErrors(
      Object.fromEntries(
        results.filter((x) => x[2]).map(([id, , error]) => [id, error]),
      ),
    );
    setLoading(false);
  };
  useEffect(() => {
    fetchAll();
  }, []);
  return (
    <section className="administration">
      <div className="section-heading">
        <div>
          <h2>Administración</h2>
          <p>Consulta de colecciones disponibles en el backend.</p>
        </div>
        <button className="outline-button" onClick={fetchAll}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>
      <Banner>
        La propuesta de diseño compartida cubre los módulos visuales
        principales. Esta sección permite verificar los cuatro catálogos
        adicionales existentes, sin inventar sus pantallas definitivas.
      </Banner>
      <div className="admin-catalog-grid">
        {entries.map(([id, label]) => (
          <div className="white-panel admin-catalog" key={id}>
            <Database size={22} />
            <span>{label}</span>
            <strong>
              {loading ? "…" : errors[id] ? "—" : (items[id]?.length ?? 0)}
            </strong>
            <small>{errors[id] || "Registros devueltos por la API"}</small>
            <details>
              <summary>Ver registros</summary>
              {items[id]?.length ? (
                <div className="admin-catalog-list">
                  {items[id].slice(0, 15).map((item, index) => (
                    <pre key={item._id || index}>
                      {JSON.stringify(
                        {
                          nombre:
                            item.nombre ||
                            item.nombreUsuario ||
                            item.numeroEmpleado ||
                            item.codigo,
                          estado: item.estado,
                          id: item._id,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  ))}
                </div>
              ) : (
                <p>Sin datos disponibles.</p>
              )}
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}
