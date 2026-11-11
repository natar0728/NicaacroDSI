import { useState } from 'react';

import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff
} from 'lucide-react';

import {
  api,
  guardarToken
} from '../api/client';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(e) {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      const resultado = await api.auth.login({
        nombreUsuario: user.trim(),
        password
      });

      guardarToken(resultado.token);
      onLogin(resultado.usuario);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <img
        className="login-logo"
        src="/images/logo.png"
        alt="NicaAcro Festival Play"
      />

      <section className="login-card">
        <h2>
          NICACRO
          <br />
          PLAY
        </h2>

        <p>Ingresa al sistema</p>

        <form onSubmit={iniciarSesion}>
          <label htmlFor="usuario">
            Usuario
          </label>

          <div className="login-input">
            <UserRound size={15} />

            <input
              id="usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <label htmlFor="password">
            Contraseña
          </label>

          <div className="login-input">
            <LockKeyhole size={15} />

            <input
              id="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />

            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={
                visible
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              {visible
                ? <EyeOff size={15} />
                : <Eye size={15} />
              }
            </button>
          </div>

          {error && (
            <div className="login-warning" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={cargando}
          >
            {cargando
              ? 'INGRESANDO...'
              : 'EXPLORAR EL PANEL'
            }
          </button>
        </form>
      </section>

      <img
        className="login-waves"
        src="/images/waves.svg"
        alt=""
        aria-hidden="true"
      />
    </main>
  );
}