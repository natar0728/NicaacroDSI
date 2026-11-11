import { useEffect } from 'react';

export function PageTitle({ title, description, action }) {
  return <div className="nx-page-title"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}
export function Field({ label, required, hint, children }) {
  return <label className="nx-field"><span>{label}{required && <b aria-hidden="true"> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>;
}
export function Notice({ children, error = false }) {
  return <div role={error ? 'alert' : 'status'} className={`nx-notice${error ? ' nx-notice-error' : ''}`}>{children}</div>;
}
export function Problem({ errors = {}, keys = [], loading = false }) {
  const issues = keys.filter(key => errors[key]);
  return <>{loading && <p className="nx-muted" role="status">Cargando información…</p>}{issues.map(key => <Notice key={key} error>No se pudo cargar {key}: {errors[key]}</Notice>)}</>;
}
export function Badge({ children }) { return <span className="nx-badge">{children}</span>; }
export function Stats({ items }) {
  return <div className="nx-stats">{items.map((item, index) => <article className="nx-stat" key={`${item.label}-${index}`}><span>{item.label}</span><strong>{item.value}</strong>{item.helper && <small>{item.helper}</small>}</article>)}</div>;
}
export function Table({ headers, rows }) {
  return <div className="nx-table-wrap"><table className="nx-table"><thead><tr>{headers.map((header, i) => <th key={`${header}-${i}`} scope="col">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={row.key || index}>{row.cells.map((cell, i) => <td key={i}>{cell ?? '—'}</td>)}</tr>) : <tr><td colSpan={headers.length} className="nx-empty">No hay registros para mostrar.</td></tr>}</tbody></table></div>;
}
export function Modal({ title, children, onClose }) {
  useEffect(() => { const close = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
  return <div className="nx-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><section className="nx-modal" role="dialog" aria-modal="true" aria-label={title}><div className="nx-modal-header"><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar">×</button></div>{children}</section></div>;
}
export function EventSelector({ events, value, onChange, onSubmit }) {
  return <div className="nx-toolbar"><Field label="Evento"><select value={value} onChange={e => onChange(e.target.value)}><option value="">Seleccione un evento</option>{events.map(event => <option key={event._id} value={event._id}>{event.codigo} · {event.nombre}</option>)}</select></Field><button type="button" className="nx-primary" onClick={onSubmit} disabled={!value}>Consultar evento</button></div>;
}
