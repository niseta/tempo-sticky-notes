import { useRef, useState } from "react";
import type { Note } from "../types/note";
import { StickyNote } from "./StickyNote";
import { TrashZone } from "./TrashZone";

interface BoardProps {
  notes: Note[];
  moveNote: (id: Note["id"], x: number, y: number) => void;
  resizeNote: (id: Note["id"], width: number, height: number) => void;
  updateNoteText: (id: Note["id"], text: string) => void;
  deleteNote: (id: Note["id"]) => void;
  bringToFront: (id: Note["id"]) => void;
}

export function Board({
  notes,
  moveNote,
  resizeNote,
  updateNoteText,
  deleteNote,
  bringToFront,
}: BoardProps) {
  const boardRef = useRef<HTMLElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);

  return (
    <section ref={boardRef} className="relative min-h-[calc(100vh-8rem)]">
      <div className="absolute inset-0 z-0">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            boardRef={boardRef}
            trashZoneRef={trashZoneRef}
            moveNote={moveNote}
            resizeNote={resizeNote}
            updateNoteText={updateNoteText}
            deleteNote={deleteNote}
            bringToFront={bringToFront}
            setIsTrashActive={setIsTrashActive}
          />
        ))}
      </div>
      <TrashZone isActive={isTrashActive} trashZoneRef={trashZoneRef} />
    </section>
  );
}
