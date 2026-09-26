# Pocket Chart – MedScribe AI

AI-assisted clinical documentation dashboard (capstone project).
Doctors dictate a visit, the assistant pulls structured fields (vitals, chief complaint) out of the speech, and low-confidence values are flagged for review.

> Front-end prototype: patient data is mock data in `src/data/mockData.ts`. Voice dictation is **real** (browser speech recognition). Any email/password logs in.

## Requirements

- **Node.js 18 or newer** (LTS recommended) – download from https://nodejs.org
  Check with: `node -v`

## Run it (easiest)

- **Windows:** double-click `start.bat`
- **macOS / Linux:** run `./start.sh`

The script installs dependencies the first time, then opens the app at http://localhost:5173

## Run it manually

```bash
npm install      # first time only
npm run dev      # starts dev server and opens the browser
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Type-checks and builds a production bundle into `dist/` |
| `npm run preview` | Serves the built `dist/` folder |
| `npm run typecheck` | TypeScript check only |

## Demo login

Enter any email + password, pick **Doctor** or **Administrator**, and click Sign In.

## Voice dictation (speech to text)

1. Open **Patient Charts → any patient → New Patient Chart** tab.
2. Click the blue **mic** (or press **Space**) and allow microphone access when the browser asks.
3. Speak naturally, e.g.
   *"Patient complains of fever and dry cough for 3 days. Temperature 101 degrees Fahrenheit. Pulse 96. BP 130 over 85. Oxygen saturation 95 percent. Allergic to penicillin. Currently taking paracetamol. Diagnosis is viral fever."*
4. Click the mic again to stop. Fields are extracted automatically, each with a confidence score.
5. Click ✓ (or **Accept all**) to fill the form below.

Notes:
- Works in **Google Chrome** and **Microsoft Edge** (they need an internet connection for speech). Firefox has no speech API: type or paste notes in the box and click **Extract fields**.
- The transcript box is editable, so you can fix a mis-heard word and click **Extract fields** again.
- Recognised: chief complaint, symptoms, duration, severity, heart rate, blood pressure, temperature (°F auto-converted to °C), SpO2, respiratory rate, weight (lb → kg), height, blood sugar, allergies, current medications, diagnosis. Spoken numbers ("one forty over ninety") are understood.
- The extraction logic is in `src/lib/extractFields.ts`.

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · React Router 6 · Framer Motion · Sonner (toasts) · Lucide icons

## Project structure

```
src/
  App.tsx                 routes + login state
  components/             Sidebar, TopNav, LoginForm, DictationPanel
  layouts/                DashboardLayout (auth guard + shell)
  pages/                  Login, Dashboard, Patients, PatientChart, Flagged, ActivityLog, Settings
  lib/extractFields.ts    turns dictated text into chart fields + confidence
  data/mockData.ts        sample patients, charts, labs, schedule
  types/index.ts          shared TypeScript types
```

## Troubleshooting

- **`npm` / `node` not recognised** – install Node.js and reopen the terminal.
- **Errors mentioning esbuild or rollup platform binaries** – delete the `node_modules` folder and run `npm install` again (happens when `node_modules` is copied from a different computer).
- **Port 5173 already in use** – Vite automatically picks the next free port; use the URL printed in the terminal.
