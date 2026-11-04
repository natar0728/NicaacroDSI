const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function request(path, options={}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    });
  } catch {
    throw new Error('No hay conexión con el backend. Inicia Node.js y comprueba MongoDB.');
  }
  let json;
  try { json=await response.json(); } catch { throw new Error(`Respuesta inválida del servidor (HTTP ${response.status}).`); }
  if(!response.ok || json.success===false) throw new Error(json.message || `Error HTTP ${response.status}`);
  return json.data??json;
}
export const api={
  health:()=>request('/health'),
  personas:{list:()=>request('/personas'),get:id=>request(`/personas/${encodeURIComponent(id)}`),create:data=>request('/personas',{method:'POST',body:JSON.stringify(data)}),update:(id,data)=>request(`/personas/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(data)}),remove:id=>request(`/personas/${encodeURIComponent(id)}`,{method:'DELETE'})},
  catalogo:resource=>request(`/${resource}`)
};
