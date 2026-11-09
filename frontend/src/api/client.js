const BASE = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'nicaacro_token';

// Obtener el token de la sesión actual del navegador.
export function obtenerToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

// Guardar el token después del inicio de sesión.
export function guardarToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

// Eliminar el token al cerrar la sesión.
export function borrarToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const token = obtenerToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Agregar el token a las peticiones cuando exista.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      'No hay conexión con el backend. Inicie Node.js y compruebe MongoDB.'
    );
  }

  let json;

  try {
    json = await response.json();
  } catch {
    throw new Error(
      `Respuesta inválida del servidor (HTTP ${response.status}).`
    );
  }

  if (!response.ok || json.success === false) {
    // Si una petición protegida devuelve 401, finalizar la sesión.
    // No se aplica al login, porque allí un 401 significa que las
    // credenciales ingresadas son incorrectas.
    if (
      response.status === 401 &&
      token &&
      path !== '/auth/login' &&
      obtenerToken() === token
    ) {
      borrarToken();

      window.dispatchEvent(
        new Event('nicaacro:sesion-finalizada')
      );
    }

    const error = new Error(
      json.message || `Error HTTP ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return json.data ?? json;
}

export const api = {
  health: () => request('/health'),

  auth: {
    login: (data) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    me: () => request('/auth/me')
  },

  personas: {
    list: () => request('/personas'),

    get: (id) => request(
      `/personas/${encodeURIComponent(id)}`
    ),

    create: (data) => request('/personas', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    update: (id, data) => request(
      `/personas/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    ),

    remove: (id) => request(
      `/personas/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    )
  },

  catalogo: (resource) => request(`/${resource}`)
};