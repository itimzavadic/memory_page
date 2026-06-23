"use client";

import type { CustomSectionType } from "@/types/memorial";
import { AttachedMenu } from "@/components/memorial/editor/AttachedMenu";

interface GlobalSectionFabProps {
  onAddSection: (type: CustomSectionType) => void;
}

const SECTION_OPTIONS: { type: CustomSectionType; label: string }[] = [
  { type: "wishes", label: "Пожелания близких" },
  { type: "achievements", label: "Достижения" },
  { type: "life_dates", label: "Памятные даты жизни" },
];

export function GlobalSectionFab({ onAddSection }: GlobalSectionFabProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[2500]">
      <AttachedMenu label="Добавить секцию" size="xl" placement="above" fullScreenOverlay>
        {(close) => (
          <>
            <p className="px-4 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-memorial-text/60">
              Новая секция
            </p>
            {SECTION_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => {
                  onAddSection(opt.type);
                  close();
                }}
                className="block w-full px-4 py-2 text-left text-sm transition hover:bg-memorial-bg"
              >
                {opt.label}
              </button>
            ))}
          </>
        )}
      </AttachedMenu>
    </div>
  );
}
