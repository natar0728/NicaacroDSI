import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Badge, Field, Modal, Notice, PageTitle, Problem, Table } from '../components/Common';
import { enumLabel, fullName, idOf } from '../lib/format';

export default function Administration({ data, errors, loading, notify, usuario }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => { setBusy(true); try { setUsers(await api.usuarios.list()); setError(''); } catch (e) { setError(e.message); } finally { setBusy(false); } }, []);
  useEffect(() => { let active = true; api.usuarios.list().then(value => { if (active) setUsers(value); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; }; }, []);
  const person = id => { const employee = data.empleados.find(e => idOf(e) === idOf(id)); return employee ? `${fullName(employee.personaId)} · ${employee.numeroEmpleado}` : 'Empleado no encontrado'; };
  return <div className="nx-page"><PageTitle title="Usuarios" description="Administre las cuentas y los roles de acceso." action={<button className="nx-primary" onClick={() => { setEditing(null); setOpen(true); }}>+ Crear usuario</button>}/><Problem errors={errors} keys={['empleados']} loading={loading || busy}/>{error && <Notice error>{error}</Notice>}<section className="nx-card"><Table headers={['Usuario', 'Empleado', 'Rol', 'Estado', 'Acción']} rows={users.map(user => ({ key: user._id, cells: [user.nombreUsuario, person(user.empleadoId), enumLabel(user.rol), <Badge>{enumLabel(user.estado)}</Badge>, <div className="nx-actions"><button onClick={() => { setEditing(user); setOpen(true); }}>Editar</button></div>] }))}/></section>{open && <UserModal user={editing} currentUser={usuario} users={users} employees={data.empleados} close={() => setOpen(false)} reload={load} notify={notify}/>}</div>;
}
function UserModal({ user, currentUser, users, employees, close, reload, notify }) {
  const [form, setForm] = useState({ empleadoId: idOf(user?.empleadoId), nombreUsuario: user?.nombreUsuario || '', password: '', rol: user?.rol || 'STAFF', estado: user?.estado || 'ACTIVO' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const change = key => e => setForm(previous => ({ ...previous, [key]: e.target.value }));
  const selectable = employees.filter(e => e.estado === 'ACTIVO' && !users.some(u => idOf(u.empleadoId) === idOf(e)));
  async function save(e) {
    e.preventDefault(); setError('');
    if (user && idOf(user) === idOf(currentUser) && (form.estado !== 'ACTIVO' || form.rol !== 'ADMINISTRADOR')) { setError('No puede desactivar ni cambiar el rol de su propia cuenta.'); return; }
    setBusy(true);
    try {
      const payload = { nombreUsuario: form.nombreUsuario.trim(), rol: form.rol, estado: form.estado, ...(form.password ? { password: form.password } : {}) };
      if (user) await api.usuarios.update(user._id, payload); else await api.usuarios.create({ ...payload, empleadoId: form.empleadoId });
      await reload(); notify(user ? 'Usuario actualizado.' : 'Usuario creado.'); close();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <Modal title={user ? 'Editar usuario' : 'Crear usuario'} onClose={close}><form className="nx-form" onSubmit={save}>{error && <Notice error>{error}</Notice>}{!user && <Field label="Empleado" required><select value={form.empleadoId} onChange={change('empleadoId')} required><option value="">Seleccione un empleado</option>{selectable.map(e => <option key={e._id} value={e._id}>{e.numeroEmpleado} · {fullName(e.personaId)}</option>)}</select></Field>}<Field label="Nombre de usuario" required><input value={form.nombreUsuario} onChange={change('nombreUsuario')} minLength="3" required/></Field><Field label={user ? 'Nueva contraseña (opcional)' : 'Contraseña'} required={!user}><input type="password" value={form.password} onChange={change('password')} minLength="8" required={!user} autoComplete="new-password"/></Field><Field label="Rol"><select value={form.rol} onChange={change('rol')}>{['ADMINISTRADOR', 'ORGANIZADOR', 'STAFF'].map(v => <option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field><Field label="Estado"><select value={form.estado} onChange={change('estado')}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></Field><div className="nx-form-actions"><button type="button" className="nx-secondary" onClick={close}>Cancelar</button><button className="nx-primary" disabled={busy}>Guardar</button></div></form></Modal>;
}
