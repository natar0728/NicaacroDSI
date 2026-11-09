
import { useEffect, useState, useCallback } from 'react';
import {
  api,
  obtenerToken,
  borrarToken
} from './api/client';
import { examplePeople } from './data/demo';

import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import Participants from './pages/Participants';
import PersonDetail from './pages/PersonDetail';
import PersonForm from './pages/PersonForm';
import Enrollment from './pages/Enrollment';
import Administration from './pages/Administration';
import Pending from './pages/Pending';

// Obtener la ruta actual
function currentPath() {
  return (
    decodeURIComponent(window.location.pathname)
      .replace(/\/+$/, '') || '/'
  );
}

// Consultar participantes desde el backend
async function fetchPeople() {
  const result = await api.personas.list();
  return Array.isArray(result) ? result : [];
}

export default function App() {
  const [path, setPath] = useState(currentPath);
  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState('');
  const [online, setOnline] = useState(null);
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [verificandoSesion, setVerificandoSesion] = useState(
  () => Boolean(obtenerToken())
);

  // Navegación
  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to);
    setPath(currentPath());
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  const cerrarSesion = useCallback(() => {
  borrarToken();

  setUsuario(null);
  setPeople([]);
  setPeopleError('');
  setPreview(false);

  navigate('/login');
}, [navigate]);

  // Detectar cambios del historial
  useEffect(() => {
    const handle = () => setPath(currentPath());

    window.addEventListener('popstate', handle);

    return () => {
      window.removeEventListener('popstate', handle);
    };
  }, []);

  // Escuchar cuando el cliente detecta una sesión inválida.
useEffect(() => {
  window.addEventListener(
    'nicaacro:sesion-finalizada',
    cerrarSesion
  );

  return () => {
    window.removeEventListener(
      'nicaacro:sesion-finalizada',
      cerrarSesion
    );
  };
}, [cerrarSesion]);

// Comprobar la sesión si ya existe un token al recargar.
useEffect(() => {
  if (!obtenerToken()) return;

  let active = true;

  api.auth.me()
    .then((usuarioActual) => {
      if (active) {
        setUsuario(usuarioActual);
      }
    })
    .catch(() => {
      if (active) {
        borrarToken();
        setUsuario(null);
      }
    })
    .finally(() => {
      if (active) {
        setVerificandoSesion(false);
      }
    });

  return () => {
    active = false;
  };
}, []);

// Evitar el acceso directo a las pantallas privadas sin sesión.
useEffect(() => {
  let active = true;

  // Consultar participantes únicamente cuando exista una sesión.
  if (usuario) {
    fetchPeople()
      .then((result) => {
        if (!active) return;

        setPeople(result);
        setPeopleError('');
      })
      .catch((error) => {
        if (!active) return;

        setPeople([]);

        setPeopleError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      })
      .finally(() => {
        if (active) {
          setPeopleLoading(false);
        }
      });
  }

  // La ruta health continúa siendo pública.
  api.health()
    .then(() => {
      if (active) {
        setOnline(true);
      }
    })
    .catch(() => {
      if (active) {
        setOnline(false);
      }
    });

  return () => {
    active = false;
  };
}, [usuario]);

  // Actualización manual de participantes
  const refresh = useCallback(async () => {
    setPeopleLoading(true);

    try {
      const result = await fetchPeople();

      setPeople(result);
      setPeopleError('');
    } catch (error) {
      setPeople([]);
      setPeopleError(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setPeopleLoading(false);
    }
  }, []);

  // Carga inicial sin actualizar estado
  // sincrónicamente dentro del efecto
 useEffect(() => {
  let active = true;

  // Consultar participantes únicamente cuando exista una sesión.
  if (usuario) {
    fetchPeople()
      .then((result) => {
        if (!active) return;

        setPeople(result);
        setPeopleError('');
      })
      .catch((error) => {
        if (!active) return;

        setPeople([]);

        setPeopleError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      })
      .finally(() => {
        if (active) {
          setPeopleLoading(false);
        }
      });
  }

  // La ruta health continúa siendo pública.
  api.health()
    .then(() => {
      if (active) {
        setOnline(true);
      }
    })
    .catch(() => {
      if (active) {
        setOnline(false);
      }
    });

  return () => {
    active = false;
  };
}, [usuario]);
  // Modo de demostración
  const demo = preview || Boolean(peopleError);
  const visiblePeople = demo ? examplePeople : people;

  // Propiedades compartidas
  const context = {
    navigate,
    people: visiblePeople,
    peopleLoading,
    peopleError,
    online,
    demo,
    preview,
    setPreview,
    refresh,
    cerrarSesion,
    notify: setToast
  };

  let page;
  let title = 'NicaAcro';
  if (verificandoSesion) {
  return <p>Comprobando sesión...</p>;
}

  // Pantallas públicas
  if (path === '/') {
    return <Welcome navigate={navigate} />;
  }

if (path === '/login' || !usuario) {
  return (
    <Login
      onLogin={(usuarioActual) => {
        setPeopleLoading(true);
        setPeopleError('');
        setUsuario(usuarioActual);

        navigate('/menu');
      }}
    />
  );
}
  // Menú principal
  if (path === '/menu') {
    page = <AdminHome navigate={navigate} />;
    title = 'Menú administrador';
  }

  // Dashboard
  else if (path === '/dashboard') {
    page = <Dashboard {...context} />;
    title = 'Dashboard';
  }

  // Participantes
  else if (path === '/participantes') {
    page = <Participants {...context} />;
    title = 'Participantes';
  }

  // Registrar participante
  else if (path === '/participantes/nuevo') {
    page = <PersonForm {...context} mode="create" />;
    title = 'Registrar persona';
  }

  // Editar participante
  else if (/^\/participantes\/[^/]+\/editar$/.test(path)) {
    page = (
      <PersonForm
        {...context}
        mode="edit"
        id={path.split('/')[2]}
      />
    );
    title = 'Editar persona';
  }

  // Detalle participante
  else if (/^\/participantes\/[^/]+$/.test(path)) {
    page = (
      <PersonDetail
        {...context}
        id={path.split('/')[2]}
      />
    );
    title = 'Detalle participante';
  }

  // Inscripciones
  else if (path === '/inscripciones') {
    page = <Enrollment {...context} />;
    title = 'Inscripciones';
  }

  // Detalle de evento
  else if (/^\/eventos\/[^/]+$/.test(path)) {
    page = (
      <EventDetail
        {...context}
        id={path.split('/')[2]}
      />
    );
    title = 'Detalle del evento';
  }

  // Administración
  else if (path === '/administracion') {
    page = <Administration {...context} />;
    title = 'Administración';
  }

  // Eventos
  else if (path === '/eventos') {
    page = (
      <Pending
        title="Eventos y actividades"
        detail="El backend no incluye un recurso de eventos. El detalle de evento es una vista de ejemplo, accesible desde Dashboard."
        navigate={navigate}
      />
    );
    title = 'Eventos y actividades';
  }

  // Otros módulos pendientes
  else {
    const names = {
      '/asistencia': 'Check in / Check out',
      '/cronograma': 'Visualizar cronograma',
      '/staff': 'Staff',
      '/alojamiento': 'Alojamiento',
      '/reservaciones': 'Reservaciones',
      '/reportes': 'Reportes'
    };

    title = names[path] || 'Página no encontrada';

    page = (
      <Pending
        title={title}
        navigate={navigate}
      />
    );
  }

  // Renderizar aplicación
  return (
    <Layout
      {...context}
      title={title}
      active={path}
    >
      {toast && (
        <div role="status" className="toast">
          {toast}
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setToast('')}
          >
            ×
          </button>
        </div>
      )}

      {page}
    </Layout>
  );
}
