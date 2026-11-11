import { describe, expect, it } from 'vitest';
import { dateValue, idOf, overlap, peakRoomOccupancy } from '../lib/format';

describe('formato y disponibilidad', () => {
  it('acepta referencias con ID o pobladas y mantiene fechas sin cambiar de zona', () => {
    expect(idOf({ _id:'123' })).toBe('123');
    expect(idOf('123')).toBe('123');
    expect(dateValue('2026-11-12T00:00:00.000Z')).toBe('2026-11-12');
    expect(overlap('08:00','10:00','10:00','11:00')).toBe(false);
  });
  it('calcula la máxima ocupación simultánea, no la suma de reservas de días diferentes', () => {
    const reservations = [
      { _id:'1', habitacionId:'A', estado:'CONFIRMADA', fechaEntrada:'2026-11-12', fechaSalida:'2026-11-13' },
      { _id:'2', habitacionId:'A', estado:'PENDIENTE', fechaEntrada:'2026-11-13', fechaSalida:'2026-11-14' },
      { _id:'3', habitacionId:'A', estado:'CANCELADA', fechaEntrada:'2026-11-12', fechaSalida:'2026-11-14' },
    ];
    expect(peakRoomOccupancy(reservations,'A','2026-11-12','2026-11-14')).toBe(1);
    reservations.push({ _id:'4', habitacionId:'A', estado:'CONFIRMADA', fechaEntrada:'2026-11-12', fechaSalida:'2026-11-14' });
    expect(peakRoomOccupancy(reservations,'A','2026-11-12','2026-11-14')).toBe(2);
    expect(peakRoomOccupancy(reservations,'A','2026-11-12','2026-11-14','4')).toBe(1);
  });
});
