"use client";

interface SectionReorderControlsProps {
  onMove: (direction: "up" | "down") => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function Triangle({ direction }: { direction: "up" | "down" }) {
  return (
    <span
      className={`inline-block h-0 w-0 border-x-[8px] border-x-transparent ${
        direction === "up"
          ? "border-b-[11px] border-b-memorial-text/80"
          : "border-t-[11px] border-t-memorial-text/80"
      }`}
      aria-hidden
    />
  );
}

export function SectionReorderControls({
  onMove,
  canMoveUp,
  canMoveDown,
}: SectionReorderControlsProps) {
  return (
    <div className="pointer-events-auto flex items-center gap-1.5">
      <button
        type="button"
        disabled={!canMoveUp}
        onClick={() => onMove("up")}
        className="flex h-11 w-11 items-center justify-center rounded-md transition hover:bg-memorial-bg disabled:pointer-events-none disabled:opacity-25"
        aria-label="Переместить секцию вверх"
      >
        <Triangle direction="up" />
      </button>
      <button
        type="button"
        disabled={!canMoveDown}
        onClick={() => onMove("down")}
        className="flex h-11 w-11 items-center justify-center rounded-md transition hover:bg-memorial-bg disabled:pointer-events-none disabled:opacity-25"
        aria-label="Переместить секцию вниз"
      >
        <Triangle direction="down" />
      </button>
    </div>
  );
}
