import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { useNotes } from './hooks/useNotes';

interface NoteBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const {
    notes,
    addNote,
    moveNote,
    resizeNote,
    updateNoteText,
    updateNoteColor,
    deleteNote,
    bringToFront,
  } = useNotes();

  useEffect(() => {
    if (!isCreatingNote) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCreatingNote(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingNote]);

  function handleCreateNote(bounds: NoteBounds) {
    addNote({
      ...bounds,
      text: 'New note',
    });
    setIsCreatingNote(false);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="flex items-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Sticky Notes</h1>
        <p>Notes: {notes.length}</p>
        <button
          className={`rounded px-4 py-2 transition-colors ${
            isCreatingNote
              ? 'bg-amber-300 text-slate-950 ring-2 ring-slate-800 ring-offset-2'
              : 'bg-slate-800 text-white'
          }`}
          type="button"
          aria-pressed={isCreatingNote}
          aria-describedby={
            isCreatingNote ? 'creation-mode-instructions' : undefined
          }
          onClick={() => setIsCreatingNote((isCreating) => !isCreating)}
        >
          Add Note
        </button>
        {isCreatingNote && (
          <p
            id="creation-mode-instructions"
            className="text-sm text-slate-600"
            role="status"
          >
            Click or drag on empty space · Esc to cancel
          </p>
        )}
      </header>
      <Board
        notes={notes}
        isCreatingNote={isCreatingNote}
        createNote={handleCreateNote}
        moveNote={moveNote}
        resizeNote={resizeNote}
        updateNoteText={updateNoteText}
        updateNoteColor={updateNoteColor}
        deleteNote={deleteNote}
        bringToFront={bringToFront}
      />
    </main>
  );
}

export default App;
