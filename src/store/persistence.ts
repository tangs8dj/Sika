import type { PageSettings, TextStyle } from '../features/layout/sceneTypes';
import { DEFAULT_PAGE_SETTINGS, DEFAULT_TEXT_STYLE } from '../features/layout/paperPresets';
import type { Person } from '../features/names/nameTypes';
import { normalizePeopleOrder } from '../features/names/parseNames';
import { validatePageSettings, validateTextStyle } from '../utils/validation';

export const STORAGE_KEY = 'batch-place-card-project';
export const PROJECT_VERSION = 1;

export interface PersistedProjectState {
  version: number;
  people: Person[];
  textStyle: TextStyle;
  pageSettings: PageSettings;
  selectedPersonId: string | null;
  exportScope: 'all' | 'enabled';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePeople(value: unknown): Person[] | null {
  if (!Array.isArray(value)) return null;
  const people: Person[] = [];
  for (const [index, item] of value.entries()) {
    if (!isRecord(item) || typeof item.name !== 'string') continue;
    const name = item.name.trim();
    if (!name) continue;
    people.push({
      id: typeof item.id === 'string' && item.id ? item.id : `restored-${index}`,
      name,
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
      order: typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : index
    });
  }
  return normalizePeopleOrder(people);
}

function parseTextStyle(value: unknown): TextStyle {
  if (!isRecord(value)) return DEFAULT_TEXT_STYLE;
  const candidate = { ...DEFAULT_TEXT_STYLE, ...value };
  return validateTextStyle(candidate).length === 0 ? candidate : DEFAULT_TEXT_STYLE;
}

function parsePageSettings(value: unknown): PageSettings {
  if (!isRecord(value)) return DEFAULT_PAGE_SETTINGS;
  const legacyLeftMargin = value.marginLeftMm;
  const legacyRightMargin = value.marginRightMm;
  const legacyHorizontalMargin =
    typeof legacyLeftMargin === 'number' &&
    Number.isFinite(legacyLeftMargin) &&
    typeof legacyRightMargin === 'number' &&
    Number.isFinite(legacyRightMargin)
      ? (legacyLeftMargin + legacyRightMargin) / 2
      : DEFAULT_PAGE_SETTINGS.marginHorizontalMm;
  const candidate = {
    ...DEFAULT_PAGE_SETTINGS,
    ...value,
    marginHorizontalMm:
      typeof value.marginHorizontalMm === 'number' && Number.isFinite(value.marginHorizontalMm)
        ? value.marginHorizontalMm
        : legacyHorizontalMargin,
    previewZoomMode: value.previewZoomMode === 'manual' ? 'manual' : 'fit'
  };
  return validatePageSettings(candidate).length === 0 ? candidate : DEFAULT_PAGE_SETTINGS;
}

export function serializeProjectState(state: PersistedProjectState): string {
  return JSON.stringify({ ...state, version: PROJECT_VERSION });
}

export function deserializeProjectState(raw: string): PersistedProjectState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== PROJECT_VERSION) return null;
    const people = parsePeople(parsed.people);
    if (!people) return null;
    const selectedPersonId =
      typeof parsed.selectedPersonId === 'string' &&
      people.some((person) => person.id === parsed.selectedPersonId)
        ? parsed.selectedPersonId
        : (people[0]?.id ?? null);

    return {
      version: PROJECT_VERSION,
      people,
      textStyle: parseTextStyle(parsed.textStyle),
      pageSettings: parsePageSettings(parsed.pageSettings),
      selectedPersonId,
      exportScope: parsed.exportScope === 'enabled' ? 'enabled' : 'all'
    };
  } catch {
    return null;
  }
}

export function loadPersistedProject(): PersistedProjectState | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? deserializeProjectState(raw) : null;
}

export function savePersistedProject(state: PersistedProjectState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, serializeProjectState(state));
}
