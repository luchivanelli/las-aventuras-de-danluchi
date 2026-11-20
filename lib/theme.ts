// Tema claro / oscuro. La preferencia se guarda en localStorage; sin nada guardado, el tema
// es el oscuro (DEFAULT_PREF). "system" sigue al sistema operativo.
// Se aplica como data-theme="light|dark" en <html>.

export type ThemePref = "light" | "dark" | "system";

export const DEFAULT_PREF: ThemePref = "dark";

const KEY = "theme";
const BG = { light: "#fbf7f3", dark: "#161013" } as const;

/**
 * Corre en el <head> antes de pintar, así no hay "flash" claro al cargar en modo oscuro.
 * Tiene que coincidir con `resolve()` de abajo.
 */
export const themeScript = `(function(){try{var p=localStorage.getItem("${KEY}");if(p!=="light"&&p!=="dark"&&p!=="system")p="${DEFAULT_PREF}";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

export const themeColors = BG;

// Respaldo en memoria por si localStorage no está disponible (modo privado, etc.).
let memoryPref: ThemePref | null = null;
const listeners = new Set<() => void>();

export function getPref(): ThemePref {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {}
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return memoryPref ?? DEFAULT_PREF;
}

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(pref: ThemePref = getPref()) {
  const theme = resolve(pref);
  const root = document.documentElement;
  if (root.getAttribute("data-theme") !== theme) {
    root.setAttribute("data-theme-switching", "");
    root.setAttribute("data-theme", theme);
    requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute("data-theme-switching")));
  }
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", BG[theme]));
}

export function setPref(pref: ThemePref) {
  memoryPref = pref;
  try {
    localStorage.setItem(KEY, pref);
  } catch {}
  applyTheme(pref);
  listeners.forEach((l) => l());
}

/** Para useSyncExternalStore: avisa cuando cambia la preferencia (en esta pestaña o en otra). */
export function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY && e.key !== null) return;
    memoryPref = null;
    applyTheme();
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
