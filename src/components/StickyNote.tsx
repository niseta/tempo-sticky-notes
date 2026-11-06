import { useEffect, useRef, useState } from "react";
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from "react";
import { NOTE_COLORS, type Note, type NoteColor } from "../types/note";

interface StickyNoteProps {
  note: Note;
  boardRef: RefObject<HTMLElement | null>;
  trashZoneRef: RefObject<HTMLDivElement | null>;
  moveNote: (id: Note["id"], x: number, y: number) => void;
  resizeNote: (id: Note["id"], width: number, height: number) => void;
  updateNoteText: (id: Note["id"], text: string) => void;
  updateNoteColor: (id: Note["id"], color: NoteColor) => void;
  deleteNote: (id: Note["id"]) => void;
  bringToFront: (id: Note["id"]) => void;
  setIsTrashActive: Dispatch<SetStateAction<boolean>>;
}

interface DragInfo {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

interface ResizeInfo {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

const MIN_NOTE_WIDTH = 150;
const MIN_NOTE_HEIGHT = 100;

const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-yellow-200",
  pink: "bg-pink-200",
  blue: "bg-blue-200",
  green: "bg-green-200",
  purple: "bg-purple-200",
};

export function StickyNote({
  note,
  boardRef,
  trashZoneRef,
  moveNote,
  resizeNote,
  updateNoteText,
  updateNoteColor,
  deleteNote,
  bringToFront,
  setIsTrashActive,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const dragInfoRef = useRef<DragInfo | null>(null);
  const resizeInfoRef = useRef<ResizeInfo | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        textareaRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsEditing(false);
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown, true);
    };
  }, [isEditing]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || !boardRef.current) {
      return;
    }

    const noteRect = event.currentTarget.getBoundingClientRect();

    dragInfoRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - noteRect.left,
      offsetY: event.clientY - noteRect.top,
    };

    bringToFront(note.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function updatePosition(event: ReactPointerEvent<HTMLDivElement>) {
    const dragInfo = dragInfoRef.current;
    const board = boardRef.current;

    if (!dragInfo || dragInfo.pointerId !== event.pointerId || !board) {
      return;
    }

    const boardRect = board.getBoundingClientRect();
    const boardLeft = boardRect.left + board.clientLeft;
    const boardTop = boardRect.top + board.clientTop;
    const maxX = Math.max(0, board.clientWidth - note.width);
    const maxY = Math.max(0, board.clientHeight - note.height);
    const x = Math.min(
      Math.max(0, event.clientX - boardLeft - dragInfo.offsetX),
      maxX,
    );
    const y = Math.min(
      Math.max(0, event.clientY - boardTop - dragInfo.offsetY),
      maxY,
    );

    moveNote(note.id, x, y);
  }

  function isPointerInsideTrash(event: ReactPointerEvent<HTMLDivElement>) {
    const trashRect = trashZoneRef.current?.getBoundingClientRect();

    return Boolean(
      trashRect &&
      event.clientX >= trashRect.left &&
      event.clientX <= trashRect.right &&
      event.clientY >= trashRect.top &&
      event.clientY <= trashRect.bottom,
    );
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    if ((event.buttons & 1) === 0) {
      finishDragging(event, isPointerInsideTrash(event));
      return;
    }

    updatePosition(event);
    setIsTrashActive(isPointerInsideTrash(event));
  }

  function finishDragging(
    event: ReactPointerEvent<HTMLDivElement>,
    shouldDelete = false,
  ) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragInfoRef.current = null;
    setIsTrashActive(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (shouldDelete) {
      deleteNote(note.id);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    updatePosition(event);

    const shouldDelete = isPointerInsideTrash(event);

    finishDragging(event, shouldDelete);
  }

  function handleLostPointerCapture(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    const shouldDelete =
      (event.buttons & 1) === 0 && isPointerInsideTrash(event);

    finishDragging(event, shouldDelete);
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.stopPropagation();

    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    resizeInfoRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: note.width,
      startHeight: note.height,
    };

    bringToFront(note.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function updateSize(event: ReactPointerEvent<HTMLDivElement>) {
    const resizeInfo = resizeInfoRef.current;

    if (!resizeInfo || resizeInfo.pointerId !== event.pointerId) {
      return;
    }

    const width = Math.max(
      MIN_NOTE_WIDTH,
      resizeInfo.startWidth + event.clientX - resizeInfo.startX,
    );
    const height = Math.max(
      MIN_NOTE_HEIGHT,
      resizeInfo.startHeight + event.clientY - resizeInfo.startY,
    );

    resizeNote(note.id, width, height);
  }

  function handleResizePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    // Stop resizing if the primary mouse button was released.
    if ((event.buttons & 1) === 0) {
      finishResizing(event);
      return;
    }

    updateSize(event);
  }

  function finishResizing(event: ReactPointerEvent<HTMLDivElement>) {
    if (resizeInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    resizeInfoRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleResizePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    updateSize(event);
    finishResizing(event);
  }

  function handleColorSelect(color: NoteColor) {
    updateNoteColor(note.id, color);
    setIsColorPickerOpen(false);
  }

  return (
    <div
      className={`select-none overflow-hidden p-4 text-slate-800 shadow-md ${NOTE_COLOR_CLASSES[note.color]}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={finishDragging}
      onLostPointerCapture={handleLostPointerCapture}
      onDoubleClick={() => setIsEditing(true)}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
        touchAction: "none",
      }}
    >
      <div
        className="absolute top-1 right-2 z-10"
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-900/10 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-600"
          aria-label="Change note color"
          aria-expanded={isColorPickerOpen}
          onClick={() => setIsColorPickerOpen((isOpen) => !isOpen)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <ellipse cx="12" cy="12" rx="9" ry="8" />
            <circle cx="7.5" cy="10.5" r="1.25" fill="#facc15" stroke="none" />
            <circle cx="9.5" cy="7" r="1.25" fill="#f472b6" stroke="none" />
            <circle cx="13.5" cy="6.5" r="1.25" fill="#60a5fa" stroke="none" />
            <circle cx="10.5" cy="13.5" r="1.25" fill="#4ade80" stroke="none" />
            <circle cx="17" cy="9" r="1.5" />
          </svg>
        </button>
        {isColorPickerOpen && (
          <div
            className="absolute top-8 right-0 mt-1 flex gap-1 rounded-md bg-white/90 p-1.5 shadow"
            aria-label="Note colors"
          >
            {NOTE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`h-5 w-5 rounded-full border border-slate-600/20 ${NOTE_COLOR_CLASSES[color]} ${
                  note.color === color ? "ring-2 ring-slate-600/60" : ""
                }`}
                aria-label={`Set note color to ${color}`}
                aria-pressed={note.color === color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        )}
      </div>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="block h-full w-full resize-none border-0 bg-transparent px-0 pt-5 pb-0 outline-none select-text"
          value={note.text}
          onChange={(event) => updateNoteText(note.id, event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onFocus={() => bringToFront(note.id)}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <div className="h-full w-full pt-5 whitespace-pre-wrap">
          {note.text}
        </div>
      )}
      <div
        className="absolute right-1 bottom-1 h-3 w-3 cursor-se-resize border-r-2 border-b-2 border-slate-600/60"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={finishResizing}
        onLostPointerCapture={finishResizing}
        onDoubleClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
