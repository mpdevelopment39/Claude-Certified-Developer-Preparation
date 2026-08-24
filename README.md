# Claude Certified Developer Preparation

An interactive, blueprint-aligned study workspace for the **Claude Certified Developer — Foundations (CCDV-F)** certification.

## Included

- All 8 official exam domains and 25 weighted objectives
- Device-local study progress tracking
- A 53-question, 120-minute full mock exam
- Quick randomized drills and domain-specific practice
- Single-response and multiple-response questions
- Answer review, explanations, and domain performance breakdowns
- Links to the certification page and primary technical documentation

> The practice bank contains original exam-style questions. It does not contain recalled, leaked, or live exam content and is not affiliated with Anthropic.

## Run locally

```bash
cd site
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Production build

```bash
cd site
npm run build
```

## GitHub Pages

Every push to `main` publishes the static app with GitHub Actions. Practice
progress and attempt history are stored locally in the browser, so each device
keeps its own data without requiring a server.
