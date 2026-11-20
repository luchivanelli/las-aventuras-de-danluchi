// Utilidades de fechas "de calendario" (yyyy-MM-dd, sin hora).
// Trabajar con strings evita los corrimientos de un día por zona horaria
// entre el servidor (UTC) y el navegador.

import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

export const DEFAULT_TZ = "America/Argentina/Buenos_Aires";

/** Fecha de hoy (yyyy-MM-dd) en la zona horaria indicada. */
export function todayIn(timeZone: string = DEFAULT_TZ): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TZ }).format(new Date());
  }
}

export function toDay(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fmtDay(day: string, pattern = "d 'de' MMMM"): string {
  return format(parseISO(day), pattern, { locale: es });
}

export function fmtMonth(month: string): string {
  // month: yyyy-MM
  return format(parseISO(`${month}-01`), "MMMM yyyy", { locale: es });
}

export function diffDays(from: string, to: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

export function shiftDay(day: string, amount: number): string {
  return toDay(addDays(parseISO(day), amount));
}

/** "Hoy", "Mañana", "En 5 días", "Ayer", "Hace 3 días" o la fecha. */
export function relativeDay(day: string, today: string): string {
  const d = diffDays(today, day);
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  if (d === -1) return "Ayer";
  if (d > 1 && d < 7) return `En ${d} días`;
  if (d < -1 && d > -7) return `Hace ${-d} días`;
  const sameYear = day.slice(0, 4) === today.slice(0, 4);
  return fmtDay(day, sameYear ? "EEE d MMM" : "d MMM yyyy");
}

export function weekRange(today: string): { start: string; end: string } {
  const d = parseISO(today);
  return {
    start: toDay(startOfWeek(d, { weekStartsOn: 1 })),
    end: toDay(endOfWeek(d, { weekStartsOn: 1 })),
  };
}

export function monthRange(month: string): { start: string; end: string } {
  const d = parseISO(`${month}-01`);
  return { start: toDay(startOfMonth(d)), end: toDay(endOfMonth(d)) };
}

export function isValidMonth(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

export function isValidDay(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(parseISO(v).getTime());
}

/** Fecha de calendario → Date a las 12:00 UTC (el mismo día en cualquier zona horaria). */
export function dayToTimestamp(day: string): Date {
  return new Date(`${day}T12:00:00.000Z`);
}

/** Inversa de dayToTimestamp. También sirve para registros viejos guardados a medianoche UTC. */
export function timestampToDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
