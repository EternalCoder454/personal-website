# QuickScript API

What the Go program serves, and what the page calls. The Go program listens on
localhost only (`QUICKSCRIPT_BACKEND_URL`, for example `http://127.0.0.1:<port>`)
and never faces the internet. The browser calls same-origin
`/api/quickscript/<path>`; the catch-all route in `app/api/quickscript/[...path]`
checks the Next session and forwards the request to Go, returning its status and
JSON. Every forwarded request carries the header `X-QuickScript-Token`, equal to
`QUICKSCRIPT_BACKEND_TOKEN` on both sides; Go refuses anything without it. With
`QUICKSCRIPT_BACKEND_URL` or the token unset it answers 503
`{"error": "backend not connected"}`. The page uses the in-memory mock unless
`NEXT_PUBLIC_QUICKSCRIPT_LIVE` is `1`. No backend URL reaches the browser.

The contract is the `QuickScriptClient` interface in `client.ts` and the types in
`types.ts`. JSON uses lower camel case. Timestamps are RFC 3339, bare dates are
`YYYY-MM-DD`.

Rules for every endpoint:

- Success is HTTP 200 with the JSON below.
- Failure is a non-2xx status with `{"error": "short label"}`. The page shows the
  message inline.
- Access control is the Next session (`qs_session`). Go trusts only what the
  Next route forwards, and never holds or receives a browser cookie. The page
  never holds an API key.
- Actions return `{"log": "one short line"}`. The same events go to `data/logs`.
- Nothing here publishes or posts. Email goes only to `automatic.sendTo` on a
  scheduled run, to the Host (`people.hostEmail`) or `people.testRecipient` on a
  run by hand (`to` is `"host"` or `"me"`), and to whoever a single script is
  sent to.

## The automatic run

The schedule (`schedule.day`, `schedule.time`) starts `quickscript weekly` with no
person involved, when `automatic.enabled` is true. The same code runs when a person
calls `/run/weekly`, except that the address is the chosen recipient. Either way it
stores a `LastRun` and `GET /week` returns it as `lastRun`.

How the strongest scripts are chosen (the page shows this text, and every
`LastRun.rule` carries it):

1. Rank the topics by score.
2. Write scripts for the top ones: the number to send plus two spare, never more
   than 5.
3. If `automatic.onlyIfChecksPass` is true, hold back any script that fails a check:
   length 450 to 750 words, the disclaimer in the last three lines, no line marked
   `NOT VERIFIED`.
4. Hold back any script whose topic is below `automatic.minStrength`. Strength is
   Strong at 80 or more, Good at 60 to 79.9, Weak below 60. `"strong"` sends Strong
   only, `"good"` sends Strong and Good. Weak is never sent.
5. Sort what is left by score, highest first, and send up to the limit: the
   `automatic.maxScripts` setting, or 1 when the season is `inseason`. Anything past
   the limit is held back with the reason "over the limit of N for one run".

Each held script carries `reasons`, plain fragments such as `"2 numbers need checking"`,
`"length is 300 words, it needs 450 to 750"`, `"disclaimer is missing"`,
`"topic strength is Good, only Strong is sent"`, `"topic strength is Weak, Strong or Good is needed"`. The page shows them as
"Not sent, needs a fix: 2 numbers need checking". A held script stays a Draft and can still be sent
from the Scripts tab with `/scripts/{slug}/send`, which clears its held state.

`LastRun`: `ranAt`, `trigger` (`"schedule"` or `"hand"`), `ok`, `error` (plain text,
when `ok` is false), `topicsFound`, `topicsKept`, `scriptsWritten`, `sentTo` (the
address, empty when nothing went), `sent[]` (`slug`, `topic`, `score`, `checks`:
`words`, `lengthOk`, `disclaimerOk`, `unverifiedNumbers`), `held[]` (`slug`, `topic`,
`score`, `reasons[]`) and `rule`. A failed run has `ok: false`, an `error`, and
empty `sent` and `held`.

Rules for every response:

- Lists are never null: send `[]` for an empty one (Go encodes a nil slice as
  `null`; initialise it). `settings.automatic` is always present.
- `schedule.time` is `HH:MM` in the server's own time zone, the one its timer
  uses. The page works out "next run" and "didn't run" from it, allowing 45
  minutes after the scheduled time before calling a run missed. When the
  server knows a scheduled run did not happen, it should say so with a
  `recentRuns` entry whose `state` is `"missed"`.

## Week

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/week` | none | `WeekState` |
| POST | `/run/weekly` | `{"dryRun": bool, "to": "me" \| "host"}` | `{"log", "run": LastRun}` |
| POST | `/run/topics` | none | `{"log"}` |
| POST | `/run/draft` | `{"count": 1-5}` or `{"topicIds": ["slug", ...]}` | `{"log"}` |
| POST | `/run/send` | `{"to": "me" \| "host"}` | `{"log"}` |
| POST | `/run/setup-drive` | none | `{"log"}` |

- `GET /week` returns the current week: `weekOf`, the eight pipeline `steps`, the
  ranked `topics` (with `sources`, `deadlineBoost`, `highEndDemoted`, `drafted`),
  each collector's `collectors` status (`ok`, `failed`, `cached`, `off`), `driveReady`,
  the last run's `log` lines, `lastRun` (a `LastRun`, absent when nothing has run) and
  `recentRuns`.
- `recentRuns` is the last 6 weekly runs, newest first, the latest included. Each is
  `{ranAt, state, sent, held}`. `state` is `good` (sent what it should), `attention`
  (something was not sent and needs a fix), `failed` (stopped with an error) or `missed`
  (nothing started at its scheduled time; `ranAt` is then the scheduled time). The page
  draws a tick, a warning triangle, a cross or a clock with the word, and reads the
  strip oldest to newest. It works out the status card itself from `lastRun`,
  `settings` and `/keys`: Failed, Needs attention, Didn't run or All good.
- `/run/weekly` is `quickscript weekly` by hand: topics, draft, choose, send, by the
  rule above. `to` is `--to-me` or the Host. With `dryRun` it writes and sends
  nothing, stores no `LastRun`, and `run` has empty lists. The scheduled run is the
  same command started by the scheduler.
- `/run/draft` with `count` drafts the top N topics that have no script yet. With
  `topicIds` it drafts those topics and skips any that already have a script.
- `/run/send` is `publish-drafts` for this week's drafts.
- `/run/setup-drive` is `setup-drive`. It is safe to repeat. `driveReady` turns true.

## Scripts

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/scripts` | none | `Script[]`, this week's |
| POST | `/scripts/{slug}/send` | `{"to": "me" \| "host"}` | `{"log"}` |
| POST | `/scripts/{slug}/redraft` | `{"provider": "gemini" \| "claude", "model": "id"}` | `{"log"}` |
| POST | `/scripts/{slug}/pack` | none | `PublishPack` |

- `Script.score` is the score of its topic. `Script.delivery` says what the weekly run
  did with it: `{"state": "sent", "to", "at", "automatic"}` (`automatic` is true when
  the schedule sent it) or `{"state": "held", "reasons": [...]}`. It is absent for a
  script no run has handled. `sentTo` still records a manual send, and a manual send
  clears `delivery`. The page shows "Sent automatically to ...", "Not sent, needs a fix: ..."
  or "Not sent yet".
- `Script.text` is the script, then a line of `---`, then the model's list of
  numbers with `NOT VERIFIED` marks. The page computes word count, the disclaimer
  check and the flagged-number list from this text itself.
- `redraft` replaces the draft and clears its pack. It is refused unless the status
  is `Draft`.
- `pack` is `quickscript pack <slug>`. It is refused while the status is `Draft`.
  It returns three `titles`, `description`, `playlist` and `thumbnailWords` (3 to 5).
  The page checks titles under 60 characters ending in `?`, and the disclaimer in
  the description. The Go side rejects a pack that fails them.

## Posting log

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/posting-log` | none | `PostingRow[]` |
| POST | `/posting-log/sync` | none | `{"log"}` |

- `PostingRow.dates` is keyed by status name (`Draft`, `Approved`, `Recorded`,
  `Edited`, `Scheduled`, `Clipped`, `In Meta Ads`) and holds the date that status
  was set.
- `/posting-log/sync` is `quickscript sync`: reads the Sheet, saves approved scripts.
  Follow it with `GET /posting-log`.

## Settings

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/settings` | none | `Settings` |
| PUT | `/settings` | `Settings` | `Settings`, as saved |
| GET | `/keys` | none | `{"GEMINI_API_KEY": bool, "ANTHROPIC_API_KEY": bool}` |

- `automatic` is new: `enabled` (default true), `sendTo` (required, a valid email,
  defaults to `people.hostEmail`), `maxScripts` (1 to 5, default 3), `onlyIfChecksPass`
  (default true) and `minStrength` (`"strong"` or `"good"`, default `"good"`). The
  server refuses a save with an empty or invalid `sendTo` or a `maxScripts` outside
  1 to 5. The next-run time is computed from `schedule`, not stored.
- `Settings` is `config.yaml` as JSON: `automatic`, `models` per task (`ranking`, `drafts`,
  `publishPack`, each `{provider, model}`), `seedWords`, `highEndWords`, `sources`
  (id, name, enabled, reason), `people`, `schedule` (`day` 0 is Sunday, `time`
  `HH:MM`), `seasonOverride` (`auto`, `evergreen`, `inseason`) and `taxYear`.
- `/keys` reports only whether each variable is set in the server's environment.
  Keys are never sent to the page and never accepted from it.
