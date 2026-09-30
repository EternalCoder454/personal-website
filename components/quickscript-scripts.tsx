"use client";

import { useRef, useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import {
  checkPack,
  checkScript,
  defaultModel,
  MODEL_OPTIONS,
  PROVIDERS,
  providerLabel,
  shortDateTime,
  splitScript,
  TITLE_MAX,
  WORDS_MAX,
  WORDS_MIN,
} from "@/lib/quickscript/logic";
import type { Provider, Recipient, Script } from "@/lib/quickscript/types";
import { ActionStatus, Btn, control, Empty, Field, InlineError, Loading, Panel, useAction, type Resource } from "./quickscript-ui";

const client = pickClient();

function sentLabel(s: Script): string {
  return s.sentTo === "host" ? "Sent to Host" : s.sentTo === "me" ? "Sent to me" : "Not sent";
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className={ok ? "w-12 shrink-0 font-medium text-primary" : "w-12 shrink-0 font-medium text-error"}>{ok ? "Pass" : "Fail"}</span>
      <span>{children}</span>
    </li>
  );
}

function Checks({ script }: { script: Script }) {
  const c = checkScript(script.text);
  return (
    <div className="flex flex-col gap-3">
      {c.flags.length > 0 && (
        <div role="group" aria-label="Numbers not verified" className="border border-error/60 bg-error-container p-3">
          <p className="font-medium text-error">Not verified</p>
          <ul className="mt-1 list-disc pl-5 text-error">
            {c.flags.map((f, i) => (
              <li key={i}>{f.replace(/^[-*]\s*/, "")}</li>
            ))}
          </ul>
        </div>
      )}
      <ul className="flex flex-col gap-1.5" aria-label="Script checks">
        <Check ok={c.wordsOk}>
          Word count {c.words}, range {WORDS_MIN} to {WORDS_MAX}
        </Check>
        <Check ok={c.disclaimerOk}>Disclaimer line at the end</Check>
        <Check ok={c.flags.length === 0}>{c.flags.length === 0 ? "No numbers flagged" : "Numbers flagged NOT VERIFIED"}</Check>
      </ul>
    </div>
  );
}

function ScriptText({ text }: { text: string }) {
  const { body, notes } = splitScript(text);
  const flagged = (l: string) => l.includes("NOT VERIFIED");
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-[68ch] leading-7">
        {body.split("\n").map((l, i) =>
          l.trim() === "" ? null : (
            <p key={i} className={`mb-3 ${flagged(l) ? "border-l-2 border-error pl-3" : ""}`}>
              {l}
            </p>
          ),
        )}
      </div>
      {notes.trim() && (
        <div className="border-t border-outline-variant pt-3 text-sm text-on-surface-variant">
          {notes
            .split("\n")
            .filter((l) => l.trim())
            .map((l, i) => (
              <p key={i} className={flagged(l) ? "font-medium text-error" : ""}>
                {l}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

function Pack({ script }: { script: Script }) {
  const pack = script.pack;
  if (!pack) return null;
  const c = checkPack(pack);
  return (
    <div className="flex flex-col gap-4 border-t border-outline-variant pt-4">
      <h3 className="font-medium">Publish pack</h3>
      <div>
        <p className="mb-1 text-sm text-on-surface-variant">Titles</p>
        <ul className="flex flex-col gap-2">
          {pack.titles.map((t, i) => {
            const r = c.titles[i];
            const ok = r.lengthOk && r.questionOk;
            return (
              <li key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span>{t}</span>
                <span className={`text-sm ${ok ? "text-primary" : "font-medium text-error"}`}>
                  {ok ? "Pass" : "Fail"}, {r.length} of {TITLE_MAX - 1} characters{r.questionOk ? "" : ", no question mark"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-sm text-on-surface-variant">Description</p>
        <p className="whitespace-pre-wrap">{pack.description}</p>
        <p className={`mt-1 text-sm ${c.disclaimerOk ? "text-primary" : "font-medium text-error"}`}>
          {c.disclaimerOk ? "Pass, disclaimer present" : "Fail, disclaimer missing"}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-on-surface-variant">Playlist</p>
          <p>{pack.playlist}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-on-surface-variant">Thumbnail words</p>
          <p className="font-medium tracking-wide">{pack.thumbnailWords.join("  ")}</p>
          <p className={`text-sm ${c.thumbnailOk ? "text-primary" : "font-medium text-error"}`}>
            {c.thumbnailOk ? "Pass" : "Fail"}, {pack.thumbnailWords.length} words, need 3 to 5
          </p>
        </div>
      </div>
    </div>
  );
}

function Detail({
  script,
  draftProvider,
  onChanged,
}: {
  script: Script;
  draftProvider: Provider;
  onChanged: () => Promise<void>;
}) {
  const a = useAction(onChanged);
  const [provider, setProvider] = useState<Provider>(draftProvider);
  const [model, setModel] = useState(defaultModel(draftProvider).model);
  const working = a.busy !== null;
  const approved = script.status !== "Draft";

  const send = (to: Recipient) => {
    if (to === "host" && !window.confirm(`Send this script to the Host?`)) return;
    void a.run(to === "host" ? "Send to Host" : "Send to me", () => client.sendScript(script.slug, to));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(splitScript(script.text).body.trim());
      a.setMessage("Copied the script text");
    } catch {
      a.setMessage("Copy failed, select the text and copy it by hand");
    }
  };

  return (
    <Panel title={script.topic}>
      <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm">
        <dt className="text-on-surface-variant">Status</dt>
        <dd>
          {script.status}, {sentLabel(script).toLowerCase()}
        </dd>
        <dt className="text-on-surface-variant">Tax year</dt>
        <dd>{script.taxYear}</dd>
        <dt className="text-on-surface-variant">Model</dt>
        <dd className="break-all">
          {providerLabel(script.model.provider)}, {script.model.model}
        </dd>
        <dt className="text-on-surface-variant">Drafted</dt>
        <dd>{shortDateTime(script.createdAt)}</dd>
        <dt className="text-on-surface-variant">Sources</dt>
        <dd className="min-w-0">
          {script.sources.map((u, i) => {
            const href = u.split(" ")[0];
            return (
              <span key={i} className="block break-all">
                {/^https?:\/\//.test(href) ? (
                  <a href={href} target="_blank" rel="noreferrer noopener" className="text-primary underline underline-offset-4">
                    {u}
                  </a>
                ) : (
                  u
                )}
              </span>
            );
          })}
        </dd>
      </dl>

      <div className="mb-4">
        <Checks script={script} />
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        <Btn disabled={working} onClick={() => send("me")}>
          Send to me
        </Btn>
        <Btn disabled={working} onClick={() => send("host")}>
          Send to Host
        </Btn>
        <Btn onClick={() => void copy()}>Copy text</Btn>
        {approved && (
          <Btn variant="primary" disabled={working} onClick={() => void a.run("Publish pack", async () => {
            await client.makePack(script.slug);
            return "Publish pack written";
          })}>
            Publish pack
          </Btn>
        )}
      </div>

      {script.status === "Draft" && (
        <div className="mb-2 flex flex-wrap items-end gap-2">
          <Field label="Provider" className="w-36">
            <select
              className={control}
              value={provider}
              onChange={(e) => {
                const p = e.target.value as Provider;
                setProvider(p);
                setModel(defaultModel(p).model);
              }}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Model id" className="min-w-0 flex-1 basis-56">
            <input className={control} list="redraft-models" value={model} onChange={(e) => setModel(e.target.value)} />
            <datalist id="redraft-models">
              {MODEL_OPTIONS[provider].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
          <Btn disabled={working} onClick={() => void a.run("Redraft", () => client.redraft(script.slug, { provider, model }))}>
            Redraft
          </Btn>
        </div>
      )}

      <div className="mb-4">
        <ActionStatus busy={a.busy} message={a.message} error={a.error} />
      </div>

      <ScriptText text={script.text} />
      <Pack script={script} />
    </Panel>
  );
}

export function ScriptsView({
  scripts,
  draftProvider,
  onChanged,
}: {
  scripts: Resource<Script[]>;
  draftProvider: Provider;
  onChanged: () => Promise<void>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  if (!scripts.data) {
    return scripts.error ? <InlineError message={scripts.error} onRetry={() => void onChanged()} /> : <Loading what="scripts" />;
  }
  const list = scripts.data;
  if (list.length === 0) {
    return <Empty>No drafts this week. Run Weekly run or Draft top on the This week tab.</Empty>;
  }
  const selected = list.find((s) => s.slug === slug) ?? list[0];

  return (
    <div className="flex flex-col gap-5">
    {scripts.error && <InlineError message={scripts.error} onRetry={() => void onChanged()} />}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
      <Panel title="Drafts this week">
        <ul className="flex flex-col gap-1" aria-label="Drafts this week">
          {list.map((s) => {
            const on = s.slug === selected.slug;
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  aria-current={on ? "true" : undefined}
                  onClick={() => {
                    setSlug(s.slug);
                    detailRef.current?.focus();
                    detailRef.current?.scrollIntoView({ block: "start" });
                  }}
                  className={`flex min-h-11 w-full flex-col items-start gap-0.5 border px-3 py-2 text-left ${
                    on ? "border-primary bg-surface-container" : "border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  <span>{s.topic}</span>
                  <span className="text-sm text-on-surface-variant">
                    {s.status}, {sentLabel(s).toLowerCase()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
      <div ref={detailRef} tabIndex={-1} className="min-w-0 outline-none" aria-label="Selected script">
        <Detail key={selected.slug} script={selected} draftProvider={draftProvider} onChanged={onChanged} />
      </div>
    </div>
    </div>
  );
}
