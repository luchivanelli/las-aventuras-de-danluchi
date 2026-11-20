import { requireSession } from "@/lib/auth";
import { getToday } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { diffDays } from "@/lib/dates";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import { PlannerProvider } from "@/components/plans/PlannerProvider";
import { BottomNav, MobileTopBar, Sidebar } from "@/components/shell/Navigation";
import { Shortcuts } from "@/components/shell/Shortcuts";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const [today, pendingCount] = await Promise.all([getToday(), prisma.plan.count({ where: { status: "pendiente" } })]);
  const daysTogether = Math.max(diffDays(env.secretDate, today), 0);

  return (
    <ConfirmProvider>
      <PlannerProvider today={today}>
        <Shortcuts />
        <Sidebar pendingCount={pendingCount} daysTogether={daysTogether} />
        <div className="md:pl-64">
          <MobileTopBar />
          <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 md:pb-16 md:pt-10 lg:px-10">{children}</main>
        </div>
        <BottomNav />
      </PlannerProvider>
    </ConfirmProvider>
  );
}
