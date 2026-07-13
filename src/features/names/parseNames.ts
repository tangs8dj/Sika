import { createPerson, type Person } from './nameTypes';

/**
 * Parses text pasted from a textarea or an Excel range.
 * For tab-separated rows, the first non-empty cell is used as the name.
 */
export function parseNameText(input: string): string[] {
  return input
    .split(/\r\n|\n|\r/u)
    .map((row) => {
      const cells = row.split('\t').map((cell) => cell.trim());
      return cells.find((cell) => cell.length > 0) ?? '';
    })
    .filter((name) => name.length > 0);
}

export function namesToPeople(
  names: readonly string[],
  startOrder = 0,
  idFactory?: () => string
): Person[] {
  return names.map((name, index) => createPerson(name, startOrder + index, idFactory));
}

export function removeDuplicatePeople(people: readonly Person[]): Person[] {
  const seen = new Set<string>();
  return people
    .filter((person) => {
      const normalized = person.name.trim();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    })
    .map((person, index) => ({ ...person, order: index }));
}

export function normalizePeopleOrder(people: readonly Person[]): Person[] {
  return [...people]
    .sort((a, b) => a.order - b.order)
    .map((person, index) => ({ ...person, order: index }));
}
