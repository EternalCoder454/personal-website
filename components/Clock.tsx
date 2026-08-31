"use client";

import { useSyncExternalStore } from "react";
import { TIMEZONE, TZ_LABEL } from "@/lib/site";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

const zoneFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  timeZoneName: "short",
});

function zoneAbbr(now: Date) {
  return zoneFmt.formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
}

/* One shared timer aligned to the next whole second. setInterval(1000)
   drifts and eventually skips one. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function scheduleTick() {
  timer = setTimeout(() => {
    listeners.forEach((notify) => notify());
    scheduleTick();
  }, 1000 - (Date.now() % 1000) + 8);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) scheduleTick();

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
}

/* Stable within a tick; a fresh Date each call would loop forever. */
const getSnapshot = () => Math.floor(Date.now() / 1000);

/* Null on the server so hydration matches the placeholder. */
const getServerSnapshot = () => null;

function useNow() {
  const seconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return seconds === null ? null : new Date(seconds * 1000);
}

export function Clock() {
  const now = useNow();

  return (
    <section className="card clock" aria-labelledby="clock-label">
      <p className="clock__label" id="clock-label">
        Local time
      </p>
      <p className="clock__time">
        <span className={now ? "clock__value" : "clock__value clock__value--idle"}>
          {now ? timeFmt.format(now) : "--:--:--"}
        </span>
      </p>
      <p className="clock__date">{now ? dateFmt.format(now) : " "}</p>
    </section>
  );
}

export function TimeZoneChip() {
  const now = useNow();

  return (
    <span className="chip">
      <span className="icon chip__icon" aria-hidden="true">
        schedule
      </span>
      {now ? `${TZ_LABEL} (${zoneAbbr(now)})` : TZ_LABEL}
    </span>
  );
}
