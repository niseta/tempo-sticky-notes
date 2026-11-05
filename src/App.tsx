import { Board } from './components/Board';
import { useNotes } from './hooks/useNotes';

function App() {
  const { notes, addNote } = useNotes();

  function handleAddNote() {
    addNote({
      x: 24,
      y: 24,
      width: 240,
      height: 180,
      text: 'New note',
    });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="flex items-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Sticky Notes</h1>
        <p>Notes: {notes.length}</p>
        <button
          className="rounded bg-slate-800 px-4 py-2 text-white"
          type="button"
          onClick={handleAddNote}
        >
          Add Note
        </button>
      </header>
      <Board notes={notes} />
    </main>
  );
}

export default App;
