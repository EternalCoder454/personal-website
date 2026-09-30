"use client";

import { useRef, useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import {
  checkPack,
  checkScript,
  DISCLAIMER,
  defaultModel,
  MODEL_OPTIONS,
  PROVIDERS,
  providerLabel,
  shortDateTime,
  splitScript,
  STATUS_INFO,
  TITLE_MAX,
  WORDS_MAX,
  WORDS_MIN,
} from "@/lib/quickscript/logic";
import type { Provider, Recipient, Script } from "@/lib/quickscript/types";
import { ActionStatus, Btn, NO_HOST_EMAIL, control, Empty, Field, InlineError, Loading, Panel, useAction, type Resource } from "./quickscript-ui";

const client = pickClient();

function sentLabel(s: Script): string {
  return s.sentTo === "host" ? "Emailed to the Host" : s.sentTo === "me" ? "Emailed to you as a test" : "Not emailed yet";
}

/** What happens next for this script, in one sentence. */
function nextFor(s: Script): string {
  if (s.status === "Draft") {
    if (s.sentTo === "host") return "Next: the Host reads it and replies Approved";
    if (s.sentTo === "me") return "Next: send it to the Host. The Host reads it and replies Approved";
    return "Next: send it to the Host (or to yourself as a test first). The Host reads it and replies Approved";
  }
  const after: Record<Exclude<Script["status"], "Draft">, string> = {
    Approved: "Next: make the publish pack below. Then the Host records the video",
    Recorded: "Next: the Producer edits the video",
    Edited: "Next: the Producer schedules the upload on YouTube",
    Scheduled: "Next: the Clipper cuts clips from the video",
    Clipped: "Next: the Clipper uses the clips in Meta Ads",
    "In Meta Ads": "Nothing left to do. The clips are running in Meta Ads",
  };
  return after[s.status];
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className={ok ? "w-14 shrink-0 font-medium text-primary" : "w-14 shrink-0 font-medium text-error"}>{ok ? "OK" : "Check"}</span>
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
          <p className="font-medium text-error">Numbers to check</p>
          <ul className="mt-1 list-disc pl-5 text-error">
            {c.flags.map((f, i) => (
              <li key={i}>{f.replace(/^[-*]\s*/, "")}</li>
            ))}
          </ul>
        </div>
      )}
      <ul className="flex flex-col gap-1.5" aria-label="Script checks">
        <Check ok={c.wordsOk}>
          {c.wordsOk
            ? `Length is good: ${c.words} words (${WORDS_MIN} to ${WORDS_MAX})`
            : `Length is off: ${c.words} words. It should be ${WORDS_MIN} to ${WORDS_MAX}. Write it again, or edit it by hand.`}
        </Check>
        <Check ok={c.disclaimerOk}>
          {c.disclaimerOk
            ? "Disclaimer is at the end"
            : `Disclaimer is missing from the end. Add the line "${DISCLAIMER}" before approving.`}
        </Check>
        <Check ok={c.flags.length === 0}>
          {c.flags.length === 0
            ? "Every number was found in the IRS text"
            : `${c.flags.length} ${c.flags.length === 1 ? "number needs" : "numbers need"} checking: ${c.flags.length === 1 ? "it was" : "they were"} not found in the IRS text. Check ${c.flags.length === 1 ? "it" : "them"} on IRS.gov before approving.`}
        </Check>
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
      <h3 className="font-medium">YouTube publish pack</h3>
      <div>
        <p className="mb-1 text-sm text-on-surface-variant">Title choices</p>
        <ul className="flex flex-col gap-2">
          {pack.titles.map((t, i) => {
            const r = c.titles[i];
            const ok = r.lengthOk && r.questionOk;
            return (
              <li key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span>{t}</span>
                <span className={`text-sm ${ok ? "text-primary" : "font-medium text-error"}`}>
                  {ok
                    ? `Title is good: ${r.length} characters (under ${TITLE_MAX}), asks a question`
                    : `Title needs a fix: ${[
                        r.lengthOk ? "" : `it is ${r.length} characters and needs to be under ${TITLE_MAX} characters`,
                        r.questionOk ? "" : "it should end with a question mark",
                      ]
                        .filter(Boolean)
                        .join(", and ")}`}
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
          {c.disclaimerOk ? "Disclaimer is in the description" : "Disclaimer is missing from the description. Add it before using this"}
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
            {c.thumbnailOk ? "Thumbnail is good" : "Thumbnail needs a fix"}: {pack.thumbnailWords.length} words (3 to 5 works best)
          </p>
        </div>
      </div>
    </div>
  );
}

function Detail({
  script,
  draftProvider,
  hostEmail,
  onChanged,
}: {
  script: Script;
  draftProvider: Provider;
  hostEmail: string;
  onChanged: () => Promise<void>;
}) {
  const a = useAction(onChanged);
  const [provider, setProvider] = useState<Provider>(draftProvider);
  const [model, setModel] = useState(defaultModel(draftProvider).model);
  const working = a.busy !== null;
  const approved = script.status !== "Draft";

  const send = (to: Recipient) => {
    if (to === "host" && !hostEmail.trim()) return a.fail(NO_HOST_EMAIL);
    if (to === "host" && !window.confirm(`Email this script to the Host (${hostEmail})? They will receive the email now.`)) return;
    void a.run(to === "host" ? "Sending to the Host" : "Sending to you", () => client.sendScript(script.slug, to), "Could not send the script");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(splitScript(script.text).body.trim());
      a.say("Copied the script text. You can paste it anywhere");
    } catch {
      a.say("Could not copy. Select the text below and copy it by hand");
    }
  };

  return (
    <Panel title={script.topic}>
      <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm">
        <dt className="text-on-surface-variant">Status</dt>
        <dd>
          {STATUS_INFO[script.status].label}. {sentLabel(script)}
        </dd>
        <dt className="text-on-surface-variant">Tax year</dt>
        <dd>{script.taxYear}</dd>
        <dt className="text-on-surface-variant">Written by</dt>
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

      <p className="mb-3 font-medium">{nextFor(script)}</p>

      <div className="mb-2 flex flex-wrap gap-2">
        <Btn disabled={working} onClick={() => send("me")}>
          Send to me (a test)
        </Btn>
        <Btn disabled={working} onClick={() => send("host")}>
          Send to the Host
        </Btn>
        <Btn onClick={() => void copy()}>Copy the script</Btn>
        {approved && (
          <Btn variant="primary" disabled={working} onClick={() => void a.run("Making the publish pack", async () => {
            await client.makePack(script.slug);
            return "The publish pack is ready. Its titles, description and thumbnail words are below the script.";
          }, "Could not make the publish pack")}>
            Make the publish pack
          </Btn>
        )}
      </div>

      {script.status === "Draft" && (
        <div className="mb-2 flex flex-wrap items-end gap-2">
          <Field label="Write it again with" className="w-full sm:w-64">
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
          <Field label="Model id (advanced)" className="min-w-0 flex-1 basis-56">
            <input className={control} list="redraft-models" value={model} onChange={(e) => setModel(e.target.value)} />
            <datalist id="redraft-models">
              {MODEL_OPTIONS[provider].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
          <Btn disabled={working} onClick={() => void a.run("Writing the script again", () => client.redraft(script.slug, { provider, model }), "Could not write the script again")}>
            Write it again
          </Btn>
        </div>
      )}

      <div className="mb-4">
        <ActionStatus busy={a.busy} message={a.message} detail={a.detail} error={a.error} />
      </div>

      <ScriptText text={script.text} />
      <Pack script={script} />
    </Panel>
  );
}

export function ScriptsView({
  scripts,
  draftProvider,
  hostEmail,
  onChanged,
}: {
  scripts: Resource<Script[]>;
  draftProvider: Provider;
  hostEmail: string;
  onChanged: () => Promise<void>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  if (!scripts.data) {
    return scripts.error ? <InlineError message={scripts.error} onRetry={() => void onChanged()} /> : <Loading what="scripts" />;
  }
  const list = scripts.data;
  if (list.length === 0) {
    return <Empty>No scripts this week yet. Use What to do now on the This week tab.</Empty>;
  }
  const selected = list.find((s) => s.slug === slug) ?? list[0];

  return (
    <div className="flex flex-col gap-5">
    {scripts.error && <InlineError message={scripts.error} onRetry={() => void onChanged()} />}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
      <Panel title="Scripts this week">
        <ul className="flex flex-col gap-1" aria-label="Scripts this week">
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
                    {STATUS_INFO[s.status].label}. {sentLabel(s)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
      <div ref={detailRef} tabIndex={-1} className="min-w-0 outline-none" aria-label="Selected script">
        <Detail key={selected.slug} script={selected} draftProvider={draftProvider} hostEmail={hostEmail} onChanged={onChanged} />
      </div>
    </div>
    </div>
  );
}
