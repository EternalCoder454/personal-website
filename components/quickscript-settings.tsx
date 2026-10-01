"use client";

import { useId, useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { defaultModel, HOW_CHOSEN_STEPS, MIN_STRENGTH_LABEL, MODEL_OPTIONS, nextRun, nextRunLabel, PROVIDERS, plainSource, seasonFor, TASKS, taxYearFor, WEEKDAYS } from "@/lib/quickscript/logic";
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
      setError("Add the Host's email, so the weekly scripts have somewhere to go");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(s.automatic.sendTo.trim())) {
      setError("The address the weekly scripts go to is not valid. Check the spelling and try saving again");
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
      setError("Every task under More options, AI models, needs a model id");
      return;
    }
    if (s.taxYearOverride !== 0 && (!Number.isInteger(s.taxYearOverride) || s.taxYearOverride < 2000 || s.taxYearOverride > 2100)) {
      setError("The fixed tax year is not valid. Use a year such as 2026, or set it back to automatic");
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

  const now = new Date();
  const year = taxYearFor(now, s.taxYearOverride);
  const inSeason = seasonFor(now, s.seasonOverride) === "inseason";
  // The weekly scripts go to the Host unless someone chose another address
  // under More options: keep the two together while they match.
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const setHost = (v: string) =>
    edit((d) => {
      const followsHost = d.automatic.sendTo.trim() === "" || same(d.automatic.sendTo, d.people.hostEmail);
      d.people.hostEmail = v;
      if (followsHost) d.automatic.sendTo = v.trim();
    });
  const sendsElsewhere = s.automatic.sendTo.trim() !== "" && !same(s.automatic.sendTo, s.people.hostEmail);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Panel title="Emails">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="The Host's email (gets the scripts)">
            <input type="email" className={control} value={s.people.hostEmail} onChange={(e) => setHost(e.target.value)} />
          </Field>
          <Field label="Your email (for test copies)">
            <input type="email" className={control} value={s.people.testRecipient} onChange={(e) => edit((d) => void (d.people.testRecipient = e.target.value))} />
          </Field>
        </div>
        {sendsElsewhere && (
          <p className="mt-3 text-on-surface-variant">The weekly scripts go to {s.automatic.sendTo.trim()} instead, as set under More options.</p>
        )}
      </Panel>

      <Panel title="Every week">
        <div className="flex flex-col gap-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-[var(--color-primary)]"
              checked={s.automatic.enabled}
              onChange={(e) => edit((d) => void (d.automatic.enabled = e.target.checked))}
            />
            Make the scripts and email them by itself
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Day">
              <select className={control} value={s.schedule.day} onChange={(e) => edit((d) => void (d.schedule.day = Number(e.target.value)))}>
                {WEEKDAYS.map((w, i) => (
                  <option key={w} value={i}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time">
              <input type="time" className={control} value={s.schedule.time} onChange={(e) => edit((d) => void (d.schedule.time = e.target.value))} />
            </Field>
          </div>
          <p className="text-on-surface-variant">Next time: {nextRunLabel(nextRun(now, s.schedule))}</p>
        </div>
      </Panel>

      <Panel title="Set by the date">
        <p className="text-on-surface-variant">Nothing to fill in here. QuickScript works these out from today&apos;s date.</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
          <dt className="text-on-surface-variant">Tax year</dt>
          <dd>
            {year}
            <span className="block text-sm text-on-surface-variant">
              {s.taxYearOverride
                ? "Fixed under More options."
                : "Until April 15 it uses last year, the return people are filing. After that, this year."}
            </span>
          </dd>
          <dt className="text-on-surface-variant">Tax season</dt>
          <dd>
            {inSeason ? "Yes, it is tax season" : "No, not tax season"}
            <span className="block text-sm text-on-surface-variant">
              {s.seasonOverride === "auto"
                ? "January 15 to April 15. In tax season it sends 1 script a week."
                : "Fixed under More options."}
            </span>
          </dd>
        </dl>
      </Panel>

      {needsAttention && (
        <p role="status" className="font-medium text-error">
          {missingKeys.length > 0 && `Key not set on the server: ${missingKeys.join(", ")}. Whoever runs the server must set it. `}
          {emptyModel && "A model id is empty. Fill it in under More options. "}
          Details are under More options.
        </p>
      )}

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

      <details open={advOpen ?? needsAttention} onToggle={(e) => setAdvOpen(e.currentTarget.open)} className="bg-surface-low">
        <summary className="cursor-pointer px-4 py-4 text-lg font-medium sm:px-6">More options</summary>
        <div className="flex flex-col gap-6 p-4 pt-1 sm:p-6 sm:pt-0">
          <p className="text-on-surface-variant">The defaults work. Change these only if you know you need to, then press Save settings above.</p>

          <Panel title="Which scripts get sent" inset>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Weekly scripts go to">
                  <input type="email" className={control} value={s.automatic.sendTo} onChange={(e) => edit((d) => void (d.automatic.sendTo = e.target.value))} />
                </Field>
                <Field label="Most scripts a week (outside tax season)">
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
                <Field label="Topics good enough to send">
                  <select className={control} value={s.automatic.minStrength} onChange={(e) => edit((d) => void (d.automatic.minStrength = e.target.value as MinStrength))}>
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
              <div>
                <h3 className="font-medium">How scripts are picked</h3>
                <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 leading-7">
                  {HOW_CHOSEN_STEPS.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </div>
            </div>
          </Panel>

          <Panel title="Tax year and season" inset>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tax year">
                <select
                  className={control}
                  value={s.taxYearOverride !== 0 ? "fixed" : "auto"}
                  onChange={(e) => edit((d) => void (d.taxYearOverride = e.target.value === "auto" ? 0 : taxYearFor(now, 0)))}
                >
                  <option value="auto">Automatic ({taxYearFor(now, 0)} today)</option>
                  <option value="fixed">A fixed year</option>
                </select>
              </Field>
              {s.taxYearOverride !== 0 && (
                <Field label="Fixed tax year">
                  <input
                    type="number"
                    inputMode="numeric"
                    className={control}
                    value={Number.isNaN(s.taxYearOverride) ? "" : s.taxYearOverride}
                    onChange={(e) => edit((d) => void (d.taxYearOverride = e.target.value === "" ? NaN : Number(e.target.value)))}
                  />
                </Field>
              )}
              <Field label="Tax season" className="sm:col-span-2">
                <select className={control} value={s.seasonOverride} onChange={(e) => edit((d) => void (d.seasonOverride = e.target.value as SeasonSetting))}>
                  <option value="auto">Automatic (January 15 to April 15)</option>
                  <option value="evergreen">Never tax season</option>
                  <option value="inseason">Always tax season</option>
                </select>
              </Field>
            </div>
          </Panel>

          <Panel title="Other people" inset>
            <Field label="The Clipper's email" className="sm:max-w-sm">
              <input type="email" className={control} value={s.people.clipperEmail} onChange={(e) => edit((d) => void (d.people.clipperEmail = e.target.value))} />
            </Field>
          </Panel>

          <Panel title="What to search for" inset>
            <div className="flex flex-col gap-6">
              <ChipList label="Words to search for" words={s.seedWords} onChange={(w) => edit((d) => void (d.seedWords = w))} />
              <ChipList label="Words that move a topic down, too specialised for this channel" words={s.highEndWords} onChange={(w) => edit((d) => void (d.highEndWords = w))} />
            </div>
          </Panel>

          <Panel title="Where topics come from" inset>
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

          <Panel title="AI models" inset>
            <div className="flex flex-col gap-4">
              {TASKS.map((t) => (
                <fieldset key={t.id} className="grid gap-3 md:grid-cols-[9rem_16rem_1fr] md:items-end">
                  <legend className="sr-only">{t.label}</legend>
                  <p className="font-medium md:pb-3" aria-hidden="true">
                    {t.label}
                  </p>
                  <Field label={`${t.label}, which AI`}>
                    <select className={control} value={s.models[t.id].provider} onChange={(e) => edit((d) => void (d.models[t.id] = defaultModel(e.target.value as Provider)))}>
                      {PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`${t.label}, model id`}>
                    <input className={control} list={`models-${t.id}`} value={s.models[t.id].model} onChange={(e) => edit((d) => void (d.models[t.id].model = e.target.value))} />
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

