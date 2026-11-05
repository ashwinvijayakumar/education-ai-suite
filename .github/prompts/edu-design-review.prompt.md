---
description: "Review a UI page against the suite style guide (edu-design): accessibility, devices, board mode, AI output, and wording. Reports findings; changes nothing unless asked."
argument-hint: "URL or file of the page, and its targets if known (e.g. http://127.0.0.1:8600 on teacher laptop + classroom panel)"
agent: "agent"
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

Review the page the user named against the suite style. Read
[edu-design](../skills/edu-design/SKILL.md), its
[style guide](../skills/edu-design/references/style-guide.md), and
[devices](../skills/edu-design/references/devices.md) first.

1. If the user didn't say where the page runs, ask edu-design's Step 1
   questions about devices, input, and shared screens. Skip the rest of Step 1.
2. Read the page's HTML, CSS, and JavaScript. If it's served from a URL, find
   the source files in the workspace too.
3. Screenshot each target at the viewports in devices.md. The integrated
   browser can't resize, so use headless Edge, for example:
   `msedge --headless=new --hide-scrollbars --window-size=1920,1080 --screenshot=<file> "<url>?display=board"`.
4. Go through every item in edu-design's Step 4 checklist, plus: tokens used
   instead of literal colors and sizes, the signature elements present, and the
   wording follows Voice and tone.
5. Don't edit files. Report:

   ```
   Targets: <devices and modes reviewed>

   | # | Check | Result | Evidence (file:line or screenshot) | Fix |
   |---|---|---|---|---|

   Top 3 fixes: ...
   ```

   Use Pass, Fail, or Not applicable for each result. Then ask whether to apply the fixes.
