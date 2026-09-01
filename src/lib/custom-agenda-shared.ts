export const CUSTOM_AGENDA_TITLE_MAX = 120;
export const CUSTOM_AGENDA_NOTE_MAX = 200;

export function isCustomAgendaId(id: string): boolean {
  return id.startsWith("custom:");
}
