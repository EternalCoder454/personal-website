"use client";

import { useEffect, useState } from "react";
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

/* The clock only starts after mount. Rendering a live time on the server
   would not match what the client renders a moment later. */
function useNow() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
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
