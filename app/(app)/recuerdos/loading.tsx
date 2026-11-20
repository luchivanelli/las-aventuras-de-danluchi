export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando recuerdos" className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-10 w-56" />
      </div>
      <div className="skeleton h-12 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/5] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
