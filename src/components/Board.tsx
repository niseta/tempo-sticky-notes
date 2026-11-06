import { useRef } from 'react';
import type { Note } from '../types/note';
import { StickyNote } from './StickyNote';

interface BoardProps {
  notes: Note[];
  moveNote: (id: Note['id'], x: number, y: number) => void;
  resizeNote: (id: Note['id'], width: number, height: number) => void;
  bringToFront: (id: Note['id']) => void;
}

export function Board({ notes, moveNote, resizeNote, bringToFront }: BoardProps) {
  const boardRef = useRef<HTMLElement>(null);

  return (
    <section ref={boardRef} className="relative min-h-[calc(100vh-8rem)]">
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          boardRef={boardRef}
          moveNote={moveNote}
          resizeNote={resizeNote}
          bringToFront={bringToFront}
        />
      ))}
    </section>
  );
}
