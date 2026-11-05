import { useNotes } from './hooks/useNotes';

function App() {
  const { notes } = useNotes();

  return (
    <main className="min-h-screen bg-slate-100">
      <h1 className="text-2xl font-bold">Sticky Notes</h1>
      <p>Notes: {notes.length}</p>
    </main>
  );
}

export default App;
