"use client";

import { useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { longDay, nextRun, seasonFor, shortDate, shortDateTime, timeLabel, WEEKDAYS } from "@/lib/quickscript/logic";
import type { CollectorStatus, PipelineStep, RankedTopic, Recipient, Settings, WeekState } from "@/lib/quickscript/types";
import { ActionStatus, Btn, control, Empty, Field, InlineError, Loading, Panel, useAction, type Resource } from "./quickscript-ui";

const client = pickClient();

const STATE_LABEL: Record<CollectorStatus["state"], string> = {
  ok: "OK",
  failed: "Failed",
  cached: "Cached",
  off: "Off",
};

function StepRow({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="grid grid-cols-2 gap-px border border-outline-variant bg-outline-variant sm:grid-cols-4 lg:grid-cols-8">
      {steps.map((s) => (
        <li key={s.key} className="flex flex-col gap-0.5 bg-surface-low px-3 py-2.5">
          <span className="font-medium">{s.label}</span>
          <span className={s.state === "todo" ? "text-sm text-on-surface-muted" : "text-sm text-primary"}>
            {s.state === "done" ? "Done" : s.state === "partial" ? s.detail : "Not yet"}
          </span>
          <span className="text-xs text-on-surface-muted">{s.who}</span>
        </li>
      ))}
    </ol>
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

  const okToHost = (what: string) => to !== "host" || window.confirm(`${what} to the Host (${settings.people.hostEmail})?`);

  const now = new Date();
  const season = seasonFor(now, settings.seasonOverride);
  const next = nextRun(now, settings.schedule);

  return (
    <Panel title="Run">
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Btn
              variant="primary"
              disabled={working}
              onClick={() => {
                if (!dryRun && !okToHost("Run the week and send drafts")) return;
                void a.run("Weekly run", () => client.runWeekly({ dryRun, to }));
              }}
            >
              Weekly run
            </Btn>
            <label className="flex min-h-11 items-center gap-2">
              <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
              Dry run
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Field label="Send to" className="w-40">
              <select className={control} value={to} onChange={(e) => setTo(e.target.value as Recipient)}>
                <option value="me">To me</option>
                <option value="host">To Host</option>
              </select>
            </Field>
            <Btn
              disabled={working}
              onClick={() => {
                if (!okToHost("Send drafts")) return;
                void a.run("Send drafts", () => client.sendDrafts({ to }));
              }}
            >
              Send drafts
            </Btn>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Btn disabled={working} onClick={() => void a.run("Find topics", () => client.findTopics())}>
              Find topics
            </Btn>
            <Field label="Drafts" className="w-24">
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
            <Btn disabled={working} onClick={() => void a.run("Draft top", () => client.draft({ count }))}>
              {`Draft top ${count}`}
            </Btn>
          </div>

          <div>
            {week.driveReady ? (
              <Btn disabled>Set up Drive: done</Btn>
            ) : (
              <Btn disabled={working} onClick={() => void a.run("Set up Drive", () => client.setupDrive())}>
                Set up Drive
              </Btn>
            )}
          </div>
        </div>

        <dl className="grid content-start grid-cols-[auto_1fr] gap-x-5 gap-y-2">
          <dt className="text-on-surface-variant">Week of</dt>
          <dd>{shortDate(week.weekOf)}</dd>
          <dt className="text-on-surface-variant">Season</dt>
          <dd>
            {season === "inseason" ? "In season" : "Evergreen"}
            {settings.seasonOverride === "auto" ? ", from the date" : ", set in Settings"}
          </dd>
          <dt className="text-on-surface-variant">Next run</dt>
          <dd>
            {longDay(next)}, {timeLabel(settings.schedule.time)}
          </dd>
          <dt className="text-on-surface-variant">Tax year</dt>
          <dd>{settings.taxYear}</dd>
          <dt className="text-on-surface-variant">Schedule</dt>
          <dd>
            {WEEKDAYS[settings.schedule.day]}, {timeLabel(settings.schedule.time)}
          </dd>
        </dl>
      </div>
      <div className="mt-4">
        <ActionStatus busy={a.busy} message={a.message} error={a.error} />
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
      title="Ranked topics"
      actions={
        <Btn
          variant="primary"
          disabled={a.busy !== null || chosen.length === 0}
          onClick={() => void a.run("Draft selected", () => client.draft({ topicIds: chosen.map((t) => t.id) }))}
        >
          Draft selected
        </Btn>
      }
    >
      {week.topics.length === 0 ? (
        <Empty>No topics yet. Run Find topics.</Empty>
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
                    <span>{t.sources.join(", ")}</span>
                    {t.deadlineBoost && <span className="text-primary">Deadline boost</span>}
                    {t.highEndDemoted && <span>High-end demoted</span>}
                    {t.drafted && <span>Drafted</span>}
                  </span>
                </span>
                <span className="t-value shrink-0 pt-0.5 text-on-surface">{t.score.toFixed(1)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        <ActionStatus busy={a.busy} message={a.message} error={a.error} />
      </div>
    </Panel>
  );
}

function Collectors({ items }: { items: CollectorStatus[] }) {
  return (
    <Panel title="Collectors">
      <ul className="divide-y divide-outline-variant border-y border-outline-variant">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-0.5 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span>{c.name}</span>
              <span className={c.state === "failed" ? "font-medium text-error" : c.state === "off" ? "text-on-surface-muted" : "text-on-surface"}>
                {STATE_LABEL[c.state]}
              </span>
            </div>
            <span className="text-sm text-on-surface-variant">
              {c.lastRun ? `Last run ${shortDateTime(c.lastRun)}` : "Never run"}
              {c.note ? `. ${c.note}` : ""}
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
        <StepRow steps={week.data.steps} />
        <Controls week={week.data} settings={settings.data} onChanged={onChanged} />
        <div className="grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
          <Topics week={week.data} onChanged={onChanged} />
          <div className="flex flex-col gap-5">
            <Collectors items={week.data.collectors} />
            <Panel title="Last run log">
              {week.data.log.length === 0 ? (
                <Empty>No run yet.</Empty>
              ) : (
                <pre className="t-value max-h-72 overflow-auto whitespace-pre-wrap break-words text-on-surface-variant" tabIndex={0} aria-label="Last run log lines">
                  {week.data.log.join("\n")}
                </pre>
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
