# 💕 Aventuras de a dos — v2

Rediseño completo de "Nuestra lista de aventuras": planes en pareja, recuerdos con fotos y calendario.

**Stack:** Next.js 16 (App Router + Server Actions) · Tailwind CSS 4 · GSAP · Prisma 6 · Neon (PostgreSQL) · Cloudinary

---

## Puesta en marcha

```bash
# 1. Variables de entorno
cp .env.example .env.local      # y completá los valores

# 2. Dependencias (genera el cliente de Prisma automáticamente)
npm install

# 3. Actualizar la base de datos (solo agrega columnas opcionales e índices; no borra nada)
npm run db:push

# 4. (Una sola vez) Pasar las fotos viejas de la v1 a Cloudinary
npm run photos:migrate -- --dry-run   # para ver qué va a hacer
npm run photos:migrate

# 5. Desarrollo
npm run dev
```

Abrí http://localhost:3000 e ingresá la fecha especial.

### Variables de entorno

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Connection string de Neon (la misma de la v1 sirve) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Cuenta de Cloudinary (Dashboard → API Keys) |
| `CLOUDINARY_FOLDER` | Carpeta donde se guardan las fotos (por defecto `aventuras`) |
| `SECRET_DATE` | Fecha que desbloquea la app, `yyyy-MM-dd`. También se usa para los "días juntos" |
| `AUTH_SECRET` | Secreto para firmar la cookie de sesión. **Obligatorio en producción** |
| `APP_TIMEZONE` | Zona horaria para "hoy", "vencido", "esta semana" (por defecto Buenos Aires) |

### Deploy (Vercel)

Cargá las mismas variables en el proyecto. El `postinstall` ya corre `prisma generate`.

---

## Qué cambió respecto de la v1

### Navegación
- **Rutas reales** (`/`, `/planes`, `/recuerdos`, `/recuerdos/[id]`, `/calendario`) en lugar de pestañas dentro de una sola página: el botón "atrás" funciona y se pueden compartir links.
- **Filtros y mes en la URL** (`/planes?cat=viajes&q=cena`, `/calendario?m=2026-12`).
- **Mobile:** barra inferior con botón **+** central para crear un plan desde cualquier pantalla. **Desktop:** sidebar con contador de pendientes y "días juntos".
- **Atajos:** `N` nuevo plan · `G` luego `I/P/R/C` para ir a Inicio/Planes/Recuerdos/Calendario.
- "Nuestra historia" se fusionó con **Inicio**: un solo lugar con lo importante.

### Experiencia de uso
- **Inicio:** días juntos animados, próxima aventura con cuenta regresiva, progreso, aviso de planes vencidos, "un día como hoy", últimos recuerdos y categorías.
- **Planes agrupados** por "Con fecha pasada", "Esta semana", "Más adelante" y "Algún día".
- **Formulario más rápido:** atajos de fecha (Hoy / Mañana / Este finde), validación en el servidor con mensajes por campo.
- **Confirmación antes de borrar** (antes se borraba al toque) y **borrado optimista**.
- **Completar = celebrar:** animación de corazones y formulario de recuerdo con fecha editable.
- **Volver a pendiente** un plan completado (conserva el recuerdo).
- **Recuerdos** como álbum por mes con portada; **página de detalle** con galería, visor a pantalla completa (teclado, flechas, deslizar) y navegación entre recuerdos.
- **Calendario** con etiquetas en desktop, puntos en mobile, panel del día y "planear algo para este día" (o doble clic).
- Notificaciones (toasts), estados de carga (skeletons), pantalla de error con reintento, 404.
- Accesibilidad: foco visible, diálogos con trampa de foco y `Esc`, `aria-*`, respeta "reducir movimiento".

### Fotos (Cloudinary)
- Las fotos se **suben directo del navegador a Cloudinary** con firma generada por una Server Action: no pasan por el servidor ni se guardan en base64 en la base (la v1 las guardaba como data URL dentro de Postgres).
- Compresión previa en el navegador, barra de progreso y arrastrar-y-soltar.
- Se sirven con formato/calidad automáticos y en el tamaño justo para cada pantalla.
- Al quitar una foto o borrar un plan, también se borra de Cloudinary.

### Seguridad
- La fecha secreta ya **no está en el código del cliente**: se valida en el servidor.
- Sesión con **cookie httpOnly firmada (HMAC)**, chequeo en `proxy.ts` y **verificación en cada página y cada Server Action**.
- Solo se aceptan fotos que realmente estén en tu cuenta/carpeta de Cloudinary.

### Fechas
- Las fechas de planes se manejan como `yyyy-MM-dd` y "hoy" se calcula en la zona horaria configurada, evitando el corrimiento de un día entre servidor y navegador.

---

## Estructura

```
app/
  (app)/                 ← secciones con sesión (layout con navegación)
    page.tsx             ← Inicio
    planes/  recuerdos/  recuerdos/[id]/  calendario/
  login/
  actions/               ← Server Actions: auth, plans, memories, uploads
components/
  shell/                 ← Sidebar, barra inferior, atajos
  plans/                 ← PlannerProvider (crear/editar/completar desde cualquier lado), formulario, tarjetas
  memories/              ← formulario de recuerdo, fotos, galería + visor
  calendar/  home/  auth/
  motion/                ← animaciones GSAP (Reveal, CountUp, ProgressRing, corazones)
  ui/                    ← Sheet, Button, Menu, Confirm, imagen Cloudinary
lib/
  data.ts                ← consultas (server-only)
  prisma.ts  cloudinary.ts  auth.ts  session.ts  validation.ts  dates.ts
prisma/schema.prisma     ← compatible con la base de la v1
proxy.ts                 ← redirección a /login (Next 16: ex-middleware)
scripts/migrate-photos.ts
```
