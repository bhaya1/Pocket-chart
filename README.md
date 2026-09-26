# Pocket Chart – MedScribe AI

AI-assisted clinical documentation dashboard (capstone project).
Doctors dictate a visit, the assistant pulls structured fields (vitals, chief complaint) out of the speech, and low-confidence values are flagged for review.

> Front-end prototype: all data is mock data in `src/data/mockData.ts`; AI dictation is simulated. Any email/password logs in.

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

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · React Router 6 · Framer Motion · Sonner (toasts) · Lucide icons

## Project structure

```
src/
  App.tsx                 routes + login state
  components/             Sidebar, TopNav, LoginForm, DictationPanel
  layouts/                DashboardLayout (auth guard + shell)
  pages/                  Login, Dashboard, Patients, PatientChart, Flagged, ActivityLog, Settings
  data/mockData.ts        sample patients, charts, labs, schedule
  types/index.ts          shared TypeScript types
```

## Troubleshooting

- **`npm` / `node` not recognised** – install Node.js and reopen the terminal.
- **Errors mentioning esbuild or rollup platform binaries** – delete the `node_modules` folder and run `npm install` again (happens when `node_modules` is copied from a different computer).
- **Port 5173 already in use** – Vite automatically picks the next free port; use the URL printed in the terminal.
