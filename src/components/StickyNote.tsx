import type { Note } from '../types/note';

interface StickyNoteProps {
  note: Note;
}

export function StickyNote({ note }: StickyNoteProps) {
  return (
    <div
      className="overflow-hidden bg-yellow-200 p-4 text-slate-800 shadow-md"
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
      }}
    >
      {note.text}
    </div>
  );
}
