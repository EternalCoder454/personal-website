import "server-only";

/**
 * A tiny in-process timing registry.
 *
 * WHAT THIS IS HONEST ABOUT
 *
 * This site is almost entirely static. When somebody loads the home page
 * it is served from a CDN and no code of ours runs at all, so there is
 * no server-side hot path to find there. The only request that executes
 * real server work is the beta form, and that is where the interesting
 * timings live: validation, the rate-limit check, and the outbound
 * webhook, which is the one call that can actually be slow.
 *
 * Proxy is the only hook that fires on a page view. It is off unless
 * PERF_TOKEN is set, because turning it on converts a free CDN hit into
 * a function invocation on every visit. That is a real cost on a page
 * whose whole point is loading fast.
 *
 * On Vercel the proxy runs as its own function, separate from the route
 * handler lambdas, so page samples and waitlist samples land in
 * different instances and a snapshot shows one or the other. They only
 * appear together under a single self-hosted `next start`. Read the
 * page counts as traffic shape, not as a complete picture.
 *
 * WHAT IT DOES NOT COLLECT
 *
 * No IP address, no user agent, no referrer, no cookie, no identifier of
 * any kind. A sample is a route name, a duration and a status. That is a
 * deliberate constraint, not an oversight: it keeps the promise the
 * privacy notice makes, and it means these numbers are not personal data.
 *
 * WHAT IT CANNOT TELL YOU
 *
 * Samples live in one server instance's memory. Serverless means several
 * instances and cold starts, so a snapshot is what THIS instance has
 * seen since IT started, not what the site has served. Treat it as a
 * probe, not as analytics. If you ever need real totals, that is a job
 * for Vercel's own metrics, not for this.
 */

export type Sample = { name: string; ms: number; ok: boolean; at: number };

/* Bounded per span name, not globally.
   A single shared buffer looked fine until middleware was switched on:
   page samples arrive on every visit and would evict the handful of
   waitlist timings that are the whole reason this exists. Capping each
   name separately means a noisy span cannot crowd out a quiet one. */
const MAX_PER_NAME = 400;

type Registry = { samples: Sample[]; startedAt: number };

/**
 * Held on globalThis so it survives module re-evaluation in dev, where
 * hot reload would otherwise reset the numbers on every edit.
 */
const globalForPerf = globalThis as unknown as { __eterneonPerf?: Registry };

const registry: Registry = (globalForPerf.__eterneonPerf ??= {
  samples: [],
  startedAt: Date.now(),
});

/** Instrumentation is off unless a token exists to read it back with. */
export const perfEnabled = Boolean(process.env.PERF_TOKEN);

export function record(name: string, ms: number, ok = true): void {
  if (!perfEnabled) return;
  registry.samples.push({ name, ms, ok, at: Date.now() });

  const forName = registry.samples.reduce(
    (n, s) => (s.name === name ? n + 1 : n),
    0,
  );
  if (forName > MAX_PER_NAME) {
    const index = registry.samples.findIndex((s) => s.name === name);
    if (index !== -1) registry.samples.splice(index, 1);
  }
}

/**
 * Times a span. Returns a stop function so a caller reads as
 * `const done = start("thing"); ...; done();`
 */
export function start(name: string): (ok?: boolean) => number {
  if (!perfEnabled) return () => 0;
  const t0 = performance.now();
  return (ok = true) => {
    const ms = performance.now() - t0;
    record(name, ms, ok);
    return ms;
  };
}

/** Times a promise and records it whether it resolves or throws. */
export async function measure<T>(name: string, run: () => Promise<T>): Promise<T> {
  const done = start(name);
  try {
    const result = await run();
    done(true);
    return result;
  } catch (error) {
    done(false);
    throw error;
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  /* Nearest-rank. With a handful of samples anything cleverer is
     precision the data does not have. */
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))];
}

const round = (n: number) => Math.round(n * 100) / 100;

export type SpanStats = {
  name: string;
  count: number;
  errors: number;
  p50: number;
  p90: number;
  p99: number;
  max: number;
  mean: number;
  /* Total time spent in this span. The honest way to rank hot paths:
     something slow that runs once matters less than something quick
     that runs on every request. */
  totalMs: number;
};

export function snapshot() {
  const byName = new Map<string, Sample[]>();
  for (const sample of registry.samples) {
    const list = byName.get(sample.name);
    if (list) list.push(sample);
    else byName.set(sample.name, [sample]);
  }

  const spans: SpanStats[] = [...byName.entries()].map(([name, samples]) => {
    const times = samples.map((s) => s.ms).sort((a, b) => a - b);
    const total = times.reduce((a, b) => a + b, 0);
    return {
      name,
      count: samples.length,
      errors: samples.filter((s) => !s.ok).length,
      p50: round(percentile(times, 50)),
      p90: round(percentile(times, 90)),
      p99: round(percentile(times, 99)),
      max: round(times[times.length - 1] ?? 0),
      mean: round(total / times.length),
      totalMs: round(total),
    };
  });

  /* Ranked by total time, so the list reads as "where the time goes". */
  spans.sort((a, b) => b.totalMs - a.totalMs);

  const memory = process.memoryUsage?.();

  return {
    note:
      "One server instance, in memory, since it started. Not site-wide totals. No IP, user agent or identifier is recorded.",
    instanceStartedAt: new Date(registry.startedAt).toISOString(),
    instanceUptimeSec: round((Date.now() - registry.startedAt) / 1000),
    samples: registry.samples.length,
    sampleCapPerName: MAX_PER_NAME,
    rssMB: memory ? round(memory.rss / 1024 / 1024) : null,
    heapUsedMB: memory ? round(memory.heapUsed / 1024 / 1024) : null,
    spans,
  };
}

export function reset(): void {
  registry.samples.length = 0;
  registry.startedAt = Date.now();
}
