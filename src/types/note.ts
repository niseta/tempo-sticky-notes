export const NOTE_COLORS = [
  'yellow',
  'pink',
  'blue',
  'green',
  'purple',
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export const DEFAULT_NOTE_COLOR: NoteColor = 'yellow';

export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  zIndex: number;
  color: NoteColor;
}
