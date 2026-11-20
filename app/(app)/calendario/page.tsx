import type { Metadata } from "next";
import { getMonthPlans, getToday } from "@/lib/data";
import { isValidMonth } from "@/lib/dates";
import { env } from "@/lib/env";
import { Reveal } from "@/components/motion/Reveal";
import { CalendarMonth } from "@/components/calendar/CalendarMonth";

export const metadata: Metadata = { title: "Calendario" };

export default async function CalendarioPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const today = await getToday();
  const month = isValidMonth(m) ? m : today.slice(0, 7);
  const plans = await getMonthPlans(month);

  return (
    <Reveal stagger={0.08}>
      {/* `since` marca los mesiversarios con un corazón. */}
      <CalendarMonth month={month} plans={plans} since={env.secretDate} />
    </Reveal>
  );
}
