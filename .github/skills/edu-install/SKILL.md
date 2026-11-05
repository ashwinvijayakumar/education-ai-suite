---
name: edu-install
description: >
  Install the Education AI Suite: the full suite or a single app (Smart
  Classroom on Windows or Linux, AI Teaching Assistant, Flutter RAG demo, or
  the OpenClaw Teacher Assistant demo). Checks prerequisites, gets the right
  folders, runs the setup script with flags that work from an agent terminal,
  and hands off to edu-run to verify. Use when the user says "install the
  suite", "install everything", "set up Smart Classroom", "install the AI
  Teaching Assistant", "first-time setup", "set up on Linux", or "uninstall".
metadata:
  argument-hint: >
    Which app to install (e.g. "the full suite on Windows", "Smart Classroom on
    Linux", "just the AI Teaching Assistant")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Install the Education AI Suite

Facts about the apps, ports, and models are in the repository-root
[AGENTS.md](../../../AGENTS.md). This skill is the procedure. **Run the commands
yourself and report the results.** Paths below are relative to the repository root.

## Step 0 — Decide what to install

| The user wants | Install |
|---|---|
| "The suite" or "everything" on Windows | Smart Classroom (Windows) **and** AI Teaching Assistant |
| Class recording, transcripts, summaries, mind maps, reports, video analytics, content search, grading | Smart Classroom |
| Voice Q&A over uploaded documents | AI Teaching Assistant |
| A lightweight Content Search Q&A UI only | Flutter RAG demo |
| Anything on Linux | Smart Classroom (Linux) |
| An agent that answers questions about class sessions | OpenClaw demo (Ubuntu 24.04) |

The AI Teaching Assistant and the Flutter RAG demo are Windows-only. The OpenClaw
demo is Ubuntu-only. If the request is ambiguous, ask which app before installing.

## Step 1 — Check prerequisites

Read the requirements for each app you will install and report anything missing
before running setup:

| App | Requirements |
|---|---|
| Smart Classroom | [system-requirements.md](../../../smart-classroom/docs/user-guide/get-started/system-requirements.md) |
| AI Teaching Assistant | [system-requirements.md](../../../ai-teaching-assistant/docs/user-guide/get-started/system-requirements.md) and [get-started.md](../../../ai-teaching-assistant/docs/user-guide/get-started.md#step-1-prerequisites) |
| Flutter RAG demo | [README prerequisites](../../../utils/flutter/README.md#prerequisites) |
| OpenClaw demo | [README pre-requisites](../../../teacher-assistant-claw-demo/README.md) |

Quick probes on Windows:

```powershell
python --version; node --version; git --version
Get-CimInstance Win32_VideoController | Select-Object Name
Get-PnpDevice -FriendlyName "*AI Boost*" -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

The last line tells you whether this terminal is elevated, which decides the
Smart Classroom flags in Step 3.

## Step 2 — Make sure the folders are present

```powershell
git sparse-checkout list
```

If it reports that the worktree is not sparse, everything is already checked out.
Otherwise add what is missing with `git sparse-checkout add <folders>`:

| App | Folders |
|---|---|
| Smart Classroom (Windows) | `smart-classroom/Windows` |
| Smart Classroom (Linux) | `smart-classroom/Linux` |
| AI Teaching Assistant | `ai-teaching-assistant` |
| Flutter RAG demo | `utils/flutter smart-classroom/Windows` (it installs `smart-classroom/Windows/requirements.txt` and runs that backend) |
| OpenClaw demo | `teacher-assistant-claw-demo` |
| Agent instructions and skills | `.github .cursor` (`AGENTS.md` and `CLAUDE.md` are always present) |

## Step 3 — Run setup

### Smart Classroom (Windows)

Run from `smart-classroom/Windows`. There are two paths; pick the one that fits:

| Path | Command | Notes |
|---|---|---|
| Scripts (best for agents) | `.\setup-smart-classroom.ps1 -Silent -NoElevate -NoWindowsTerminal` | Use only if the terminal is elevated. `-Silent` skips prompts, uses saved proxy settings, auto-installs Python 3.12 and Node.js if missing, and skips NPU driver installation. |
| Desktop app (best for people) | `.\start-desktop-app.ps1 -Silent` | Never elevates. Opens a window whose **Setup** screen installs prerequisites one item at a time; the user clicks through it. |

- Without `-NoElevate` the script requests Administrator rights through a UAC
  prompt and continues in a new window you can't read. If the terminal isn't
  elevated, tell the user and either ask them to approve the prompt and tell you
  when setup finishes, or to restart VS Code as Administrator.
- Tell the user before running with `-Silent`, because it installs software
  system-wide.
- Feature choices live in `config.yaml`. `-Silent` keeps the current values; use
  [edu-configure](../edu-configure/SKILL.md) to change them.
- Speaker diarization needs a Hugging Face token. The user must enter it
  themselves; see [Speaker Diarization Setup](../../../smart-classroom/docs/user-guide/advanced-setup-guide.md#f-speaker-diarization-setup-optional).
- If setup fails, use the troubleshooting table in
  [get-started-windows.md](../../../smart-classroom/docs/user-guide/get-started/get-started-windows.md#automated-setup---troubleshooting).

### Smart Classroom (Linux)

```bash
cd smart-classroom/Linux && chmod +x setup.sh && ./setup.sh
```

- Needs Docker without `sudo`, an Intel GPU at `/dev/dri`, and `python3` with `pyyaml`.
- `setup.sh` also builds and **starts** the stack and waits for it to be healthy.
  On a first run that can take a long time; raise the wait with
  `HEALTH_TIMEOUT_S=3600 ./setup.sh`.
- For diarization the user puts `HF_TOKEN` in `.env` themselves.
- Details: [get-started-linux.md](../../../smart-classroom/docs/user-guide/get-started/get-started-linux.md).

### AI Teaching Assistant

```powershell
cd ai-teaching-assistant; .\setup_windows.ps1
```

- Does not elevate. Initializes the `edge-ai-libraries` and
  `voice-enabled-interactions` submodules at pinned commits, creates one virtual
  environment per service, and writes `.env` if it doesn't exist.
- Models download and warm up on the first start (see [edu-run](../edu-run/SKILL.md)).

### Flutter RAG demo

Use the [sc-setup](../sc-setup/SKILL.md) skill. It needs the Flutter SDK and
Visual Studio Build Tools with the C++ workload.

### OpenClaw demo

Follow the [README](../../../teacher-assistant-claw-demo/README.md) steps in order.
Step 3 pipes a remote install script into `bash`; show the user that command and
get their confirmation before running it.

## Step 4 — Installing the full suite on one Windows machine

- Smart Classroom and the AI Teaching Assistant use different ports and separate
  virtual environments, so they can be installed side by side.
- Both load models onto the GPU. Start them one at a time and check health before
  starting the second.
- Both front-end dev servers default to port 5173. Only one can use it at a time
  (the AI Teaching Assistant's normal UI is on 7860, so this only matters when
  running `npm run dev`).

## Step 5 — Verify

Hand off to [edu-run](../edu-run/SKILL.md) to start each app and check health.
Report what was installed, any warnings the scripts printed (for example a
missing NPU driver), and anything the user still has to do by hand.

## Uninstall

Always confirm with the user before removing anything.

| App | How |
|---|---|
| Smart Classroom (Windows) | Follow [Uninstall the Application](../../../smart-classroom/docs/user-guide/advanced-setup-guide.md#uninstall-the-application) |
| Smart Classroom (Linux) | `docker compose -f docker/docker-compose.yml down` from `smart-classroom/Linux`; adding `-v` also deletes volumes, including downloaded models |
| AI Teaching Assistant | `.\uninstall_ata.ps1` (asks for confirmation; `-Yes` skips it). `-RemoveHfCache` deletes the user-wide Hugging Face cache, which other apps may share |
