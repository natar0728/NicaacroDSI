export function idOf(value) {
  if (value == null) return '';
  if (typeof value === 'object') return String(value._id ?? value.id ?? '');
  return String(value);
}
export const fullName = p => p && typeof p === 'object'
  ? [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(' ') || 'Sin nombre'
  : 'Sin nombre';
export const personCode = p => p && typeof p === 'object'
  ? p.numeroIdentificacion || p.identificadorAlternativo || idOf(p).slice(-8).toUpperCase() || '—'
  : '—';
export const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
export const enumLabel = value => String(value || '—').replaceAll('_', ' ').toLocaleLowerCase('es').replace(/^./, c => c.toLocaleUpperCase('es'));
export const dateValue = value => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};
export const localDate = (date = new Date()) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export function formatDate(value) {
  const date = dateValue(value);
  if (!date) return '—';
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-NI', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}
export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-NI', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
export const overlap = (start1, end1, start2, end2) => start1 < end2 && start2 < end1;
export function roomReservations(reservations, roomId, start, end, exceptId = '') {
  return reservations.filter(r => idOf(r.habitacionId) === idOf(roomId) && idOf(r) !== idOf(exceptId) &&
    ['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && overlap(dateValue(r.fechaEntrada), dateValue(r.fechaSalida), start, end));
}
export function peakRoomOccupancy(reservations, roomId, start, end, exceptId = '') {
  if (!start || !end || end <= start) return 0;
  const edges = [];
  for (const reservation of roomReservations(reservations, roomId, start, end, exceptId)) {
    edges.push([Math.max(Date.parse(dateValue(reservation.fechaEntrada)), Date.parse(start)), 1]);
    edges.push([Math.min(Date.parse(dateValue(reservation.fechaSalida)), Date.parse(end)), -1]);
  }
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let current = 0, max = 0;
  for (const [, delta] of edges) { current += delta; max = Math.max(max, current); }
  return max;
}
