"use client";

import { useId, useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { defaultModel, HOW_CHOSEN_STEPS, MIN_STRENGTH_LABEL, MODEL_OPTIONS, nextRun, nextRunLabel, PROVIDERS, plainSource, TASKS, WEEKDAYS } from "@/lib/quickscript/logic";
import type { KeyStatus, MinStrength, Provider, SeasonSetting, Settings } from "@/lib/quickscript/types";
import { Btn, control, errorText, Field, InlineError, Loading, Panel, type Resource } from "./quickscript-ui";

const client = pickClient();

function ChipList({
  label,
  words,
  onChange,
}: {
  label: string;
  words: string[];
  onChange: (w: string[]) => void;
}) {
  const [text, setText] = useState("");
  const id = useId();
  const add = () => {
    const w = text.trim();
    if (w && !words.some((x) => x.toLowerCase() === w.toLowerCase())) onChange([...words, w]);
    setText("");
  };
  return (
    <div className="flex flex-col gap-2">
      <p id={id} className="text-sm text-on-surface-variant">
        {label}
      </p>
      <ul aria-labelledby={id} className="flex flex-wrap gap-2">
        {words.map((w) => (
          <li key={w} className="flex items-center border border-outline bg-surface-lowest">
            <span className="px-3 py-1">{w}</span>
            <button
              type="button"
              aria-label={`Remove ${w}`}
              onClick={() => onChange(words.filter((x) => x !== w))}
              className="flex min-h-9 min-w-9 items-center justify-center border-l border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
        {words.length === 0 && <li className="text-on-surface-muted">None</li>}
      </ul>
      <div className="flex gap-2">
        <input
          className={control}
          aria-label={`Add to ${label}`}
          placeholder="Add a word"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Btn onClick={add} aria-label={`Add to ${label}`}>
          Add
        </Btn>
      </div>
    </div>
  );
}

function Keys({ keys }: { keys: Resource<KeyStatus> }) {
  const rows: { name: keyof KeyStatus; label: string }[] = [
    { name: "GEMINI_API_KEY", label: "Gemini (free tier)" },
    { name: "ANTHROPIC_API_KEY", label: "Claude (best writing, paid)" },
  ];
  return (
    <Panel title="API keys" inset>
      <p className="mb-3 text-on-surface-variant">Set on the server by whoever runs it. They cannot be changed here.</p>
      {keys.data ? (
        <dl className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.name} className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
              <dt className="min-w-0">
                {r.label} <span className="t-value text-on-surface-variant">{r.name}</span>
              </dt>
              <dd className={keys.data![r.name] ? "text-primary" : "font-medium text-error"}>{keys.data![r.name] ? "Set" : "Not set, this tool will not work"}</dd>
            </div>
          ))}
        </dl>
      ) : keys.error ? (
        <InlineError message={keys.error} onRetry={() => void keys.reload()} />
      ) : (
        <Loading what="key status" />
      )}
    </Panel>
  );
}

function Form({ initial, keys, onSaved }: { initial: Settings; keys: Resource<KeyStatus>; onSaved: (s: Settings) => void }) {
  const [s, setS] = useState<Settings>(() => structuredClone(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // null until the person opens or closes it: then their choice wins.
  const [advOpen, setAdvOpen] = useState<boolean | null>(null);
  const keyRows: { name: keyof KeyStatus; label: string }[] = [
    { name: "GEMINI_API_KEY", label: "Gemini (free tier)" },
    { name: "ANTHROPIC_API_KEY", label: "Claude (best writing, paid)" },
  ];
  const missingKeys = keys.data ? keyRows.filter((k) => !keys.data![k.name]).map((k) => k.label) : [];
  const emptyModel = TASKS.some((t) => s.models[t.id].model.trim() === "");
  const needsAttention = missingKeys.length > 0 || emptyModel;

  const edit = (fn: (draft: Settings) => void) => {
    setS((cur) => {
      const next = structuredClone(cur);
      fn(next);
      return next;
    });
    setSaved(false);
  };

  const save = async () => {
    setError(null);
    const emails = Object.values(s.people);
    if (!s.automatic.sendTo.trim()) {
      setError("Automatic sending needs a send-to address");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(s.automatic.sendTo.trim())) {
      setError("The send-to address is not valid. Check the spelling and try saving again");
      return;
    }
    if (!Number.isInteger(s.automatic.maxScripts) || s.automatic.maxScripts < 1 || s.automatic.maxScripts > 5) {
      setError("Scripts per run must be a whole number from 1 to 5");
      return;
    }
    if (emails.some((e) => e.trim() !== "" && !/^\S+@\S+\.\S+$/.test(e.trim()))) {
      setError("An email address is not valid. Check the spelling and try saving again");
      return;
    }
    if (TASKS.some((t) => s.models[t.id].model.trim() === "")) {
      setError("Every task under Advanced needs a model id");
      return;
    }
    if (!Number.isInteger(s.taxYear) || s.taxYear < 2000 || s.taxYear > 2100) {
      setError("Tax year is not valid. Use a year such as 2026");
      return;
    }
    // Where scripts go with nobody watching: say it back before it changes.
    const to = s.automatic.sendTo.trim();
    const turningOn = s.automatic.enabled && !initial.automatic.enabled;
    const newAddress = s.automatic.enabled && to !== initial.automatic.sendTo.trim();
    if ((turningOn || newAddress) && !window.confirm(`From the next run, QuickScript will email up to ${s.automatic.maxScripts} scripts every week to ${to} without asking. Save?`)) {
      return;
    }
    setBusy(true);
    try {
      const out = await client.saveSettings({ ...s, automatic: { ...s.automatic, sendTo: to } });
      setS(structuredClone(out));
      onSaved(out);
      setSaved(true);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-medium">Everyday</h2>
      <Panel title="Automatic sending">
        <div className="flex flex-col gap-6">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-[var(--color-primary)]"
              checked={s.automatic.enabled}
              onChange={(e) => edit((d) => void (d.automatic.enabled = e.target.checked))}
            />
            Send the strongest scripts by itself on each run
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Send to">
              <input
                type="email"
                required
                className={control}
                value={s.automatic.sendTo}
                onChange={(e) => edit((d) => void (d.automatic.sendTo = e.target.value))}
              />
            </Field>
            <Field label="Scripts per run">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={5}
                className={control}
                value={Number.isNaN(s.automatic.maxScripts) ? "" : s.automatic.maxScripts}
                onChange={(e) => edit((d) => void (d.automatic.maxScripts = e.target.value === "" ? NaN : Number(e.target.value)))}
              />
            </Field>
            <Field label="Topic strength">
              <select
                className={control}
                value={s.automatic.minStrength}
                onChange={(e) => edit((d) => void (d.automatic.minStrength = e.target.value as MinStrength))}
              >
                {(Object.keys(MIN_STRENGTH_LABEL) as MinStrength[]).map((m) => (
                  <option key={m} value={m}>
                    {MIN_STRENGTH_LABEL[m]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-3 size-5 shrink-0 accent-[var(--color-primary)]"
              checked={s.automatic.onlyIfChecksPass}
              onChange={(e) => edit((d) => void (d.automatic.onlyIfChecksPass = e.target.checked))}
            />
            <span className="pt-3">Only send scripts that pass every check (length, disclaimer, no unchecked numbers)</span>
          </label>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            <dt className="text-on-surface-variant">Next run</dt>
            <dd>{nextRunLabel(nextRun(new Date(), s.schedule))}, set under Schedule below</dd>
          </dl>
          <div className="border-t border-outline-variant pt-4">
            <h3 className="font-medium">How scripts are picked</h3>
            <ol className="mt-2 flex max-w-3xl list-decimal flex-col gap-2 pl-5 leading-7">
              {HOW_CHOSEN_STEPS.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
        </div>
      </Panel>
      <Panel title="Seed words and words that move a topic down">
        <div className="flex flex-col gap-6">
          <ChipList label="Seed words, what to search for" words={s.seedWords} onChange={(w) => edit((d) => void (d.seedWords = w))} />
          <ChipList label="Words that move a topic down, too specialised for this channel" words={s.highEndWords} onChange={(w) => edit((d) => void (d.highEndWords = w))} />
        </div>
      </Panel>

      <Panel title="Where topics come from">
        <ul className="divide-y divide-outline-variant border-y border-outline-variant">
          {s.sources.map((src, i) => (
            <li key={src.id}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]"
                  checked={src.enabled}
                  onChange={(e) => edit((d) => void (d.sources[i].enabled = e.target.checked))}
                />
                <span>
                  {plainSource(src.name)}
                  {src.reason && <span className="block text-sm text-on-surface-variant">Off. {src.reason}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="People and their emails">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Host's email">
            <input type="email" className={control} value={s.people.hostEmail} onChange={(e) => edit((d) => void (d.people.hostEmail = e.target.value))} />
          </Field>
          <Field label="Your email, used for Me (a test)">
            <input type="email" className={control} value={s.people.testRecipient} onChange={(e) => edit((d) => void (d.people.testRecipient = e.target.value))} />
          </Field>
          <Field label="Clipper's email">
            <input type="email" className={control} value={s.people.clipperEmail} onChange={(e) => edit((d) => void (d.people.clipperEmail = e.target.value))} />
          </Field>
        </div>
      </Panel>

      <Panel title="Schedule, season and tax year">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Runs by itself on">
            <select className={control} value={s.schedule.day} onChange={(e) => edit((d) => void (d.schedule.day = Number(e.target.value)))}>
              {WEEKDAYS.map((w, i) => (
                <option key={w} value={i}>
                  {w}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Runs by itself at">
            <input
              type="time"
              className={control}
              value={s.schedule.time}
              onChange={(e) => edit((d) => void (d.schedule.time = e.target.value))}
            />
          </Field>
          <Field label="Tax year">
            <input
              type="number"
              inputMode="numeric"
              className={control}
              value={Number.isNaN(s.taxYear) ? "" : s.taxYear}
              onChange={(e) => edit((d) => void (d.taxYear = e.target.value === "" ? NaN : Number(e.target.value)))}
            />
          </Field>
          <Field label="Season" className="sm:col-span-2 lg:col-span-3">
            <select
              className={control}
              value={s.seasonOverride}
              onChange={(e) => edit((d) => void (d.seasonOverride = e.target.value as SeasonSetting))}
            >
              <option value="auto">Automatic (Jan 15 to Apr 15)</option>
              <option value="evergreen">Always off season</option>
              <option value="inseason">Always tax season</option>
            </select>
          </Field>
        </div>
      </Panel>

      {needsAttention && (
        <p role="status" className="font-medium text-error">
          {missingKeys.length > 0 && `Key not set on the server: ${missingKeys.join(", ")}. Whoever runs the server must set it. `}
          {emptyModel && "A model id is empty. Fill it in under Advanced. "}
          Details are under Advanced.
        </p>
      )}
      <details
        open={advOpen ?? needsAttention}
        onToggle={(e) => setAdvOpen(e.currentTarget.open)}
        className="bg-surface-low"
      >
        <summary className="cursor-pointer px-4 py-4 text-xl font-medium sm:px-6">Advanced: models and keys</summary>
        <div className="flex flex-col gap-6 p-4 pt-1 sm:p-6 sm:pt-0">
      <Panel title="Models" inset>
        <div className="flex flex-col gap-4">
          {TASKS.map((t) => (
            <fieldset key={t.id} className="grid gap-3 sm:grid-cols-[12rem_10rem_1fr] sm:items-end">
              <legend className="sr-only">{t.label}</legend>
              <p className="font-medium sm:pb-3" aria-hidden="true">
                {t.label}
              </p>
              <Field label={`${t.label}, which AI`}>
                <select
                  className={control}
                  value={s.models[t.id].provider}
                  onChange={(e) => edit((d) => void (d.models[t.id] = defaultModel(e.target.value as Provider)))}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`${t.label}, model id`}>
                <input
                  className={control}
                  list={`models-${t.id}`}
                  value={s.models[t.id].model}
                  onChange={(e) => edit((d) => void (d.models[t.id].model = e.target.value))}
                />
                <datalist id={`models-${t.id}`}>
                  {MODEL_OPTIONS[s.models[t.id].provider].map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Field>
            </fieldset>
          ))}
        </div>
      </Panel>


          <Keys keys={keys} />
        </div>
      </details>

      <div className="flex flex-col gap-3">
        <div>
          <Btn variant="primary" disabled={busy} onClick={() => void save()}>
            Save settings
          </Btn>
        </div>
        <div role="status" aria-live="polite" className="text-sm text-on-surface-variant">
          {busy ? "Saving" : saved ? "Settings saved" : ""}
        </div>
        {error && <InlineError message={error} />}
      </div>
    </div>
  );
}

export function SettingsView({
  settings,
  keys,
}: {
  settings: Resource<Settings>;
  keys: Resource<KeyStatus>;
}) {
  if (!settings.data) {
    return settings.error ? <InlineError message={settings.error} onRetry={() => void settings.reload()} /> : <Loading what="settings" />;
  }
  return <Form initial={settings.data} keys={keys} onSaved={settings.set} />;
}

