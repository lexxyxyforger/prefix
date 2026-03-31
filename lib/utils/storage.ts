export const HISTORY_LIMIT = 20;

export function saveHistory<T>(key: string, entry: T): void {
  try {
    const raw = localStorage.getItem(key);
    const history: T[] = raw ? JSON.parse(raw) : [];
    history.unshift(entry);
    if (history.length > HISTORY_LIMIT) history.splice(HISTORY_LIMIT);
    localStorage.setItem(key, JSON.stringify(history));
  } catch {}
}

export function loadHistory<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function clearHistory(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function getTheme(): "dark" | "light" {
  try {
    const t = localStorage.getItem("perfkit-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function setTheme(theme: "dark" | "light"): void {
  try {
    localStorage.setItem("perfkit-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch {}
}
