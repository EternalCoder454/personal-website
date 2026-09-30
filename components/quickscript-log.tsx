"use client";

import { useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { roleLabel, roleName, STATUS_INFO, whenLabel } from "@/lib/quickscript/logic";
import { STATUSES, STATUS_SETTER, type PostingRow, type Status } from "@/lib/quickscript/types";
import { ActionStatus, Btn, StateText, control, Empty, Field, InlineError, Loading, useAction, type Resource } from "./quickscript-ui";

const client = pickClient();

/** Shapes for where a row is: finished, waiting on someone, or still a draft. */
const statusMark = (s: Status) => (s === "In Meta Ads" ? "good" : s === "Draft" ? "dash" : "clock") as "good" | "dash" | "clock";

/* The dates follow the Sheet's columns, one per status. */
const DATE_COLUMNS: { status: Status; label: string }[] = [
  { status: "Draft", label: "Drafted" },
  { status: "Approved", label: "Approved" },
  { status: "Recorded", label: "Recorded" },
  { status: "Edited", label: "Edited" },
  { status: "Scheduled", label: "Scheduled" },
  { status: "Clipped", label: "Clipped" },
  { status: "In Meta Ads", label: "Meta Ads" },
];

function DocLink({ row }: { row: PostingRow }) {
  return (
    <a
      href={row.docUrl}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Open the script Doc for ${row.topic}`}
      className="text-primary underline underline-offset-4"
    >
      Doc
    </a>
  );
}

export function LogView({ log, onChanged }: { log: Resource<PostingRow[]>; onChanged: () => Promise<void> }) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const a = useAction(onChanged);

  const rows = (log.data ?? []).filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Show" className="w-full sm:w-64">
          <select className={control} value={filter} onChange={(e) => setFilter(e.target.value as Status | "all")}>
            <option value="all">All rows</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_INFO[s].label}, set by {roleLabel(STATUS_SETTER[s])}. {STATUS_INFO[s].waiting}
              </option>
            ))}
          </select>
        </Field>
        <Btn variant="primary" disabled={a.busy !== null} onClick={() => void a.run("Reading the Posting Log sheet", () => client.syncSheet(), "Could not read the Posting Log sheet")}>
          Update from the Posting Log sheet
        </Btn>
      </div>
      <ActionStatus compact busy={a.busy} message={a.message} detail={a.detail} error={a.error} />

      {log.error && <InlineError message={log.error} onRetry={() => void onChanged()} />}
      {!log.data ? (
        log.error ? null : <Loading what="the posting log" />
      ) : rows.length === 0 ? (
        <Empty>{filter === "all" ? "The Posting Log is empty." : `No rows are at "${STATUS_INFO[filter].label}".`}</Empty>
      ) : (
        <>
          {/* Wide screens get the Sheet's columns. */}
          <div className="hidden overflow-x-auto bg-surface-low md:block" tabIndex={0} role="region" aria-label="Posting log table">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container text-sm text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Topic
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Where it is now
                  </th>
                  {DATE_COLUMNS.map((c) => (
                    <th key={c.status} scope="col" className="px-2 py-2 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2 font-medium">
                    Doc
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {rows.map((r) => (
                  <tr key={r.slug} className="hover:bg-surface-container">
                    <th scope="row" className="min-w-44 px-3 py-2 font-normal">
                      {r.topic}
                    </th>
                    <td className="px-3 py-2">
                      <StateText kind={statusMark(r.status)}>{STATUS_INFO[r.status].label}</StateText>
                      {/* On the row, not only on hover: a keyboard or touch
                          reader should see who acts next too. */}
                      <p className="mt-0.5 text-sm text-on-surface-variant">
                        {STATUS_INFO[r.status].waiting}. Set by {roleName(STATUS_SETTER[r.status])}
                      </p>
                    </td>
                    {DATE_COLUMNS.map((c) => (
                      <td key={c.status} className="px-2 py-2 text-sm text-on-surface-variant" title={r.dates[c.status] ? whenLabel(r.dates[c.status]!) : undefined}>
                        {r.dates[c.status]
                          ? whenLabel(r.dates[c.status]!).split(" · ").map((part, i) => (
                              <span key={i} className={i === 0 ? "block" : "block text-on-surface-muted"}>{part}</span>
                            ))
                          : ""}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <DocLink row={r} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones get one block per row. */}
          <ul className="divide-y divide-outline-variant md:hidden">
            {rows.map((r) => (
              <li key={r.slug} className="bg-surface-low px-4 py-3 mb-2">
                <p>{r.topic}</p>
                <p className="mt-1 text-sm">
                  <StateText kind={statusMark(r.status)}>
                    {STATUS_INFO[r.status].label}. {STATUS_INFO[r.status].waiting}
                  </StateText>
                </p>
                <p className="text-sm text-on-surface-muted">Status set by {roleName(STATUS_SETTER[r.status])}</p>
                <p className="mt-1 text-sm">
                  <DocLink row={r} />
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {DATE_COLUMNS.filter((c) => r.dates[c.status])
                    .map((c) => `${c.label} ${whenLabel(r.dates[c.status]!)}`)
                    .join("; ")}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
