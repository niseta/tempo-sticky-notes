import type { Note } from '../types/note';
import { StickyNote } from './StickyNote';

interface BoardProps {
  notes: Note[];
}

export function Board({ notes }: BoardProps) {
  return (
    <section className="relative min-h-[calc(100vh-8rem)]">
      {notes.map((note) => (
        <StickyNote key={note.id} note={note} />
      ))}
    </section>
  );
}
