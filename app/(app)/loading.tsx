export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-10 w-64" />
      </div>
      <div className="skeleton h-12 w-full" />
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
