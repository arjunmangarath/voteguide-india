# VoteGuide India

An intelligent assistant that helps Indian citizens understand the election process, timelines, and steps — powered by Google AI and deployed on Google Cloud Run.

## Chosen Vertical

**Civic Tech / Election Literacy** — helping voters across all Indian states understand elections interactively.

## Approach & Logic

VoteGuide India is a full-stack AI assistant with three layers:

1. **Onboarding Wizard** — personalises the experience by capturing the user's state and voter type (first-time / experienced)
2. **Dashboard** — three-panel view showing live election news, an AI chat assistant, and an election timeline + constituency map
3. **Gemini-powered Chat** — context-aware responses tailored to the user's state and voter profile, covering all Indian elections nationally

The assistant uses the user's profile context in every Gemini prompt, so responses are personalised (e.g. a first-time voter in Tamil Nadu gets different guidance than an experienced voter asking about Rajya Sabha elections).

## Google Services Used

| Service | Purpose |
|---|---|
| **Gemini API (gemini-1.5-flash)** | Core AI brain — answers all election questions |
| **Custom Search API** | Fetches live Indian election news dynamically by user's state |
| **Google Calendar API** | Surfaces upcoming election dates and phases |
| **Maps JavaScript API** | Constituency map centered on user's selected state |
| **Firebase Auth** | Google Sign-in + Email/Password authentication |
| **Firebase Firestore** | Chat history persistence + user profile storage |

## How the Solution Works

```
User → Firebase Auth → Wizard (personalise) → Dashboard
                                                 ├── News feed (Custom Search API, state-aware)
                                                 ├── Chat (Gemini API, context-aware)
                                                 ├── Timeline (election calendar data)
                                                 └── Map (Maps JS API, user's state)
```

Every API route on the backend verifies the Firebase ID token before processing, ensuring secure access to all Google services.

## Tech Stack

- **Backend:** Node.js + Express, deployed on Google Cloud Run
- **Frontend:** React + Vite + Tailwind CSS
- **Container:** Docker (multi-stage build)
- **Auth & DB:** Firebase Auth + Firestore

## Assumptions

- Covers all Indian elections (Lok Sabha, Rajya Sabha, all state assemblies, local bodies) — not limited to one state
- English-first UI; Gemini responds in the user's language if they write in Hindi or a regional language
- Election calendar data is seeded with known 2025-2026 Indian election schedules; dynamic news via Custom Search keeps content current
- Maps shows a state-level view for constituency awareness; booth-level lookup requires ECI's Voter Helpline integration (out of scope)

## Local Development

```bash
# 1. Clone and install
cd server && npm install
cd ../client && npm install

# 2. Set up environment variables
cp server/.env.example server/.env        # fill in your keys
cp client/.env.example client/.env.local  # fill in Firebase config

# 3. Add firebase-service-account.json to server/

# 4. Run dev servers
cd server && npm run dev    # http://localhost:8080
cd client && npm run dev    # http://localhost:5173

# 5. Run tests
cd server && npm test
```

## Deployment (Google Cloud Run)

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/voteguide-india
gcloud run deploy voteguide-india \
  --image gcr.io/YOUR_PROJECT_ID/voteguide-india \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=...,CUSTOM_SEARCH_API_KEY=...,CUSTOM_SEARCH_ENGINE_ID=...,GOOGLE_CALENDAR_API_KEY=...
```
