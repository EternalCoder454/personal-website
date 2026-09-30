"use client";

import { useState } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { shortDate } from "@/lib/quickscript/logic";
import { STATUSES, STATUS_SETTER, type PostingRow, type Status } from "@/lib/quickscript/types";
import { ActionStatus, Btn, control, Empty, Field, InlineError, Loading, useAction, type Resource } from "./quickscript-ui";

const client = pickClient();

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
      aria-label={`Open the Doc for ${row.topic}`}
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Status" className="w-full sm:w-64">
          <select className={control} value={filter} onChange={(e) => setFilter(e.target.value as Status | "all")}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}, set by {STATUS_SETTER[s]}
              </option>
            ))}
          </select>
        </Field>
        <Btn variant="primary" disabled={a.busy !== null} onClick={() => void a.run("Sync from Sheet", () => client.syncSheet())}>
          Sync from Sheet
        </Btn>
      </div>
      <ActionStatus busy={a.busy} message={a.message} error={a.error} />

      {log.error && <InlineError message={log.error} onRetry={() => void onChanged()} />}
      {!log.data ? (
        log.error ? null : <Loading what="the posting log" />
      ) : rows.length === 0 ? (
        <Empty>{filter === "all" ? "The posting log is empty." : `No rows with status ${filter}.`}</Empty>
      ) : (
        <>
          {/* Wide screens get the Sheet's columns. */}
          <div className="hidden overflow-x-auto border border-outline-variant md:block" tabIndex={0} role="region" aria-label="Posting log table">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-low text-sm text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Topic
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Status
                  </th>
                  {DATE_COLUMNS.map((c) => (
                    <th key={c.status} scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
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
                  <tr key={r.slug}>
                    <th scope="row" className="min-w-56 px-3 py-2.5 font-normal">
                      {r.topic}
                    </th>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {r.status}
                      <span className="block text-xs text-on-surface-muted">{STATUS_SETTER[r.status]}</span>
                    </td>
                    {DATE_COLUMNS.map((c) => (
                      <td key={c.status} className="px-3 py-2.5 whitespace-nowrap text-on-surface-variant">
                        {r.dates[c.status] ? shortDate(r.dates[c.status]!) : ""}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <DocLink row={r} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones get one block per row. */}
          <ul className="divide-y divide-outline-variant border-y border-outline-variant md:hidden">
            {rows.map((r) => (
              <li key={r.slug} className="py-3">
                <p>{r.topic}</p>
                <p className="mt-0.5 text-sm">
                  {r.status}
                  <span className="text-on-surface-muted">, set by {STATUS_SETTER[r.status]}</span>
                  {" · "}
                  <DocLink row={r} />
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {DATE_COLUMNS.filter((c) => r.dates[c.status])
                    .map((c) => `${c.label} ${shortDate(r.dates[c.status]!)}`)
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
