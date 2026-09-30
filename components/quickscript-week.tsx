"use client";

import { useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { longDay, nextRun, nextStep, cap, plainLogLine, plainReason, plainSource, roleName, seasonFor, shortDate, shortDateTime, strength, timeLabel, WEEKDAYS } from "@/lib/quickscript/logic";
import type { CollectorStatus, PipelineStep, RankedTopic, Recipient, Settings, WeekState } from "@/lib/quickscript/types";
import { ActionStatus, Btn, NO_HOST_EMAIL, control, Empty, Field, InlineError, Loading, Panel, useAction, type Resource } from "./quickscript-ui";

const client = pickClient();

const STATE_LABEL: Record<CollectorStatus["state"], string> = {
  ok: "Working",
  failed: "Not working",
  cached: "Using a saved copy",
  off: "Off",
};

function Waiting({ s }: { s: PipelineStep }) {
  const who = roleName(s.who);
  if (s.state === "done") return <span className="text-sm text-primary">Done</span>;
  if (s.state === "partial") return <span className="text-sm text-primary">{s.detail ? `${s.detail} done. ` : "Started. "}Waiting on {who}</span>;
  return <span className="text-sm text-on-surface-muted">Waiting on {who}</span>;
}

function StepRow({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol aria-label="Steps this week" className="grid grid-cols-2 gap-px border border-outline-variant bg-outline-variant sm:grid-cols-4 lg:grid-cols-8">
      {steps.map((s) => (
        <li key={s.key} className="flex flex-col gap-0.5 bg-surface-low px-3 py-2.5">
          <span className="font-medium">{s.label}</span>
          <Waiting s={s} />
          <span className="text-xs text-on-surface-muted">{s.who}</span>
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
    <Panel title="What to do now">
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

  const now = new Date();
  const season = seasonFor(now, settings.seasonOverride);
  const next = nextRun(now, settings.schedule);

  return (
    <Panel title="Actions">
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Field label="Send scripts to" className="w-full sm:w-56">
            <select className={control} value={to} onChange={(e) => setTo(e.target.value as Recipient)}>
              <option value="me">Me (a test)</option>
              <option value="host">The Host</option>
            </select>
          </Field>

          <div className="flex flex-col gap-3">
            <h3 className="font-medium">All at once</h3>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Btn
                variant="primary"
                disabled={working}
                onClick={() => {
                  if (!dryRun && !okToHost("Do everything for this week and email the scripts")) return;
                  void a.run(
                    dryRun ? "Doing a practice run" : "Doing everything for this week",
                    () => client.runWeekly({ dryRun, to }),
                    dryRun ? "The practice run did not work" : "Could not do everything for this week",
                  );
                }}
              >
                Do everything for this week
              </Btn>
              <label className="flex min-h-11 items-center gap-2">
                <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                Practice run (sends nothing)
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

        <dl className="grid content-start grid-cols-[auto_1fr] gap-x-5 gap-y-2">
          <dt className="text-on-surface-variant">Week of</dt>
          <dd>{shortDate(week.weekOf)}</dd>
          <dt className="text-on-surface-variant">Season</dt>
          <dd>
            {season === "inseason" ? "Tax season" : "Off season"}
            {settings.seasonOverride === "auto" ? ", worked out from the date" : ", chosen in Settings"}
          </dd>
          <dt className="text-on-surface-variant">Runs by itself next</dt>
          <dd>
            {longDay(next)}, {timeLabel(settings.schedule.time)}
          </dd>
          <dt className="text-on-surface-variant">Tax year</dt>
          <dd>{settings.taxYear}</dd>
          <dt className="text-on-surface-variant">Schedule</dt>
          <dd>
            Every {WEEKDAYS[settings.schedule.day]}, {timeLabel(settings.schedule.time)}
          </dd>
        </dl>
      </div>
      <div className="mt-4">
        <ActionStatus busy={a.busy} message={a.message} detail={a.detail} error={a.error} />
      </div>
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
        <ul className="divide-y divide-outline-variant border-y border-outline-variant">
          {week.topics.map((t, i) => (
            <li key={t.id}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 shrink-0 accent-[var(--color-primary)]"
                  checked={isOn(t, i)}
                  onChange={(e) => setOverrides((o) => ({ ...o, [t.id]: e.target.checked }))}
                />
                <span className="min-w-0 flex-1">
                  <span className="block">{t.question}</span>
                  <span className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-on-surface-variant">
                    <span>{t.sources.map(plainSource).join(", ")}</span>
                    {t.deadlineBoost && <span className="text-primary">Deadline soon</span>}
                    {t.highEndDemoted && <span>Too specialised, moved down</span>}
                    {t.drafted && <span>Script written</span>}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5 text-right" title={`Score ${t.score.toFixed(1)}`}>
                  <span className="block text-on-surface">{strength(t.score)}</span>
                  <span className="t-value block text-xs text-on-surface-muted">{t.score.toFixed(1)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
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
          <li key={c.id} className="flex flex-col gap-0.5 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span>{plainSource(c.name)}</span>
              <span className={c.state === "failed" ? "font-medium text-error" : c.state === "off" ? "text-on-surface-muted" : "text-on-surface"}>
                {STATE_LABEL[c.state]}
              </span>
            </div>
            <span className="text-sm text-on-surface-variant">
              {c.lastRun ? `Last checked ${shortDateTime(c.lastRun)}` : "Not checked yet"}
              {c.note ? `. ${c.state === "failed" ? cap(plainReason(c.note)) : c.note}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function WeekView({
  week,
  settings,
  onChanged,
}: {
  week: Resource<WeekState>;
  settings: Resource<Settings>;
  onChanged: () => Promise<void>;
}) {
  const err = week.error ?? settings.error;
  if (week.data && settings.data) {
    return (
      <div className="flex flex-col gap-5">
        {err && <InlineError message={err} onRetry={() => void onChanged()} />}
        <NextCard week={week.data} settings={settings.data} onChanged={onChanged} />
        <StepRow steps={week.data.steps} />
        <Controls week={week.data} settings={settings.data} onChanged={onChanged} />
        <div className="grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
          <Topics week={week.data} onChanged={onChanged} />
          <div className="flex flex-col gap-5">
            <Collectors items={week.data.collectors} />
            <Panel title="What happened last run">
              {week.data.log.length === 0 ? (
                <Empty>Nothing has run yet.</Empty>
              ) : (
                <>
                  <ul className="flex flex-col gap-1.5" aria-label="Last run, in words">
                    {week.data.log.map((l, i) => (
                      <li key={i}>{plainLogLine(l)}</li>
                    ))}
                  </ul>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer py-1 text-on-surface-variant">Show technical log</summary>
                    <pre className="t-value mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-on-surface-variant" tabIndex={0} aria-label="Technical log lines">
                      {week.data.log.join("\n")}
                    </pre>
                  </details>
                </>
              )}
            </Panel>
          </div>
        </div>
      </div>
    );
  }
  if (err) return <InlineError message={err} onRetry={() => void onChanged()} />;
  return <Loading what="this week" />;
}
