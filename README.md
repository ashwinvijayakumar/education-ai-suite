# Education AI Suite

The **Education AI Suite** is a collection of open-source reference applications, libraries,
microservices, and benchmarking tools, helping developers accelerate AI workload development
and select hardware that best fits their education-focused use cases.
It provides audio and video pipelines accelerated with the **OpenVINO™ toolkit**,
enabling high-performance deployment on **Intel® CPUs, integrated GPUs, and NPUs**.

The suite workflows redefine the experience of both teaching and learning:

The **Smart Classroom** application, is an extensible framework
for processing, analyzing, and summarizing classroom sessions using advanced multimodal AI.

The **Teaching Assistant** answers the self-development needs, offering voice-first assistance
in studying.


## Suite Capabilities

The Education AI Suite supports the following AI technologies and workflows:

- **Audio Intelligence**: ASR (speech-to-text), speaker diarization, summarization, and
  text-to-speech powered by models like Whisper, Paraformer, and Qwen
- **Video Analytics**: Multi-camera pose detection, student re-identification, and classroom
  statistics
- **Retrieval-Augmented Generation (RAG)**: Multimodal semantic search, vector-based
  retrieval with CLIP and mE5 embeddings, and LLM-powered Q&A
- **Report Generation**: Automated generation of classroom summaries, mind maps, and session
  reports in multiple formats
- **Extensible Architecture**: Plug-and-play model integration and API-first design for
  frontend applications

The suite is built with modularity and extensibility in mind. It is designed as code to
understand the AI workload patterns and hardware requirements for educational edge AI systems.

For full documentation, refer to the
[Open Edge Platform documentation website](https://docs.openedgeplatform.intel.com/dev/ai-suite-education.html).

## Build with a Coding Agent

The repository includes agent instructions ([AGENTS.md](AGENTS.md)) and skills
([.github/skills](.github/skills/README.md)) that let a coding assistant such as
GitHub Copilot, Claude Code, Cursor, or Codex install, run, change, and build on
the suite for you. Apps it builds call the suite's running services, so they use
the same OpenVINO™-accelerated pipelines on Intel® CPUs, GPUs, and NPUs.

1. **Install and start** the app you want to build on, by following its guide or
   by asking the agent, for example *"Install the AI Teaching Assistant and start it."*
2. **Open the repository root** (`education-ai-suite/`) in your editor. If you
   cloned with sparse checkout, add the agent files with
   `git sparse-checkout add .github .cursor`.
3. **Switch the chat to plan mode** (for example the **Plan** agent in GitHub
   Copilot Chat, or plan mode in Claude Code) so the agent proposes before it changes anything.
4. **Paste an example prompt**, or write your own:

   | Prompt | What you get |
   |---|---|
   | [Lesson Q&A assistant](.github/skills/edu-build-app/example-prompts/lesson-qa-assistant.md) | Upload lesson materials; students ask questions and get answers with sources |
   | [Lecture recap](.github/skills/edu-build-app/example-prompts/lecture-recap.md) | Upload a class recording; get the transcript, summary, and mind map |
   | [Voice study buddy](.github/skills/edu-build-app/example-prompts/voice-study-buddy.md) | Ask spoken questions about your notes and hear the answers |
   | [Engagement dashboard](.github/skills/edu-build-app/example-prompts/engagement-dashboard.md) | Live student counts, stand-ups, and raised hands from classroom video |

5. **Review the plan.** The agent shows an ASCII diagram of the pipeline, which
   Intel runtime (OpenVINO, OpenVINO GenAI, DL Streamer, or OVMS) and device each
   stage uses, and the files it will create. Ask for changes until it's right.
6. **Switch to agent mode and approve.** The agent generates the app in
   `user-apps/<name>/`, asks whether to run it, and offers to open it in your browser.

You can also ask the agent to change an existing app, for example *"Move video
analytics to the GPU"*, *"Add a button that downloads the transcript"*, or
*"Measure summary latency on GPU versus CPU"*. Review agent-generated code before
using it; see [Intended Use](#intended-use).

## Contribute

Read the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

## Community and Support

For support, submit your bug report and feature request to [Github Issues](https://github.com/open-edge-platform/education-ai-suite/issues).

## License

The **Education AI Suite** project is licensed under the [APACHE 2.0](LICENSE).  

## Intended Use

Applications developed in this repository, unless stated otherwise, are intended for reference
and demonstration purposes, not for production environments.
Certain features, such as authentication, TLS termination, and external access controls are
assumed to be covered at the infrastructure level.

For more information, refer to the
[Notes on Usage](https://docs.openedgeplatform.intel.com/dev/OEP-articles/notes-on-usage.html)
document.
