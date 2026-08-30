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

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
};

/* Whole seconds, so the snapshot is stable between reads within a tick -
   returning a fresh Date each call would loop forever. */
const getSnapshot = () => Math.floor(Date.now() / 1000);

/* Null on the server, so the first paint is the placeholder and hydration
   matches. useSyncExternalStore is the right primitive for reading a value
   that changes outside React. */
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
      <p className="clock__time">{now ? timeFmt.format(now) : "--:--:--"}</p>
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
