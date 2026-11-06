import { useState } from 'react';
import type { Note } from '../types/note';

type NewNote = Omit<Note, 'id' | 'zIndex'>;

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  function addNote(newNote: NewNote) {
    setNotes((currentNotes) => {
      const highestZIndex = currentNotes.reduce(
        (highest, note) => Math.max(highest, note.zIndex),
        0,
      );

      return [
        ...currentNotes,
        {
          ...newNote,
          id: crypto.randomUUID(),
          zIndex: highestZIndex + 1,
        },
      ];
    });
  }

  function moveNote(id: Note['id'], x: number, y: number) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id ? { ...note, x, y } : note,
      ),
    );
  }

  function bringToFront(id: Note['id']) {
    setNotes((currentNotes) => {
      const highestZIndex = currentNotes.reduce(
        (highest, note) => Math.max(highest, note.zIndex),
        0,
      );

      return currentNotes.map((note) =>
        note.id === id ? { ...note, zIndex: highestZIndex + 1 } : note,
      );
    });
  }

  return { notes, addNote, moveNote, bringToFront };
}
