# VoteGuide India

> An AI-powered election companion for every Indian citizen — understand elections, find polling booths, track timelines, and get personalised guidance through a conversational interface.

**Live Demo:** https://voteguide-india-296722128306.asia-south1.run.app

**GitHub:** https://github.com/arjunmangarath/voteguide-india

---

## What It Does

VoteGuide India is a full-stack civic-tech assistant for every Indian citizen. It helps voters — first-time and experienced alike — navigate the Indian electoral system through:

- A **personalised 4-step onboarding wizard** that captures your voter type, state, preferred language, and interests
- An **AI chat assistant** powered by Gemini 2.5 Flash that auto-generates contextual opening questions based on your profile and answers election-related questions in plain language
- A **live election news feed** with curated and dynamic news from the Election Commission of India
- An **election timeline** showing upcoming and past elections (last 12 months) with phase-wise dates, MCC dates, and results
- A **polling booth map** that shows nearby voting locations — centered on your selected state or your current GPS location — with a clean white map theme and orange markers for each booth

---

## Google Services Used (5 Services)

| # | Service | How It Is Used |
|---|---|---|
| 1 | **Vertex AI (gemini-2.5-flash)** | Core AI brain via Vertex AI. Handles all election Q&A, personalised by user's state, voter type, and selected interests. Responds in 11 Indian regional languages. Multi-model fallback: 2.5-flash → 2.0-flash → 2.0-flash-lite. |
| 2 | **Google Custom Search API** | Fetches live Indian election news dynamically using state-aware queries (`{state} election 2026 India`). Falls back to curated ECI content if quota is unavailable. |
| 3 | **Firebase Firestore** | Stores anonymous user sessions with profile data (state, voter type, interests). No login required — sessions are UUID-keyed, persisting across page refreshes. |
| 4 | **Maps JavaScript API** | Interactive white-themed map showing user's state or GPS location with polling booth markers via the Places API `nearbySearch`. |
| 5 | **Google Cloud Run** | Hosts the entire application as a containerised service — multi-stage Docker build serving both the Express API and the React SPA from a single Cloud Run instance. |

---

## Architecture

```
Browser
  │
  ├── React (Vite) SPA
  │     ├── Wizard → 3-step onboarding (state, voter type, interests)
  │     ├── Dashboard
  │     │     ├── LEFT: Election News + Polling Booth Map (Google Maps)
  │     │     ├── CENTER: Gemini AI Chat (auto-triggered from wizard interests)
  │     │     └── RIGHT: Election Timeline (upcoming + past 12 months)
  │     └── Anonymous session ID (UUID in localStorage → x-session-id header)
  │
  └── Express API (Node.js)
        ├── POST /api/auth/profile   → Firestore read/write (session profile)
        ├── PUT  /api/auth/profile   → Firestore write (wizard save)
        ├── POST /api/chat           → Gemini 2.5 Flash (chat history aware)
        ├── GET  /api/news           → Custom Search API (state-filtered)
        ├── GET  /api/calendar       → Static election calendar (2024–2026)
        └── GET  /api/config         → Returns Maps API key for runtime loading
```

**No login required.** Each user gets a UUID stored in `localStorage`. This ID is sent as the `x-session-id` header on every API request and used as the Firestore document key. Firestore stores the wizard profile (state, voter type, interests) — no personal data collected.

---

## Features in Detail

### Onboarding Wizard
- **Step 1** — First-time voter or experienced voter?
- **Step 2** — State selection with live search filter (all 32 Indian states and UTs)
- **Step 3** — Language selection: auto-suggests the regional language for the chosen state (e.g. Kannada for Karnataka), 12 languages supported
- **Step 4** — Interest multi-select: Register to Vote / Understand the Process / Track Elections / Find My Booth
- Progress bar across all 4 steps with animated transitions
- "Skip for now" option on the last step

### AI Chat (Gemini 2.5 Flash)
- **Auto-triggered opening message** — based on your wizard selections, an initial question is automatically sent 800ms after dashboard loads (e.g. a first-time Bihar voter selecting "Understand the Process" gets: *"I am a first-time voter. I am from Bihar. Please explain how Indian elections work..."*)
- **Full markdown rendering** — AI replies render with bold headings, bullet lists, numbered steps, horizontal dividers, and inline code — not raw asterisks
- **Context-aware** — every Gemini request includes `[User context: first-time voter from Bihar]` prefix, so answers are personalised
- **Chat history** — last 10 messages sent as history on each request (leading model messages filtered to avoid Gemini validation errors)
- **Quick action buttons** — Show Timeline / How to Register / Find My Booth / Latest News / Voting Process
- **Politically neutral** — system prompt enforces neutrality, no party/candidate recommendations
- **Multilingual** — Full language mode: select a regional language in the wizard or toggle it in the header; the opening greeting, all AI replies, and busy-state messages are all returned in the selected language (11 languages: Hindi, Telugu, Bengali, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu)

### Election News
- Fetches live news via Google Custom Search API with state-aware query
- Falls back to curated ECI/election content (6 items) when API quota is unavailable
- State-specific fallback news for Bihar and Delhi
- **Collapsed view**: 3 news items visible, "▼ Show 3 more" toggle expands the rest
- Refresh button to re-fetch with current state

### Election Timeline
- **Upcoming** section: all future elections sorted chronologically with colour-coded event types (Voting=saffron, Results=green, Registration=blue, MCC=purple)
- **Past (Last 12 months)** section: completed elections shown at 50% opacity with "Completed" badge
- "Xd left" badge for events within 30 days
- Covers: Bihar 2025, Delhi 2025, Maharashtra 2024, Haryana 2024, J&K 2024, Jharkhand 2024, and all major 2026 state/local elections

### Polling Booth Map
- **White/light map theme** — clean, minimal, easy to read
- **State-based centering** — if you selected Bihar in the wizard, the map centers on Bihar at zoom 10
- **Geolocation fallback** — if no state is selected, the browser requests your GPS location and centers the map there (zoom 12)
- **Polling booth markers** — two parallel Places API searches:
  1. Keyword: `"polling booth election booth ECI"` within 25km
  2. Type: `local_government_office` within 25km
- Orange saffron circle markers with a click-to-expand info window showing the location name
- Blue arrow marker for the center point (your state/location)
- Maps API key served at runtime via `/api/config` — never baked into the build

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| AI Rendering | react-markdown (structured chat replies) |
| Backend | Node.js 20, Express 4 |
| Auth/DB | Firebase Firestore (anonymous UUID sessions) |
| AI | Google Gen AI SDK (`@google/genai`) with Vertex AI backend |
| Maps | Google Maps JavaScript API + Places API |
| Search | Google Custom Search JSON API |
| Container | Docker (multi-stage: Node build → Express serve) |
| Hosting | Google Cloud Run (asia-south1, 512Mi, 0–3 instances) |
| Secrets | Google Cloud Secret Manager (Firebase service account) |
| CI Build | Google Cloud Build |

---

## Project Structure

```
voteguide-india/
├── Dockerfile                  # Multi-stage build (client → server)
├── firebase.json               # Firestore rules config
├── firestore.rules             # Session-scoped read/write rules
├── client/
│   ├── src/
│   │   ├── App.jsx             # Routes: /wizard → /dashboard
│   │   ├── session.js          # UUID session ID (localStorage)
│   │   ├── pages/
│   │   │   ├── Wizard.jsx      # 3-step onboarding
│   │   │   └── Dashboard.jsx   # 3-panel main view
│   │   └── components/
│   │       ├── Chat/
│   │       │   └── ChatPanel.jsx       # Gemini chat with markdown
│   │       ├── Map/
│   │       │   └── ConstituencyMap.jsx # Maps + Places API
│   │       ├── News/
│   │       │   └── NewsCard.jsx        # News item card
│   │       └── Timeline/
│   │           └── ElectionTimeline.jsx # Timeline with past/upcoming
│   └── .env.example
└── server/
    ├── src/
    │   ├── index.js            # Express app (trust proxy, static serve)
    │   ├── middleware/
    │   │   ├── sessionMiddleware.js  # Validates x-session-id header
    │   │   └── rateLimiter.js        # 10 req/min chat, 30 req/min general
    │   ├── routes/
    │   │   ├── auth.js         # Profile GET/PUT (Firestore)
    │   │   ├── chat.js         # Gemini chat endpoint
    │   │   ├── news.js         # Custom Search news endpoint
    │   │   └── calendar.js     # Election calendar endpoint
    │   └── services/
    │       ├── firebase.js     # Admin SDK init (supports JSON env var)
    │       ├── gemini.js       # Gemini 2.5 Flash with system prompt
    │       ├── search.js       # Custom Search + curated fallback
    │       └── calendar.js     # Election event data + isPast flag
    ├── tests/
    │   ├── middleware/
    │   │   └── auth.test.js            # Session middleware (7 tests)
    │   └── routes/
    │       ├── auth.test.js            # Profile GET/PUT (8 tests)
    │       ├── chat.test.js            # Chat endpoint (8 tests)
    │       ├── chat-history.test.js    # Chat history (3 tests)
    │       ├── calendar.test.js        # Calendar endpoint (5 tests)
    │       ├── news.test.js            # News endpoint (4 tests)
    │       └── config.test.js          # Config endpoint (2 tests)
    └── .env.example
```

---

## Local Development

### Prerequisites
- Node.js 20+
- A GCP project with the following APIs enabled:
  - Gemini API (`generativelanguage.googleapis.com`)
  - Custom Search API (`customsearch.googleapis.com`)
  - Maps JavaScript API (`maps-backend.googleapis.com`)
  - Geocoding API (`geocoding-backend.googleapis.com`)
  - Places API (`places-backend.googleapis.com`)
  - Firebase Firestore

### Setup

```bash
# 1. Clone
git clone https://github.com/arjunmangarath/voteguide-india.git
cd voteguide-india

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies
cd ../client && npm install

# 4. Configure server environment
cp server/.env.example server/.env
```

Fill in `server/.env`:

```env
# For local dev: use an AI Studio API key (Vertex AI is used in production via ADC)
GEMINI_API_KEY=your_gemini_api_key
CUSTOM_SEARCH_API_KEY=your_custom_search_api_key
CUSTOM_SEARCH_ENGINE_ID=your_programmable_search_engine_id
GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
MAPS_API_KEY=your_maps_api_key
PORT=8080
```

> **Note:** In production (Cloud Run), the Gemini backend uses **Vertex AI** with Application Default Credentials — no `GEMINI_API_KEY` needed. Enable `aiplatform.googleapis.com` and grant `roles/aiplatform.user` to the Cloud Run service account.

```bash
# 5. Download Firebase service account JSON from Firebase Console
#    → Project Settings → Service Accounts → Generate new private key
#    Save as server/firebase-service-account.json

# 6. Start dev servers (two terminals)
cd server && npm run dev    # API at http://localhost:8080
cd client && npm run dev    # UI at http://localhost:5173
```

The Vite dev server proxies `/api/*` to `localhost:8080`.

### Run Tests

```bash
cd server && npm test
```

36 tests across 7 suites with coverage reporting:
- `middleware/auth.test.js` — session middleware (valid UUID, boundary lengths, missing/whitespace headers)
- `routes/auth.test.js` — profile GET (existing/new user), PUT (valid, invalid voterType, missing state), Firestore errors
- `routes/chat.test.js` — success, empty message, no session, valid history, 1000-char boundary, 1001-char → 400, rate-limited → friendly message, Gemini error → 500
- `routes/news.test.js` — success, no session, state param passthrough, service error → 500
- `routes/calendar.test.js` — returns array, no session, required fields, state param passthrough, service error → 500
- `routes/chat-history.test.js` — GET /api/chat/history success, no session, Firestore error → 500
- `routes/config.test.js` — returns mapsKey when set, returns empty string when unset

---

## Deployment to Google Cloud Run

### 1. Build & push image

```bash
gcloud builds submit \
  --tag gcr.io/YOUR_PROJECT_ID/voteguide-india \
  --project YOUR_PROJECT_ID
```

### 2. Store Firebase service account in Secret Manager

```bash
gcloud secrets create firebase-service-account-json \
  --project YOUR_PROJECT_ID \
  --data-file=server/firebase-service-account.json

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding firebase-service-account-json \
  --project YOUR_PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy

```bash
gcloud run deploy voteguide-india \
  --image gcr.io/YOUR_PROJECT_ID/voteguide-india \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --project YOUR_PROJECT_ID \
  --set-env-vars "GEMINI_API_KEY=...,CUSTOM_SEARCH_API_KEY=...,CUSTOM_SEARCH_ENGINE_ID=...,GOOGLE_CALENDAR_API_KEY=...,MAPS_API_KEY=..." \
  --set-secrets "FIREBASE_SERVICE_ACCOUNT_JSON=firebase-service-account-json:latest" \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3
```

### 4. Set Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## API Reference

All endpoints require the `x-session-id` header (UUID, min 10 characters).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/profile` | Get session profile from Firestore |
| `PUT` | `/api/auth/profile` | Save wizard answers to Firestore |
| `POST` | `/api/chat` | Send message to Gemini, returns `{ reply }` |
| `GET` | `/api/news?state=Bihar` | Fetch election news (state-filtered) |
| `GET` | `/api/calendar?state=Bihar` | Get election events with `isPast` flag |
| `GET` | `/api/config` | Returns `{ mapsKey }` for frontend Maps loading |

### Chat request body
```json
{
  "message": "How do I register as a voter in India?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "model", "content": "Namaste! How can I help?" }
  ]
}
```

---

## Design Decisions

### No Login Required
Firebase Auth was blocked by a Google Workspace org policy (`identitytoolkit.googleapis.com` disabled for the account used). Rather than fight the org policy, authentication was removed entirely — sensible for an information-gathering tool with no personal data. Anonymous UUID sessions stored in Firestore provide the same persistence benefits without friction.

### Gemini System Prompt (Politically Neutral)
The system prompt explicitly instructs Gemini to:
- Never recommend any party, coalition, or candidate
- Cite the Election Commission of India as the authority
- Personalise answers by the user's state and voter type
- Fall back to suggesting `eci.gov.in` for official up-to-date information

### Graceful Degradation
- If Custom Search API returns an error → curated ECI fallback news is served
- If Maps API key isn't available → loading state shown, no crash
- If Firestore write fails on wizard save → navigation still proceeds
- `Promise.allSettled` in Dashboard ensures news failure doesn't prevent calendar or profile from loading

### Runtime API Key Loading for Maps
The React build is done inside Docker (Cloud Build has no `.env.local`). Instead of baking `VITE_MAPS_API_KEY` at build time, the Maps key is served by `/api/config` and loaded into the `<script>` tag at runtime — no re-build needed when rotating the key.

---

## Election Data Covered

| Election | Date | Type |
|---|---|---|
| Bihar Assembly — Phase 1 | Oct 18, 2025 | Voting |
| Bihar Assembly — Phase 2 | Nov 5, 2025 | Voting |
| Bihar Assembly — Results | Nov 8, 2025 | Results |
| Model Code of Conduct — Bihar | Oct 1, 2025 | MCC |
| Delhi Municipal Elections | Feb 15, 2026 | Voting |
| Voter Registration Deadline | Mar 15, 2026 | Registration |
| Kerala Local Body Elections | Apr 10, 2026 | Voting |
| Tamil Nadu Local Body Elections | May 20, 2026 | Voting |
| West Bengal Local Body Elections | Jun 1, 2026 | Voting |
| Maharashtra Council Elections | Jun 15, 2026 | Voting |
| Uttar Pradesh Local Body Elections | Jul 10, 2026 | Voting |
| Karnataka Local Body Elections | Aug 20, 2026 | Voting |
| Delhi Assembly Election | Feb 5, 2025 | Past |
| Haryana Assembly Election | Oct 5, 2024 | Past |
| Jammu & Kashmir Assembly — 3 Phases | Sep–Oct 2024 | Past |
| Maharashtra Assembly Election | Nov 20, 2024 | Past |
| Jharkhand Assembly Election | Nov 13, 2024 | Past |

---

## Feature Checklist

| Feature | Status |
|---|---|
| Public GitHub repository | ✅ github.com/arjunmangarath/voteguide-india |
| Live URL | ✅ voteguide-india-296722128306.asia-south1.run.app |
| 5 Google Services | ✅ Vertex AI, Custom Search, Firestore, Maps JS API, Cloud Run |
| Interactive election assistant | ✅ Gemini chat with auto-triggered personalised opening |
| Timeline and steps | ✅ Election timeline + wizard-driven step-by-step guidance |
| Multilingual | ✅ 11 Indian regional languages, full UI + AI response localisation |
| Accessible | ✅ Semantic HTML, keyboard-navigable, mobile tabs |
| Tests | ✅ 36 Jest + Supertest tests across 7 suites (all passing, with coverage) |
