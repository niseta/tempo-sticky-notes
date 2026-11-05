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

  return { notes, addNote };
}
