import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  MIN_NOTE_HEIGHT,
  MIN_NOTE_WIDTH,
  type Note,
  type NoteColor,
} from "../types/note";
import { StickyNote } from "./StickyNote";
import { TrashZone } from "./TrashZone";

interface BoardProps {
  notes: Note[];
  isCreatingNote: boolean;
  createNote: (bounds: NoteBounds) => void;
  moveNote: (id: Note["id"], x: number, y: number) => void;
  resizeNote: (id: Note["id"], width: number, height: number) => void;
  updateNoteText: (id: Note["id"], text: string) => void;
  updateNoteColor: (id: Note["id"], color: NoteColor) => void;
  deleteNote: (id: Note["id"]) => void;
  bringToFront: (id: Note["id"]) => void;
}

interface NoteBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawingInfo {
  pointerId: number;
  startX: number;
  startY: number;
}

export function Board({
  notes,
  isCreatingNote,
  createNote,
  moveNote,
  resizeNote,
  updateNoteText,
  updateNoteColor,
  deleteNote,
  bringToFront,
}: BoardProps) {
  const boardRef = useRef<HTMLElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const drawingInfoRef = useRef<DrawingInfo | null>(null);
  const drawingPreviewRef = useRef<HTMLDivElement>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);

  function getBoardPoint(
    event: ReactPointerEvent<HTMLDivElement>,
    board: HTMLElement,
  ) {
    const boardRect = board.getBoundingClientRect();

    return {
      x: Math.min(
        Math.max(0, event.clientX - boardRect.left - board.clientLeft),
        board.clientWidth,
      ),
      y: Math.min(
        Math.max(0, event.clientY - boardRect.top - board.clientTop),
        board.clientHeight,
      ),
    };
  }

  function getDrawingBounds(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    board: HTMLElement,
  ): NoteBounds {
    const width = Math.min(
      Math.max(Math.abs(endX - startX), MIN_NOTE_WIDTH),
      board.clientWidth,
    );
    const height = Math.min(
      Math.max(Math.abs(endY - startY), MIN_NOTE_HEIGHT),
      board.clientHeight,
    );
    const x = Math.min(
      Math.max(0, endX < startX ? startX - width : startX),
      Math.max(0, board.clientWidth - width),
    );
    const y = Math.min(
      Math.max(0, endY < startY ? startY - height : startY),
      Math.max(0, board.clientHeight - height),
    );

    return { x, y, width, height };
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

  function handleDrawingPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const board = boardRef.current;

    if (
      !isCreatingNote ||
      event.target !== event.currentTarget ||
      !event.isPrimary ||
      event.button !== 0 ||
      !board ||
      isPointerInsideTrash(event)
    ) {
      return;
    }

    const point = getBoardPoint(event, board);

    drawingInfoRef.current = {
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handleDrawingPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drawingInfo = drawingInfoRef.current;
    const board = boardRef.current;

    if (!drawingInfo || drawingInfo.pointerId !== event.pointerId || !board) {
      return;
    }

    const point = getBoardPoint(event, board);
    const bounds = getDrawingBounds(
      drawingInfo.startX,
      drawingInfo.startY,
      point.x,
      point.y,
      board,
    );
    const preview = drawingPreviewRef.current;

    if (preview) {
      preview.hidden = false;
      preview.style.left = `${bounds.x}px`;
      preview.style.top = `${bounds.y}px`;
      preview.style.width = `${bounds.width}px`;
      preview.style.height = `${bounds.height}px`;
    }
  }

  function finishDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    if (drawingInfoRef.current?.pointerId !== event.pointerId) {
      return null;
    }

    drawingInfoRef.current = null;

    if (drawingPreviewRef.current) {
      drawingPreviewRef.current.hidden = true;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleDrawingPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const board = boardRef.current;
    const drawingInfo = drawingInfoRef.current;

    if (!drawingInfo || drawingInfo.pointerId !== event.pointerId || !board) {
      return;
    }

    const point = getBoardPoint(event, board);
    const hasMoved =
      point.x !== drawingInfo.startX || point.y !== drawingInfo.startY;
    const bounds = hasMoved
      ? getDrawingBounds(
          drawingInfo.startX,
          drawingInfo.startY,
          point.x,
          point.y,
          board,
        )
      : {
          x: Math.min(
            drawingInfo.startX,
            Math.max(0, board.clientWidth - DEFAULT_NOTE_WIDTH),
          ),
          y: Math.min(
            drawingInfo.startY,
            Math.max(0, board.clientHeight - DEFAULT_NOTE_HEIGHT),
          ),
          width: Math.min(DEFAULT_NOTE_WIDTH, board.clientWidth),
          height: Math.min(DEFAULT_NOTE_HEIGHT, board.clientHeight),
        };

    finishDrawing(event);

    if (isCreatingNote) {
      createNote(bounds);
    }
  }

  return (
    <section ref={boardRef} className="relative min-h-[calc(100vh-8rem)]">
      <div
        className={`absolute inset-0 z-0 ${isCreatingNote ? "cursor-crosshair" : ""}`}
        style={{ touchAction: isCreatingNote ? "none" : undefined }}
        onPointerDown={handleDrawingPointerDown}
        onPointerMove={handleDrawingPointerMove}
        onPointerUp={handleDrawingPointerUp}
        onPointerCancel={finishDrawing}
      >
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            boardRef={boardRef}
            trashZoneRef={trashZoneRef}
            moveNote={moveNote}
            resizeNote={resizeNote}
            updateNoteText={updateNoteText}
            updateNoteColor={updateNoteColor}
            deleteNote={deleteNote}
            bringToFront={bringToFront}
            setIsTrashActive={setIsTrashActive}
          />
        ))}
      </div>
      {isCreatingNote && (
        <div
          ref={drawingPreviewRef}
          hidden
          className="pointer-events-none absolute z-40 border-2 border-dashed border-slate-500 bg-slate-400/20"
        />
      )}
      <TrashZone isActive={isTrashActive} trashZoneRef={trashZoneRef} />
    </section>
  );
}
