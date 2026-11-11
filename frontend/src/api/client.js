const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'nicaacro_token';
export const obtenerToken = () => sessionStorage.getItem(TOKEN_KEY);
export const guardarToken = token => sessionStorage.setItem(TOKEN_KEY, token);
export const borrarToken = () => sessionStorage.removeItem(TOKEN_KEY);

export async function request(path, options = {}) {
  const token = obtenerToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try { response = await fetch(`${BASE}${path}`, { ...options, headers }); }
  catch { throw new Error('No hay conexión con el backend. Compruebe que esté iniciado y que MongoDB esté disponible.'); }
  let json;
  try { json = await response.json(); }
  catch { throw new Error(`Respuesta inválida del servidor (HTTP ${response.status}).`); }
  if (!response.ok || json.success === false) {
    if (response.status === 401 && token && path !== '/auth/login' && obtenerToken() === token) {
      borrarToken();
      window.dispatchEvent(new Event('nicaacro:sesion-finalizada'));
    }
    const error = new Error(json.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return json.data ?? json;
}
const resource = path => ({
  list: () => request(path),
  get: id => request(`${path}/${encodeURIComponent(id)}`),
  create: data => request(path, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${path}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: id => request(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
});
export const api = {
  health: () => request('/health'),
  auth: { login: data => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }), me: () => request('/auth/me') },
  personas: resource('/personas'),
  usuarios: resource('/usuarios'),
  categorias: resource('/categorias-empleado'),
  empleados: resource('/empleados'),
  actividades: resource('/actividades'),
  eventos: resource('/eventos'),
  inscripciones: resource('/inscripciones'),
  asignaciones: resource('/asignacionesActividad'),
  habitaciones: resource('/habitaciones'),
  reservaciones: resource('/reservaciones'),
};
