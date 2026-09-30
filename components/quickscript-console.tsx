"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { pickClient } from "@/lib/quickscript/client";
import { LogView } from "./quickscript-log";
import { ScriptsView } from "./quickscript-scripts";
import { SettingsView } from "./quickscript-settings";
import { useResource } from "./quickscript-ui";
import { WeekView } from "./quickscript-week";

const client = pickClient();

const fetchWeek = () => client.getWeek();
const fetchScripts = () => client.listScripts();
const fetchLog = () => client.listPostingLog();
const fetchSettings = () => client.getSettings();
const fetchKeys = () => client.getKeyStatus();

const VIEWS = [
  { id: "week", label: "This week" },
  { id: "scripts", label: "Scripts" },
  { id: "log", label: "Posting log" },
  { id: "settings", label: "Settings" },
] as const;

/**
 * The four views. The active one comes from ?view=, and the tabs are plain
 * links, so a view can be bookmarked and the back button works. All four stay
 * mounted and the inactive ones are hidden, so an unsaved settings edit
 * survives a trip to another tab.
 */
export function QuickScriptConsole() {
  const param = useSearchParams().get("view");
  const view = VIEWS.find((v) => v.id === param)?.id ?? "week";

  const week = useResource(fetchWeek);
  const scripts = useResource(fetchScripts);
  const log = useResource(fetchLog);
  const settings = useResource(fetchSettings);
  const keys = useResource(fetchKeys);

  const reloadWeek = week.reload;
  const reloadScripts = scripts.reload;
  const reloadLog = log.reload;
  const onChanged = useCallback(async () => {
    await Promise.all([reloadWeek(), reloadScripts(), reloadLog()]);
  }, [reloadWeek, reloadScripts, reloadLog]);

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Views">
        <ul className="grid grid-cols-4 border-b border-outline-variant">
          {VIEWS.map((v) => {
            const on = v.id === view;
            return (
              <li key={v.id}>
                <Link
                  href={`/quickscript?view=${v.id}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-12 items-center justify-center border-b-2 px-1 text-center text-sm whitespace-nowrap sm:px-4 sm:text-[15px] ${
                    on ? "border-primary font-medium text-on-surface" : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {v.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div hidden={view !== "week"}>
        <WeekView week={week} settings={settings} onChanged={onChanged} />
      </div>
      <div hidden={view !== "scripts"}>
        <ScriptsView scripts={scripts} draftProvider={settings.data?.models.drafts.provider ?? "claude"} onChanged={onChanged} />
      </div>
      <div hidden={view !== "log"}>
        <LogView log={log} onChanged={onChanged} />
      </div>
      <div hidden={view !== "settings"}>
        <SettingsView settings={settings} keys={keys} />
      </div>
    </div>
  );
}
