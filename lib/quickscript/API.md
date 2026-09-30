# QuickScript API

What the Go program serves, and what the page calls. The Go program listens on
localhost only (`QUICKSCRIPT_BACKEND_URL`, for example `http://127.0.0.1:<port>`)
and never faces the internet. The browser calls same-origin
`/api/quickscript/<path>`; the catch-all route in `app/api/quickscript/[...path]`
checks the Next session and forwards the request to Go, returning its status and
JSON. With `QUICKSCRIPT_BACKEND_URL` unset it answers 503
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
- Nothing here publishes or posts. Email goes only to the Host, or to
  `test_recipient` when `to` is `"me"`.

## Week

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/week` | none | `WeekState` |
| POST | `/run/weekly` | `{"dryRun": bool, "to": "me" \| "host"}` | `{"log"}` |
| POST | `/run/topics` | none | `{"log"}` |
| POST | `/run/draft` | `{"count": 1-5}` or `{"topicIds": ["slug", ...]}` | `{"log"}` |
| POST | `/run/send` | `{"to": "me" \| "host"}` | `{"log"}` |
| POST | `/run/setup-drive` | none | `{"log"}` |

- `GET /week` returns the current week: `weekOf`, the eight pipeline `steps`, the
  ranked `topics` (with `sources`, `deadlineBoost`, `highEndDemoted`, `drafted`),
  each collector's `collectors` status (`ok`, `failed`, `cached`, `off`), `driveReady`
  and the last run's `log` lines.
- `/run/weekly` is `quickscript weekly`: topics, `draft --top N`, `publish-drafts`.
  With `dryRun` it writes and sends nothing. `to` is `--to-me` or the Host. N is 3
  in evergreen and 1 in season.
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

- `Settings` is `config.yaml` as JSON: `models` per task (`ranking`, `drafts`,
  `publishPack`, each `{provider, model}`), `seedWords`, `highEndWords`, `sources`
  (id, name, enabled, reason), `people`, `schedule` (`day` 0 is Sunday, `time`
  `HH:MM`), `seasonOverride` (`auto`, `evergreen`, `inseason`) and `taxYear`.
- `/keys` reports only whether each variable is set in the server's environment.
  Keys are never sent to the page and never accepted from it.
