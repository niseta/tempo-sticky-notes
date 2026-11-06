import { useEffect, useState } from 'react';
import {
  DEFAULT_NOTE_COLOR,
  NOTE_COLORS,
  type Note,
  type NoteColor,
} from '../types/note';

type NewNote = Omit<Note, 'id' | 'zIndex' | 'color'>;

const STORAGE_KEY = 'sticky-notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes: unknown = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? '[]',
      );

      return Array.isArray(savedNotes)
        ? (savedNotes as Note[]).map((note) => ({
            ...note,
            color: NOTE_COLORS.includes(note.color)
              ? note.color
              : DEFAULT_NOTE_COLOR,
          }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // The application remains usable when localStorage is unavailable.
    }
  }, [notes]);

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
          color: DEFAULT_NOTE_COLOR,
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

  function resizeNote(id: Note['id'], width: number, height: number) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id ? { ...note, width, height } : note,
      ),
    );
  }

  function updateNoteText(id: Note['id'], text: string) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id ? { ...note, text } : note,
      ),
    );
  }

  function updateNoteColor(id: Note['id'], color: NoteColor) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id ? { ...note, color } : note,
      ),
    );
  }

  function deleteNote(id: Note['id']) {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== id),
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

  return {
    notes,
    addNote,
    moveNote,
    resizeNote,
    updateNoteText,
    updateNoteColor,
    deleteNote,
    bringToFront,
  };
}
