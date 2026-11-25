# VoteReady client

React + Vite front end for the VoteReady MERN version. Live at https://voteready-mern.vercel.app.

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3001
npm install
npm run dev            # needs the API running: cd ../server && npm start (or npm run dev:memory)
npm run build && npm run lint
```

- `src/api.js`: the one axios instance (`VITE_API_URL`).
- `src/i18n.jsx` + `src/dictionary.js`: the en/hi toggle (`t()` keyed by the English text).
- `src/pages/`: Home, Checklist (with the EPIC demo), Ask, StateMap, Plans (list, create, update, delete).
- `vercel.json` rewrites every path to `index.html` so react-router routes work on refresh.

Setup, API routes and data sources: see the repo [README](../README.md).
