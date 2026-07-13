import { create } from 'zustand';
import type { ExportProgress } from '../features/export/exportTypes';
import {
  applyOrientation,
  applyPaperPreset,
  DEFAULT_PAGE_SETTINGS,
  DEFAULT_TEXT_STYLE,
  FALLBACK_FONTS
} from '../features/layout/paperPresets';
import type {
  ExportScope,
  Orientation,
  PageSettings,
  PaperPreset,
  TextStyle
} from '../features/layout/sceneTypes';
import type { Person } from '../features/names/nameTypes';
import {
  namesToPeople,
  normalizePeopleOrder,
  parseNameText,
  removeDuplicatePeople
} from '../features/names/parseNames';
import {
  loadPersistedProject,
  PROJECT_VERSION,
  savePersistedProject,
  type PersistedProjectState
} from './persistence';

export type BusyTask = 'print' | 'docx' | 'pptx' | null;
export type ToastKind = 'success' | 'error' | 'info';

export interface ToastState {
  kind: ToastKind;
  message: string;
}

interface ProjectStoreState {
  people: Person[];
  inputText: string;
  textStyle: TextStyle;
  pageSettings: PageSettings;
  selectedPersonId: string | null;
  exportScope: ExportScope;
  systemFonts: string[];
  busyTask: BusyTask;
  progress: ExportProgress | null;
  toast: ToastState | null;
  setInputText: (value: string) => void;
  applyInput: () => number;
  updatePersonName: (id: string, name: string) => void;
  removePerson: (id: string) => void;
  togglePerson: (id: string) => void;
  setAllEnabled: (enabled: boolean) => void;
  movePerson: (id: string, direction: -1 | 1) => void;
  selectPerson: (id: string) => void;
  removeDuplicates: () => number;
  clearPeople: () => void;
  newProject: () => void;
  restoreDefaultSettings: () => void;
  updateTextStyle: (patch: Partial<TextStyle>) => void;
  updatePageSettings: (patch: Partial<PageSettings>) => void;
  setPaperPreset: (preset: PaperPreset) => void;
  setOrientation: (orientation: Orientation) => void;
  setExportScope: (scope: ExportScope) => void;
  setSystemFonts: (fonts: string[]) => void;
  setBusyTask: (task: BusyTask) => void;
  setProgress: (progress: ExportProgress | null) => void;
  showToast: (toast: ToastState | null) => void;
}

const starterPeople = namesToPeople(['张伟', '李娜', 'Alexander Chen']);
const restored = loadPersistedProject();
const initialPeople = restored?.people ?? starterPeople;

export const useProjectStore = create<ProjectStoreState>()((set, get) => ({
  people: initialPeople,
  inputText: initialPeople.map((person) => person.name).join('\n'),
  textStyle: restored?.textStyle ?? DEFAULT_TEXT_STYLE,
  pageSettings: restored?.pageSettings ?? DEFAULT_PAGE_SETTINGS,
  selectedPersonId: restored?.selectedPersonId ?? initialPeople[0]?.id ?? null,
  exportScope: restored?.exportScope ?? 'all',
  systemFonts: [...FALLBACK_FONTS],
  busyTask: null,
  progress: null,
  toast: null,
  setInputText: (inputText) => set({ inputText }),
  applyInput: () => {
    const names = parseNameText(get().inputText);
    const people = namesToPeople(names);
    set({ people, selectedPersonId: people[0]?.id ?? null });
    return people.length;
  },
  updatePersonName: (id, name) =>
    set((state) => ({
      people: state.people.map((person) => (person.id === id ? { ...person, name } : person)),
      inputText: state.people.map((person) => (person.id === id ? name : person.name)).join('\n')
    })),
  removePerson: (id) =>
    set((state) => {
      const people = normalizePeopleOrder(state.people.filter((person) => person.id !== id));
      return {
        people,
        inputText: people.map((person) => person.name).join('\n'),
        selectedPersonId:
          state.selectedPersonId === id ? (people[0]?.id ?? null) : state.selectedPersonId
      };
    }),
  togglePerson: (id) =>
    set((state) => ({
      people: state.people.map((person) =>
        person.id === id ? { ...person, enabled: !person.enabled } : person
      )
    })),
  setAllEnabled: (enabled) =>
    set((state) => ({ people: state.people.map((person) => ({ ...person, enabled })) })),
  movePerson: (id, direction) =>
    set((state) => {
      const people = normalizePeopleOrder(state.people);
      const index = people.findIndex((person) => person.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= people.length) return state;
      const reordered = [...people];
      const current = reordered[index];
      const other = reordered[target];
      if (!current || !other) return state;
      reordered[index] = other;
      reordered[target] = current;
      const normalized = reordered.map((person, order) => ({ ...person, order }));
      return { people: normalized, inputText: normalized.map((person) => person.name).join('\n') };
    }),
  selectPerson: (selectedPersonId) => set({ selectedPersonId }),
  removeDuplicates: () => {
    const before = get().people.length;
    const people = removeDuplicatePeople(get().people);
    set({
      people,
      inputText: people.map((person) => person.name).join('\n'),
      selectedPersonId: people.some((person) => person.id === get().selectedPersonId)
        ? get().selectedPersonId
        : (people[0]?.id ?? null)
    });
    return before - people.length;
  },
  clearPeople: () => set({ people: [], inputText: '', selectedPersonId: null }),
  newProject: () =>
    set({
      people: [],
      inputText: '',
      selectedPersonId: null,
      progress: null,
      busyTask: null
    }),
  restoreDefaultSettings: () =>
    set({ textStyle: DEFAULT_TEXT_STYLE, pageSettings: DEFAULT_PAGE_SETTINGS }),
  updateTextStyle: (patch) => set((state) => ({ textStyle: { ...state.textStyle, ...patch } })),
  updatePageSettings: (patch) =>
    set((state) => ({ pageSettings: { ...state.pageSettings, ...patch } })),
  setPaperPreset: (preset) =>
    set((state) => ({
      pageSettings:
        preset === 'CUSTOM'
          ? { ...state.pageSettings, paperPreset: 'CUSTOM' }
          : applyPaperPreset(state.pageSettings, preset)
    })),
  setOrientation: (orientation) =>
    set((state) => ({ pageSettings: applyOrientation(state.pageSettings, orientation) })),
  setExportScope: (exportScope) => set({ exportScope }),
  setSystemFonts: (systemFonts) => set({ systemFonts }),
  setBusyTask: (busyTask) => set({ busyTask }),
  setProgress: (progress) => set({ progress }),
  showToast: (toast) => set({ toast })
}));

let persistenceTimer: ReturnType<typeof setTimeout> | null = null;

useProjectStore.subscribe((state) => {
  if (persistenceTimer) clearTimeout(persistenceTimer);
  persistenceTimer = setTimeout(() => {
    const snapshot: PersistedProjectState = {
      version: PROJECT_VERSION,
      people: state.people,
      textStyle: state.textStyle,
      pageSettings: state.pageSettings,
      selectedPersonId: state.selectedPersonId,
      exportScope: state.exportScope
    };
    try {
      savePersistedProject(snapshot);
    } catch {
      // A storage quota error should never make the editor unusable.
    }
  }, 350);
});
