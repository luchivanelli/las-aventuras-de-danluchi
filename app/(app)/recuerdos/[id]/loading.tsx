export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando recuerdo" className="mx-auto max-w-3xl space-y-6">
      <div className="skeleton h-6 w-28" />
      <div className="space-y-3">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-12 w-3/4" />
      </div>
      <div className="skeleton aspect-[16/9] w-full rounded-4xl" />
      <div className="skeleton h-40 w-full rounded-3xl" />
    </div>
  );
}
