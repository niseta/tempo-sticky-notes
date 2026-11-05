import { useState } from 'react';
import type { Note } from '../types/note';

export function useNotes() {
  const [notes] = useState<Note[]>([]);

  return { notes };
}
