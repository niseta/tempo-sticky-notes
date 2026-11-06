# Sticky Notes

A desktop-focused sticky notes board built with React and TypeScript as a take-home project. Users can create, edit, move, resize, recolor, and delete notes. All changes are automatically saved in the browser and restored across sessions.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- ESLint
- Browser APIs: Pointer Events, `localStorage`, and `crypto.randomUUID()`

## Features

- Create notes with default text, size, position, and color.
- Drag notes within the board boundaries.
- Resize notes using the bottom-right handle.
- Edit note text in place with a double-click.
- Choose from five colors for each note.
- Bring notes to the front when interacting with them.
- Delete notes by dragging them into the trash zone.
- Automatically persist notes in `localStorage`.

## Getting Started

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### Installation

```bash
npm install
npm run dev
```

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Project Structure

```text
src/
├── components/
│   ├── Board.tsx        # Board layout and note positioning
│   ├── StickyNote.tsx   # Note UI and pointer interactions
│   └── TrashZone.tsx    # Drop target for deleting notes
├── hooks/
│   └── useNotes.ts      # Note state, operations, and persistence
├── types/
│   └── note.ts          # Note model and color definitions
├── App.tsx              # Application layout and component wiring
├── index.css            # Global styles and Tailwind CSS
└── main.tsx             # Application entry point
```

## Technical Decisions

- **State management:** A custom `useNotes` hook centralizes note operations and persistence, keeping UI components focused on rendering and interactions.
- **Drag and resize:** Native Pointer Events and pointer capture handle interactions without external drag-and-drop dependencies. Mutable interaction data is stored in refs to avoid unnecessary renders.
- **Positioning and stacking:** Notes are constrained to the board during dragging and use dynamic `z-index` values to manage overlapping notes.
- **Persistence:** Notes are stored in `localStorage` and restored on initialization. Storage errors are handled gracefully so the application remains usable.
- **Type safety:** TypeScript defines the note model and shared types, while `crypto.randomUUID()` generates unique note identifiers.

## Usage

- **Create:** Click **Add Note** to create a new note.
- **Edit:** Double-click a note to edit its text. Click outside to finish editing.
- **Move:** Click and drag a note to reposition it.
- **Resize:** Drag the bottom-right corner to change its size.
- **Change color:** Click the palette button on a note and select a color.
- **Bring to front:** Interact with a note to bring it above overlapping notes.
- **Delete:** Drag a note into the trash zone and release it when highlighted.
