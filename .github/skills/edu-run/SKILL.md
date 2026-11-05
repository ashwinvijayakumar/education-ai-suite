---
name: edu-run
description: >
  Start, stop, health-check, and open any Education AI Suite app: Smart
  Classroom (Windows or Linux), AI Teaching Assistant, Flutter RAG demo,
  OpenClaw demo, or an app the agent built in user-apps/. Waits for health
  endpoints, reports which services are up, and offers to open the app in the
  default browser. Use when the user says "start the app", "run it", "launch
  Smart Classroom", "start the teaching assistant", "is it running", "check
  health", "stop everything", "restart", or "open it in the browser".
metadata:
  argument-hint: >
    Which app and action (e.g. "start Smart Classroom", "check health of
    everything", "stop the AI Teaching Assistant")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Run the Education AI Suite

Ports and services are listed in the repository-root [AGENTS.md](../../../AGENTS.md).
**Run the commands yourself and report the results.** If an app isn't installed
yet, use [edu-install](../edu-install/SKILL.md) first.

## Health check (all apps, Windows)

Run this first for any request; it shows what is already running.

```powershell
$checks = [ordered]@{
  'Smart Classroom backend' = 'http://127.0.0.1:8000/health'
  'Content Search'          = 'http://127.0.0.1:9011/api/v1/system/health'
  'Grading (optional)'      = 'http://127.0.0.1:9012/api/v1/health'
  'ATA UI'                  = 'http://127.0.0.1:7860/healthz'
  'ATA kiosk-core'          = 'http://127.0.0.1:8012/health'
  'ATA audio-analyzer'      = 'http://127.0.0.1:8010/health'
  'ATA text-to-speech'      = 'http://127.0.0.1:8011/health'
  'ATA rag-service'         = 'http://127.0.0.1:8020/health'
  'ATA metrics-collector'   = 'http://127.0.0.1:9000/health'
}
foreach ($name in $checks.Keys) {
  try   { $r = Invoke-WebRequest -Uri $checks[$name] -UseBasicParsing -TimeoutSec 5; "{0,-26} UP ({1})" -f $name, $r.StatusCode }
  catch { "{0,-26} DOWN" -f $name }
}
```

- Smart Classroom `/health` returns a `hub` object with the `state`, `provider`,
  and `device` of each model (`asr`, `ocr`, `text_gen`). Wait until the models
  the user needs are `ready`.
- Content Search returns 503 until ChromaDB, file ingest, and video preprocess are
  all ready; the body names the service that isn't.

## Smart Classroom (Windows)

Run from `smart-classroom/Windows`.

| Action | Command |
|---|---|
| Start (elevated terminal) | `.\start-smart-classroom.ps1 -Silent -NoElevate -NoWindowsTerminal` — starts backend, Content Search, grading (if enabled), and the browser UI, waits until healthy, then exits and leaves them running. Backend output goes to `logs\backend_<timestamp>.log`. |
| Start (terminal not elevated) | Same command without `-NoElevate`. It shows a UAC prompt and continues in a new window you can't read; ask the user to approve it, then poll the health check. |
| Start (desktop app) | `.\start-desktop-app.ps1 -Silent` — never elevates. The app starts the services itself; its **Services** screen has start, stop, restart, and live logs. |
| Open | <http://localhost:5173> (script path). The desktop app has its own window. |
| Stop | See below. |

To stop, end only the processes listening on Smart Classroom's ports, then its
own UI dev server. Don't stop by port 5173: the AI Teaching Assistant's dev
server can be listening on it at the same time.

```powershell
$ports = 8000, 9011, 9090, 9990, 8001, 9012, 9902, 8554, 8888, 8889
Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object CommandLine -like '*smart-classroom\Windows\ui\*' |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

In a non-silent start window, Ctrl+C does the same and also ends the rest of
Smart Classroom's process tree. It leaves other apps' `python` and `node`
processes running. The start script refuses to start if another app already
holds port 5173.

## Smart Classroom (Linux)

Run from `smart-classroom/Linux`.

| Action | Command |
|---|---|
| Start | `./setup.sh` — starts the containers and the UI dev server, waits until healthy, and prints the UI URL and log path. Rerun it after changing `config.yaml`. |
| Status and logs | `docker compose -f docker/docker-compose.yml ps` and `docker compose -f docker/docker-compose.yml logs -f app` |
| Health | `curl --noproxy '*' http://127.0.0.1:8000/api/v1/system/health` |
| Open | <http://localhost:5173>, or the URL `setup.sh` printed if 5173 was taken |
| Stop | `docker compose -f docker/docker-compose.yml down`, then `kill "$(cat ui/vite-dev.pid)" && rm ui/vite-dev.pid` for the UI dev server, which isn't a container |

## AI Teaching Assistant

Run from `ai-teaching-assistant`.

| Action | Command |
|---|---|
| Start | `.\start_ata.ps1 -NoBrowser` — **run it as a background process**: after the services are ready it keeps streaming their logs until stopped. It reuses services that are already healthy. On a first run, models download and warm up; `-StartupTimeoutSeconds` (default 600) raises the wait. |
| Open | <http://127.0.0.1:7860> |
| Stop | `.\stop_ata.ps1` (`-Force` to force-kill). The ingested knowledge base is kept; `-ClearKnowledgeBase` also deletes it, so confirm with the user before using that flag. |

## Flutter RAG demo

Use [sc-up](../sc-up/SKILL.md) to start it and [sc-doctor](../sc-doctor/SKILL.md)
to diagnose it.

## OpenClaw demo (Ubuntu)

From `teacher-assistant-claw-demo`, run `./setup-ovms.sh` if the model server isn't
running, then `./run-agent.sh`. It waits for the model to load and opens the chat.
If the model isn't ready in time, follow the steps the script prints.

To stop, exit the chat with Ctrl+C, then stop the model server with
`docker stop teacher-assistant-ovms` (`./setup-ovms.sh` replaces the container on
the next start). The OpenClaw gateway installed during setup keeps running as a
background service; `openclaw gateway status` shows it.

## Apps in `user-apps/`

Each app's `README.md` (written by [edu-build-app](../edu-build-app/SKILL.md))
lists its run command and URL. Check the suite services it depends on with the
health check above before starting it.

## After starting

1. Report each service as UP or DOWN, plus the model states from Smart Classroom `/health` if relevant.
2. Ask the user whether to open the app in their default browser. If they agree:

   ```powershell
   Start-Process "http://localhost:5173"   # or the app's URL
   ```

## Troubleshooting

| Symptom | Action |
|---|---|
| A port is already in use | `Get-NetTCPConnection -State Listen -LocalPort <port> \| Select-Object OwningProcess` and `Get-Process -Id <pid>`; ask before stopping it |
| Content Search stays 503 | The backend VLM must be ready first; check backend `/health`, then the backend log |
| Smart Classroom fails during start | [get-started-windows.md troubleshooting](../../../smart-classroom/docs/user-guide/get-started/get-started-windows.md#automated-setup---troubleshooting) and [advanced-setup-guide.md](../../../smart-classroom/docs/user-guide/advanced-setup-guide.md#troubleshooting) |
| AI Teaching Assistant service won't start | [troubleshooting.md](../../../ai-teaching-assistant/docs/user-guide/troubleshooting.md) |
