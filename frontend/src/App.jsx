
import { useEffect, useState, useCallback } from 'react';
import { api } from './api/client';
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

  // Navegación
  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to);
    setPath(currentPath());
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Detectar cambios del historial
  useEffect(() => {
    const handle = () => setPath(currentPath());

    window.addEventListener('popstate', handle);

    return () => {
      window.removeEventListener('popstate', handle);
    };
  }, []);

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
          error instanceof Error ? error.message : String(error)
        );
      })
      .finally(() => {
        if (active) {
          setPeopleLoading(false);
        }
      });

    // Verificar conexión con el backend
    api.health()
      .then(() => {
        if (active) setOnline(true);
      })
      .catch(() => {
        if (active) setOnline(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
    notify: setToast
  };

  let page;
  let title = 'NicaAcro';

  // Pantallas públicas
  if (path === '/') {
    return <Welcome navigate={navigate} />;
  }

  if (path === '/login') {
    return <Login navigate={navigate} />;
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
