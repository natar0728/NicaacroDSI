import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

const resources = {
  personas: api.personas,
  categorias: api.categorias,
  empleados: api.empleados,
  actividades: api.actividades,
  eventos: api.eventos,
  inscripciones: api.inscripciones,
  asignaciones: api.asignaciones,
  habitaciones: api.habitaciones,
  reservaciones: api.reservaciones,
};
const keys = Object.keys(resources);
const emptyData = () => Object.fromEntries(keys.map(key => [key, []]));
const staffKeys = ['eventos', 'empleados', 'actividades', 'asignaciones'];

export function useCollections(usuario) {
  const [data, setData] = useState(emptyData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const userId = usuario?.id;
  const role = usuario?.rol;

  const clear = useCallback(() => {
    generation.current += 1;
    setData(emptyData());
    setErrors({});
    setLoading(false);
  }, []);

  const refresh = useCallback(async (requested = keys) => {
    if (!userId) return;
    const allowed = role === 'STAFF' ? staffKeys : keys;
    const selected = [...new Set(requested)].filter(key => allowed.includes(key));
    const current = generation.current;
    setLoading(true);
    const results = await Promise.allSettled(selected.map(key => resources[key].list()));
    if (generation.current !== current) return;
    setData(previous => {
      const next = { ...previous };
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) next[selected[index]] = result.value;
      });
      return next;
    });
    setErrors(previous => {
      const next = { ...previous };
      results.forEach((result, index) => {
        const key = selected[index];
        if (result.status === 'rejected') next[key] = result.reason?.message || 'No se pudo cargar la información.';
        else if (!Array.isArray(result.value)) next[key] = 'El servidor devolvió un formato inesperado.';
        else delete next[key];
      });
      return next;
    });
    setLoading(false);
  }, [userId, role]);

  useEffect(() => {
    const current = ++generation.current;
    if (userId) Promise.resolve().then(() => { if (generation.current === current) refresh(); });
    return () => { generation.current += 1; };
  }, [userId, refresh]);

  return { data, errors, loading, refresh, clear };
}
