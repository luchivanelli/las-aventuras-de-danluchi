export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando calendario" className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
      <div className="card overflow-hidden">
        <div className="h-32 bg-linear-to-br from-wine-900 via-wine-800 to-rose-deep opacity-80 sm:h-36" />
        <div className="skeleton aspect-[7/6] w-full rounded-none sm:aspect-[7/5]" />
      </div>
      <div className="skeleton h-64 rounded-3xl" />
    </div>
  );
}
