import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { Note } from '../types/note';

interface StickyNoteProps {
  note: Note;
  boardRef: RefObject<HTMLElement | null>;
  moveNote: (id: Note['id'], x: number, y: number) => void;
  bringToFront: (id: Note['id']) => void;
}

interface DragInfo {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

export function StickyNote({
  note,
  boardRef,
  moveNote,
  bringToFront,
}: StickyNoteProps) {
  const dragInfoRef = useRef<DragInfo | null>(null);

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
    event.preventDefault();
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

  function finishDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragInfoRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragInfoRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    updatePosition(event);
    finishDragging(event);
  }

  return (
    <div
      className="overflow-hidden bg-yellow-200 p-4 text-slate-800 shadow-md"
      onPointerDown={handlePointerDown}
      onPointerMove={updatePosition}
      onPointerUp={handlePointerUp}
      onPointerCancel={finishDragging}
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
        touchAction: 'none',
      }}
    >
      {note.text}
    </div>
  );
}
