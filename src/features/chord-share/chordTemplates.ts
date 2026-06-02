export type ChordTemplate = {
  id: string;
  name: string;
  chords: string;
  builtin?: boolean;
};

const STORAGE_KEY = "chord-share:user-templates";
const HIDDEN_BUILTINS_KEY = "chord-share:hidden-builtin-templates";
const ORDER_KEY = "chord-share:template-order";

export function loadTemplateOrder(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function saveTemplateOrder(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
  } catch {
    // noop
  }
}

export function applyTemplateOrder(templates: ChordTemplate[], order: string[]): ChordTemplate[] {
  if (order.length === 0) return templates;
  const byId = new Map(templates.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const ordered: ChordTemplate[] = [];
  for (const id of order) {
    const t = byId.get(id);
    if (t && !seen.has(id)) {
      ordered.push(t);
      seen.add(id);
    }
  }
  for (const t of templates) {
    if (!seen.has(t.id)) ordered.push(t);
  }
  return ordered;
}

export function loadHiddenBuiltinIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_BUILTINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function saveHiddenBuiltinIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIDDEN_BUILTINS_KEY, JSON.stringify(ids));
  } catch {
    // noop
  }
}

export function loadUserTemplates(): ChordTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t): t is ChordTemplate =>
          t &&
          typeof t.id === "string" &&
          typeof t.name === "string" &&
          typeof t.chords === "string",
      )
      .map((t) => ({ ...t, builtin: false }));
  } catch {
    return [];
  }
}

export function saveUserTemplates(templates: ChordTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // noop
  }
}

export function createUserTemplate(name: string, chords: string): ChordTemplate {
  return {
    id: `user:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    chords,
    builtin: false,
  };
}
