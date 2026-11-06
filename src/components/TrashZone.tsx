import type { RefObject } from "react";

interface TrashZoneProps {
  isActive: boolean;
  trashZoneRef: RefObject<HTMLDivElement | null>;
}

export function TrashZone({ isActive, trashZoneRef }: TrashZoneProps) {
  return (
    <div
      ref={trashZoneRef}
      aria-label="Trash"
      className={`pointer-events-none absolute bottom-4 left-1/2 z-50 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow-md transition-colors ${
        isActive
          ? "border-red-600 bg-red-200 text-red-800"
          : "border-slate-400 bg-white text-slate-600"
      }`}
    >
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"
        />
      </svg>
    </div>
  );
}
