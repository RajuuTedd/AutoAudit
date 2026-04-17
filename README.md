# AutoAudit

AutoAudit is a full-stack web compliance scanner that audits websites for **security**, **privacy**, and **accessibility** risks, then maps technical findings to regulatory requirements (GDPR, DPDP, WCAG) using a knowledge graph.

## Screenshots

![AutoAudit Home and Report](https://github.com/user-attachments/assets/2447def6-5959-4e5b-ae38-2ce96f1b4160)
![AutoAudit Screenshot 2](https://github.com/user-attachments/assets/656f7b3f-dd2b-4ca5-a8ca-e79d88befd25)
![AutoAudit Screenshot 3](https://github.com/user-attachments/assets/b7410eb9-e35b-4322-b617-20b6ba3314b5)

## Key Features

- One-click scan from the web UI
- Multi-tool checks:
  - SSL/TLS analysis
  - HTTP security headers
  - Accessibility scan (axe-core)
  - Privacy policy checks
  - Nikto security scan
- Knowledge-graph mapping from findings to legal requirements/rules
- Regulation breakdown in the final report
- PDF report download
- Research Insights dashboard (`/stats`)

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui

**Backend**
- Node.js + Express
- Neo4j (knowledge graph)
- MongoDB (legacy/report support)
- Puppeteer, axe-core, SSL Labs, Nikto integration

## Project Structure

```text
AutoAudit/
├── client/   # React frontend
├── server/   # Express API + scan pipeline + graph logic
├── db/       # Seed data
├── logs/
└── reports/
```

## Requirements

- Node.js 18+
- npm
- Neo4j database
- MongoDB database
- Nikto installed (if running full Nikto checks locally)

## Environment Variables

Create `/home/runner/work/AutoAudit/AutoAudit/server/.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
NEO4J_URI=neo4j+s://your-instance
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password

# Optional (used by some scan paths)
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
AXE_CHROME=/path/to/chrome
GEMINI_API_KEY=optional_key
```

## Getting Started

### 1) Install dependencies

```bash
cd /home/runner/work/AutoAudit/AutoAudit/client && npm install
cd /home/runner/work/AutoAudit/AutoAudit/server && npm install
```

### 2) Seed / verify Neo4j

```bash
cd /home/runner/work/AutoAudit/AutoAudit/server
node scripts/testConnection.js
node scripts/seedNeo4jFromJson.js
```

### 3) Run backend

```bash
cd /home/runner/work/AutoAudit/AutoAudit/server
npm run dev
```

### 4) Run frontend

```bash
cd /home/runner/work/AutoAudit/AutoAudit/client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## API

### Start a scan

`POST /api/scan`

Request body:

```json
{
  "target": "https://example.com"
}
```

## How It Works

1. User submits a target URL in the frontend.
2. Backend runs scanner services (SSL, headers, accessibility, privacy, nikto).
3. Findings are ingested into Neo4j.
4. Cypher mapping rules connect findings to requirements/rules/regulations.
5. A structured compliance report is returned to the UI and can be exported as PDF.

## Available Scripts

### Client
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

### Server
- `npm run dev`
- `npm run start`

## Notes

- Server `npm test` is currently a placeholder and exits with error by design.
- Current frontend linting reports existing issues unrelated to this README update.

---
