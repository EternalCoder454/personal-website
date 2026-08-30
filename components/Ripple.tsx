"use client";

import { useCallback, useState } from "react";
import type { PointerEvent } from "react";

type Drop = { id: number; x: number; y: number; size: number };

let nextId = 0;

export function useRipples() {
  const [drops, setDrops] = useState<Drop[]>([]);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    setDrops((current) => [
      ...current,
      {
        id: nextId++,
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      },
    ]);
  }, []);

  const clear = useCallback((id: number) => {
    setDrops((current) => current.filter((drop) => drop.id !== id));
  }, []);

  return { drops, onPointerDown, clear };
}

export function Ripples({
  drops,
  clear,
}: {
  drops: Drop[];
  clear: (id: number) => void;
}) {
  return (
    <>
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="ripple"
          style={{ left: drop.x, top: drop.y, width: drop.size, height: drop.size }}
          onAnimationEnd={() => clear(drop.id)}
        />
      ))}
    </>
  );
}
