import { useEffect, useRef, useState } from "react";
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from "react";
import type { Note } from "../types/note";

interface StickyNoteProps {
  note: Note;
  boardRef: RefObject<HTMLElement | null>;
  trashZoneRef: RefObject<HTMLDivElement | null>;
  moveNote: (id: Note["id"], x: number, y: number) => void;
  resizeNote: (id: Note["id"], width: number, height: number) => void;
  updateNoteText: (id: Note["id"], text: string) => void;
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

export function StickyNote({
  note,
  boardRef,
  trashZoneRef,
  moveNote,
  resizeNote,
  updateNoteText,
  deleteNote,
  bringToFront,
  setIsTrashActive,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
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

    updatePosition(event);
    setIsTrashActive(isPointerInsideTrash(event));
  }

  function finishDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragInfoRef.current = null;
    setIsTrashActive(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    updatePosition(event);

    const shouldDelete = isPointerInsideTrash(event);

    finishDragging(event);

    if (shouldDelete) {
      deleteNote(note.id);
    }
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

  return (
    <div
      className="select-none overflow-hidden bg-yellow-200 p-4 text-slate-800 shadow-md"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={finishDragging}
      onLostPointerCapture={finishDragging}
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
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="block h-full w-full resize-none border-0 bg-transparent p-0 outline-none select-text"
          value={note.text}
          onChange={(event) => updateNoteText(note.id, event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onFocus={() => bringToFront(note.id)}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <div className="h-full w-full whitespace-pre-wrap">
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
