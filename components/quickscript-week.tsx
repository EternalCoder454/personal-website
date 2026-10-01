"use client";

import Link from "next/link";
import { useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { autoStatus, heldLine, longDay, nextRun, nextStep, cap, plainLogLine, plainReason, plainSource, roleLabel, roleName, seasonFor, shortDate, strength, taxYearFor, timeLabel, WEEKDAYS, whenLabel } from "@/lib/quickscript/logic";
import type { CollectorStatus, KeyStatus, LastRun, PipelineStep, RunSummary, RankedTopic, Recipient, Settings, WeekState } from "@/lib/quickscript/types";
import { ActionStatus, Btn, CARD, Mark, NO_HOST_EMAIL, StateText, control, Empty, Field, InlineError, Loading, Panel, useAction, type MarkKind, type Resource } from "./quickscript-ui";

const client = pickClient();

const STATE_LABEL: Record<CollectorStatus["state"], string> = {
  ok: "Working",
  failed: "Not working",
  cached: "Using a saved copy",
  off: "Off",
};
const STATE_MARK: Record<CollectorStatus["state"], MarkKind> = { ok: "good", failed: "failed", cached: "dash", off: "dash" };

function Waiting({ s }: { s: PipelineStep }) {
  const who = roleName(s.who);
  if (s.state === "done") return <StateText kind="good" className="text-primary">Done</StateText>;
  if (s.state === "partial") return <StateText kind="dash" className="text-primary">{s.detail ? `${s.detail} done. ` : "Started. "}Waiting on {who}</StateText>;
  return <StateText kind="clock" className="text-on-surface-variant">Waiting on {who}</StateText>;
}

function StepRow({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol aria-label="Steps this week" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {steps.map((s) => (
        <li key={s.key} className={`flex flex-col gap-1 ${CARD} px-3 py-3`}>
          <span className="font-medium">{s.label}</span>
          <Waiting s={s} />
          <span className="text-sm text-on-surface-muted">{roleLabel(s.who)}</span>
        </li>
      ))}
    </ol>
  );
}

function NextCard({ week, settings, onChanged }: { week: WeekState; settings: Settings; onChanged: () => Promise<void> }) {
  const a = useAction(onChanged);
  const season = seasonFor(new Date(), settings.seasonOverride);
  const step = nextStep(week.steps, season);
  const host = settings.people.hostEmail;

  const go = () => {
    if (step.kind === "find") {
      void a.run("Finding this week's topics", () => client.findTopics(), "Could not find this week's topics");
    } else if (step.kind === "draft") {
      void a.run(`Writing ${step.count === 1 ? "1 script" : `${step.count} scripts`}`, () => client.draft({ count: step.count }), "Could not write the scripts");
    } else if (step.kind === "send") {
      if (!host.trim()) return a.fail(NO_HOST_EMAIL);
      const n = step.total === null ? "the scripts" : step.total === 1 ? "the script" : `all ${step.total} scripts`;
      if (!window.confirm(`Email ${n} to the Host (${host})? They will receive the email now.`)) return;
      void a.run("Sending the scripts to the Host", () => client.sendDrafts({ to: "host" }), "Could not send the scripts");
    }
  };

  return (
    <Panel title="What to do now" inset>
      <p className="text-lg">{step.text}</p>
      {"button" in step && (
        <div className="mt-3">
          <Btn variant="primary" disabled={a.busy !== null} onClick={go}>
            {step.button}
          </Btn>
        </div>
      )}
      <div className="mt-3">
        <ActionStatus busy={a.busy} message={a.message} detail={a.detail} error={a.error} />
      </div>
    </Panel>
  );
}

function Controls({
  week,
  settings,
  onChanged,
}: {
  week: WeekState;
  settings: Settings;
  onChanged: () => Promise<void>;
}) {
  const [dryRun, setDryRun] = useState(false);
  const [to, setTo] = useState<Recipient>("me");
  const [count, setCount] = useState(3);
  const a = useAction(onChanged);
  const working = a.busy !== null;

  const okToHost = (what: string) => {
    if (to !== "host") return true;
    if (!settings.people.hostEmail.trim()) {
      a.fail(NO_HOST_EMAIL);
      return false;
    }
    return window.confirm(`${what} to the Host (${settings.people.hostEmail})? They will receive the email now.`);
  };

  return (
    <Panel title="Actions" inset>
      <div>
        <div className="flex flex-col gap-6">
          <Field label="Send scripts to" className="w-full sm:w-56">
            <select className={control} value={to} onChange={(e) => setTo(e.target.value as Recipient)}>
              <option value="me">Me (a test)</option>
              <option value="host">The Host</option>
            </select>
          </Field>

          <div className="flex flex-col gap-3">
            <h3 className="font-medium">All at once</h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Btn
                variant="primary"
                disabled={working}
                onClick={() => {
                  if (!dryRun && !okToHost("Do everything for this week and email the scripts")) return;
                  void a.run(
                    dryRun ? "Doing a test run" : "Doing everything for this week",
                    () => client.runWeekly({ dryRun, to }),
                    dryRun ? "The test run did not work" : "Could not do everything for this week",
                  );
                }}
              >
                Do everything for this week
              </Btn>
              <label className="flex min-h-11 items-center gap-2">
                <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                Test run (sends nothing)
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-medium">One step at a time</h3>
            <div className="flex flex-wrap items-end gap-3">
              <Btn disabled={working} onClick={() => void a.run("Finding this week's topics", () => client.findTopics(), "Could not find this week's topics")}>
                Find this week&apos;s topics
              </Btn>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="How many scripts" className="w-36">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5}
                  className={control}
                  value={count}
                  onChange={(e) => setCount(Math.min(5, Math.max(1, Math.round(Number(e.target.value)) || 1)))}
                />
              </Field>
              <Btn
                disabled={working}
                onClick={() => void a.run(`Writing ${count === 1 ? "1 script" : `${count} scripts`}`, () => client.draft({ count }), "Could not write the scripts")}
              >
                {`Write ${count === 1 ? "1 script" : `${count} scripts`}`}
              </Btn>
            </div>
            <div>
              <Btn
                disabled={working}
                onClick={() => {
                  if (!okToHost("Send the scripts")) return;
                  void a.run("Sending the scripts", () => client.sendDrafts({ to }), "Could not send the scripts");
                }}
              >
                Send scripts
              </Btn>
            </div>
            <div>
              {week.driveReady ? (
                <Btn disabled>The shared Drive folder is created</Btn>
              ) : (
                <Btn disabled={working} onClick={() => void a.run("Creating the shared Drive folder", () => client.setupDrive(), "Could not create the shared Drive folder")}>
                  Create the shared Drive folder
                </Btn>
              )}
            </div>
          </div>
        </div>

      </div>
      <div className="mt-4">
        <ActionStatus busy={a.busy} message={a.message} detail={a.detail} error={a.error} />
      </div>
    </Panel>
  );
}

function Facts({ week, settings }: { week: WeekState; settings: Settings }) {
  const now = new Date();
  const season = seasonFor(now, settings.seasonOverride);
  const next = nextRun(now, settings.schedule);
  return (
    <Panel title="About this week">
      <dl className="grid content-start grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-on-surface-variant">Week of</dt>
          <dd>{shortDate(week.weekOf)}</dd>
          <dt className="text-on-surface-variant">Season</dt>
          <dd>
            {season === "inseason" ? "Tax season" : "Off season"}
            {settings.seasonOverride === "auto" ? ", set by the date" : ", chosen in Settings"}
          </dd>
          <dt className="text-on-surface-variant">Runs by itself next</dt>
          <dd>
            {longDay(next)}, {timeLabel(settings.schedule.time)}
          </dd>
          <dt className="text-on-surface-variant">Tax year</dt>
          <dd>
            {taxYearFor(now, settings.taxYearOverride)}
            {settings.taxYearOverride ? ", chosen in Settings" : ", set by the date"}
          </dd>
          <dt className="text-on-surface-variant">Schedule</dt>
          <dd>
            Every {WEEKDAYS[settings.schedule.day]}, {timeLabel(settings.schedule.time)}
          </dd>
        </dl>
    </Panel>
  );
}

function Topics({ week, onChanged }: { week: WeekState; onChanged: () => Promise<void> }) {
  // Only what the owner has changed is stored. Everything else follows rank,
  // so a refreshed list keeps the top three ticked without an effect.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const a = useAction(onChanged);

  const isOn = (t: RankedTopic, i: number) => overrides[t.id] ?? i < 3;
  const chosen = week.topics.filter((t, i) => isOn(t, i));

  return (
    <Panel
      title="This week's topics"
      actions={
        <Btn
          variant="primary"
          disabled={a.busy !== null || chosen.length === 0}
          onClick={() => void a.run("Writing scripts for the ticked topics", () => client.draft({ topicIds: chosen.map((t) => t.id) }), "Could not write the scripts")}
        >
          Write scripts for ticked topics
        </Btn>
      }
    >
      {week.topics.length === 0 ? (
        <Empty>No topics yet. Use Find this week&apos;s topics.</Empty>
      ) : (
        <>
        <p className="mb-1 text-right text-sm text-on-surface-variant">Topic strength</p>
        <ul className="divide-y divide-outline-variant border-y border-outline-variant">
          {week.topics.map((t, i) => (
            <li key={t.id}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]"
                  checked={isOn(t, i)}
                  onChange={(e) => setOverrides((o) => ({ ...o, [t.id]: e.target.checked }))}
                />
                <span className="min-w-0 flex-1">
                  <span className="block">{t.question}</span>
                  <span className="mt-1 flex flex-wrap gap-x-3 text-sm text-on-surface-variant">
                    <span>{t.sources.map(plainSource).join(", ")}</span>
                    {t.deadlineBoost && <span className="text-primary">Deadline soon</span>}
                    {t.highEndDemoted && <span>Too specialised, moved down</span>}
                    {t.drafted && <span>Script written</span>}
                  </span>
                </span>
                <span className="shrink-0 pt-1 text-right" title={`Score ${t.score.toFixed(1)}`}>
                  <span className="block text-on-surface">{strength(t.score)}</span>
                  <span className="block text-sm tabular-nums text-on-surface-muted">{t.score.toFixed(1)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        </>
      )}
      <div className="mt-3">
        <ActionStatus busy={a.busy} message={a.message} detail={a.detail} error={a.error} />
      </div>
    </Panel>
  );
}

function Collectors({ items }: { items: CollectorStatus[] }) {
  return (
    <Panel title="Where topics come from">
      <ul className="divide-y divide-outline-variant border-y border-outline-variant">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-1 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span>{plainSource(c.name)}</span>
              <StateText kind={STATE_MARK[c.state]} className={c.state === "failed" ? "font-medium text-error" : c.state === "off" ? "text-on-surface-muted" : "text-on-surface"}>
                {STATE_LABEL[c.state]}
              </StateText>
            </div>
            <span className="text-sm text-on-surface-variant">
              {c.state === "off"
                ? `Off. ${c.note ?? "Turned off in Settings"}`
                : `${c.lastRun ? `Last checked ${whenLabel(c.lastRun)}` : "Not checked yet"}${c.note ? `. ${c.state === "failed" ? cap(plainReason(c.note)) : c.note}` : ""}`}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const CARD_TONE = {
  good: { fill: CARD, text: "", mark: "good" },
  attention: { fill: "bg-[#2c2613]", text: "text-[#e5c07b]", mark: "attention" },
  failed: { fill: "bg-error-container", text: "text-error", mark: "failed" },
  missed: { fill: CARD, text: "", mark: "clock" },
} as const;

function StatusCard({ settings, keys, lastRun }: { settings: Settings; keys: KeyStatus | undefined; lastRun: LastRun | undefined }) {
  const s = autoStatus(settings, keys, lastRun, new Date());
  const tone = CARD_TONE[s.state];
  return (
    <section aria-label="Automatic sending" className={`${tone.fill} p-4 sm:p-6`}>
      <h2 className={`flex items-center gap-2 text-xl font-semibold ${tone.text}`}>
        <Mark kind={tone.mark} size={22} />
        {s.title}
      </h2>
      <p className="mt-2 text-lg">{s.text}</p>
      <p className="mt-3 text-on-surface-variant">{s.plan}</p>
    </section>
  );
}

const RUN_WORD: Record<RunSummary["state"], string> = { good: "sent", attention: "sent", failed: "failed", missed: "did not run" };

function runLabel(r: RunSummary): string {
  const d = shortDate(r.ranAt);
  if (r.state === "failed") return `${d}: failed`;
  if (r.state === "missed") return `${d}: did not run`;
  return `${d}: ${RUN_WORD[r.state]} ${r.sent}${r.held > 0 ? `, ${r.held} not sent, needs a fix` : ""}`;
}

function RecentRuns({ runs }: { runs: RunSummary[] }) {
  if (runs.length === 0) return null;
  // Newest comes first from the server. Left to right reads oldest to newest.
  const ordered = [...runs].slice(0, 6).reverse();
  return (
    <div>
      <h2 className="mb-2 text-lg font-medium">Recent runs</h2>
      <ul aria-label="Recent runs" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ordered.map((r) => {
          const kind: MarkKind = r.state === "good" ? "good" : r.state === "attention" ? "attention" : r.state === "failed" ? "failed" : "clock";
          return (
            <li key={r.ranAt} title={runLabel(r)} aria-label={runLabel(r)} className={`flex flex-col gap-1 ${CARD} px-3 py-3 hover:bg-surface-container`}>
              <span className="text-sm text-on-surface-variant">{shortDate(r.ranAt)}</span>
              <StateText kind={kind}>
                {r.state === "failed" ? "Failed" : r.state === "missed" ? "Didn't run" : `Sent ${r.sent}`}
              </StateText>
              {r.held > 0 && <span className="text-sm text-[#e5c07b]">{r.held} not sent</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function checkWords(c: LastRun["sent"][number]["checks"]): string {
  return [
    c.lengthOk ? "Length OK" : `Length off (${c.words} words)`,
    c.disclaimerOk ? "Disclaimer OK" : "Disclaimer missing",
    c.unverifiedNumbers === 0 ? "Numbers OK" : `${c.unverifiedNumbers} ${c.unverifiedNumbers === 1 ? "number needs" : "numbers need"} checking`,
  ].join(", ");
}

function LastRunCard({ run, log }: { run: LastRun | undefined; log: string[] }) {
  const logView =
    log.length === 0 ? null : (
      <div className="mt-6 border-t border-outline-variant pt-4">
        <h3 className="font-medium">What happened, step by step</h3>
        <ul className="mt-3 flex flex-col gap-2" aria-label="Last run, in words">
          {log.map((l, i) => (
            <li key={i}>{plainLogLine(l)}</li>
          ))}
        </ul>
        <details className="mt-3">
          <summary className="cursor-pointer py-2 text-on-surface-variant">Show full details</summary>
          <pre className="t-value mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-on-surface-variant" tabIndex={0} aria-label="Technical log lines">
            {log.join("\n")}
          </pre>
        </details>
      </div>
    );
  if (!run) {
    return (
      <Panel title="Last run">
        <Empty>Nothing has run yet.</Empty>
        {logView}
      </Panel>
    );
  }
  return (
    <Panel title="Last run">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-on-surface-variant">When</dt>
        <dd>
          {whenLabel(run.ranAt)}, {run.trigger === "schedule" ? "started by itself" : "started by hand"}
        </dd>
        {run.ok ? (
          <>
            <dt className="text-on-surface-variant">Found</dt>
            <dd>
              {run.topicsFound} topics, kept the best {run.topicsKept}. Wrote {run.scriptsWritten} {run.scriptsWritten === 1 ? "script" : "scripts"}.
            </dd>
          </>
        ) : (
          <>
            <dt className="font-medium text-error">Failed</dt>
            <dd className="text-error">{run.error ? cap(run.error.replace(/[.\s]+$/, "")) : "The run stopped"}</dd>
          </>
        )}
      </dl>

      <div className="mt-6 border-t border-outline-variant pt-4">
        <h3 className="font-medium">{run.sent.length > 0 ? `Sent to ${run.sentTo}` : "Sent"}</h3>
        {run.sent.length === 0 ? (
          <p className="mt-2 text-on-surface-variant">Nothing was sent.</p>
        ) : (
          <ul className="mt-2 divide-y divide-outline-variant">
            {run.sent.map((s) => (
              <li key={s.slug} className="flex flex-col gap-1 py-3">
                <span>{s.topic}</span>
                <span className="text-sm text-on-surface-variant">
                  {strength(s.score)} ({s.score.toFixed(1)}). {checkWords(s.checks)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 border-t border-outline-variant pt-4">
        <h3 className="font-medium">Not sent, needs a fix</h3>
        {run.held.length === 0 ? (
          <p className="mt-2 text-on-surface-variant">Nothing was left unsent.</p>
        ) : (
          <ul className="mt-2 divide-y divide-outline-variant">
            {run.held.map((h) => (
              <li key={h.slug} className="flex flex-col gap-1 py-3">
                <span>{h.topic}</span>
                <StateText kind="attention" className="text-sm text-[#e5c07b]">
                  {strength(h.score)} ({h.score.toFixed(1)}). {heldLine(h)}
                </StateText>
              </li>
            ))}
          </ul>
        )}
      </div>
      {logView}
    </Panel>
  );
}

/** The latest run's scripts in plain words: what went out and what is waiting on a fix. Dated, so an old run is never taken for this week's. */
function WeekScripts({ run }: { run: LastRun | undefined }) {
  const sent = run?.sent ?? [];
  const held = run?.held ?? [];
  return (
    <Panel title="Latest scripts">
      {sent.length === 0 && held.length === 0 ? (
        <Empty>No scripts yet. They are made by themselves on the day set in Settings.</Empty>
      ) : (
        <>
        {run && <p className="text-on-surface-variant">Made {whenLabel(run.ranAt)}</p>}
        <ul className="divide-y divide-outline-variant">
          {sent.map((s) => (
            <li key={s.slug} className="flex flex-col gap-1 py-3">
              <span className="text-lg">{s.topic}</span>
              <StateText kind="good" className="text-on-surface-variant">
                Emailed to {run?.sentTo || "the Host"}
              </StateText>
            </li>
          ))}
          {held.map((h) => (
            <li key={h.slug} className="flex flex-col gap-1 py-3">
              <span className="text-lg">{h.topic}</span>
              <StateText kind="attention" className="text-[#e5c07b]">
                Not sent yet: {h.reasons.join(", ")}
              </StateText>
            </li>
          ))}
        </ul>
        </>
      )}
      <p className="mt-4">
        <Link href="/quickscript?view=scripts" className="underline underline-offset-4">
          Read, fix or send a script
        </Link>
      </p>
    </Panel>
  );
}

/** The one button anybody needs when a week went wrong. */
function MakeNow({ settings, onChanged }: { settings: Settings; onChanged: () => Promise<void> }) {
  const a = useAction(onChanged);
  const host = settings.people.hostEmail.trim();
  const me = settings.people.testRecipient.trim();
  const when = `every ${WEEKDAYS[settings.schedule.day]} at ${timeLabel(settings.schedule.time)}`;
  return (
    <Panel title="Make scripts now">
      <p>
        You do not normally need this. Scripts are made and emailed by themselves {when}. Use it if a week was missed or the last run failed. It takes a
        few minutes.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Btn
          variant="primary"
          disabled={a.busy !== null}
          onClick={() => {
            if (!host) return a.fail(NO_HOST_EMAIL);
            if (!window.confirm(`Make this week's scripts and email them to the Host (${host})? They will get the email in a few minutes.`)) return;
            void a.run("Making this week's scripts and emailing the Host", () => client.runWeekly({ dryRun: false, to: "host" }), "Could not make this week's scripts");
          }}
        >
          Make scripts and email the Host
        </Btn>
        <Btn
          disabled={a.busy !== null}
          onClick={() => {
            if (!me) return a.fail("Your own email is not set. Add it in Settings.");
            void a.run("Making this week's scripts and emailing you", () => client.runWeekly({ dryRun: false, to: "me" }), "Could not make this week's scripts");
          }}
        >
          Email them only to me first
        </Btn>
      </div>
      <div className="mt-4">
        <ActionStatus busy={a.busy} message={a.message} detail={a.detail} error={a.error} compact />
      </div>
    </Panel>
  );
}

export function WeekView({
  week,
  settings,
  keys,
  onChanged,
}: {
  week: Resource<WeekState>;
  settings: Resource<Settings>;
  keys: Resource<KeyStatus>;
  onChanged: () => Promise<void>;
}) {
  const err = week.error ?? settings.error;
  if (week.data && settings.data) {
    return (
      <div className="flex flex-col gap-8">
        {err && <InlineError message={err} onRetry={() => void onChanged()} />}
        <StatusCard settings={settings.data} keys={keys.data} lastRun={week.data.lastRun} />
        <WeekScripts run={week.data.lastRun} />
        <MakeNow settings={settings.data} onChanged={onChanged} />
        <details className={CARD}>
          <summary className="cursor-pointer px-4 py-4 text-lg font-medium sm:px-6">More details</summary>
          <div className="flex flex-col gap-8 p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-on-surface-variant">For checking what happened, or doing one step at a time. Not needed in a normal week.</p>
            <RecentRuns runs={week.data.recentRuns} />
            <LastRunCard run={week.data.lastRun} log={week.data.log} />
            <StepRow steps={week.data.steps} />
            <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
              <Topics week={week.data} onChanged={onChanged} />
              <div className="flex flex-col gap-6">
                <Collectors items={week.data.collectors} />
                <Facts week={week.data} settings={settings.data} />
              </div>
            </div>
            <NextCard week={week.data} settings={settings.data} onChanged={onChanged} />
            <Controls week={week.data} settings={settings.data} onChanged={onChanged} />
          </div>
        </details>
      </div>
    );
  }
  if (err) return <InlineError message={err} onRetry={() => void onChanged()} />;
  return <Loading what="this week" />;
}
