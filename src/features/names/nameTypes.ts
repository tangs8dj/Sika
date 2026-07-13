export interface Person {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

let fallbackId = 0;

export function createPerson(name: string, order: number, idFactory?: () => string): Person {
  const id = idFactory
    ? idFactory()
    : typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `person-${Date.now()}-${fallbackId++}`;

  return {
    id,
    name,
    enabled: true,
    order
  };
}
