export const SECTION_IDS = ['about', 'skills', 'projects', 'blog', 'papers'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const STORAGE_KEY = 'section-visibility';

export function getVisibilityMap(): Record<SectionId, boolean> {
  if (typeof localStorage === 'undefined') {
    return Object.fromEntries(SECTION_IDS.map((id) => [id, true])) as Record<SectionId, boolean>;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const map: Record<string, boolean> = {};
      for (const id of SECTION_IDS) {
        map[id] = parsed[id] ?? true;
      }
      return map as Record<SectionId, boolean>;
    }
  } catch {
    // corrupted data, reset
  }
  return Object.fromEntries(SECTION_IDS.map((id) => [id, true])) as Record<SectionId, boolean>;
}

export function isVisible(id: SectionId): boolean {
  return getVisibilityMap()[id];
}

export function setVisibility(id: SectionId, visible: boolean): void {
  const map = getVisibilityMap();
  map[id] = visible;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(
    new CustomEvent('visibility-changed', { detail: { id, visible } })
  );
}

export function toggleSection(id: SectionId): boolean {
  const next = !getVisibilityMap()[id];
  setVisibility(id, next);
  return next;
}

export function showAll(): void {
  const map = getVisibilityMap();
  for (const id of SECTION_IDS) {
    map[id] = true;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent('visibility-changed', { detail: { all: true } }));
}

export function hideAll(): void {
  const map = getVisibilityMap();
  for (const id of SECTION_IDS) {
    map[id] = false;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent('visibility-changed', { detail: { all: true } }));
}
