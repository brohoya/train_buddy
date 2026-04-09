# Train Buddy

AI-powered personal trainer that screams at you in the gym. Uses ElevenLabs Conversational AI for real-time voice interaction while tracking your workout.

## How It Works

```
[Phone Mic] → ElevenLabs STT → LLM (Goggins persona) → ElevenLabs TTS → [Your earbuds]
```

The app connects to an ElevenLabs Conversational AI Agent that handles the full voice pipeline. You talk, the AI trainer listens, tracks your reps, and motivates you with intense David Goggins-style coaching.

The agent has **client tools** that update your workout tracker in real-time:
- `complete_set` — Logs a finished set and updates the UI
- `get_workout_status` — Reads current workout progress
- `start_rest_timer` — Starts a visual countdown between sets

## Prerequisites

- Node.js v18+
- [ElevenLabs account](https://elevenlabs.io) with API access
- Expo development build (Expo Go is NOT supported due to native WebView requirements)
- iOS device or Android device for testing

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your ElevenLabs Agent

Go to [ElevenLabs Conversational AI](https://elevenlabs.io/app/conversational-ai) and create a new agent:

**Agent Name:** Train Buddy

**First Message:**
```
Let's GO! {{exercise_name}}, {{total_sets}} sets of {{target_reps}} at {{weight}} pounds! Get set up and tell me when you're ready for that first set! STAY HARD!
```

**System Prompt** (copy from `src/constants/prompts.ts`):
Use the `AGENT_SYSTEM_PROMPT` content — it configures the Goggins persona with workout tracking instructions.

**Voice:** Pick an intense, commanding male voice from the voice library. Recommendations:
- Search for "motivational" or "intense" voices
- Or use Voice Design to create: "intense, aggressive, drill-sergeant-style male voice with gravelly texture"

**LLM:** Claude or GPT-4 (select in agent settings)

**Model:** Flash v2.5 (lowest latency)

### 3. Configure Client Tools

In the agent's "Client Tools" section, add these three tools:

**complete_set**
- Description: `Log a completed set. Call this when the user finishes a set.`
- Parameters: `reps` (number, required) — "Number of reps completed"
- Wait for response: `true`

**get_workout_status**
- Description: `Get the current workout progress including sets completed and exercise details.`
- Parameters: none
- Wait for response: `true`

**start_rest_timer**
- Description: `Start a rest timer between sets. Shows a countdown on the user's screen.`
- Parameters: `seconds` (number, required) — "Rest duration in seconds (typically 60-120)"
- Wait for response: `true`

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your agent ID:
```
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
```

Find your agent ID in the ElevenLabs dashboard URL or agent settings.

### 5. Build and run

```bash
# Generate native projects
npx expo prebuild --clean

# Run on iOS device (microphone requires a real device)
npx expo run:ios --device

# Or Android
npx expo run:android --device
```

For development with tunnel (required for WebView mic access):
```bash
npx expo start --tunnel
```

## Project Structure

```
train_buddy/
├── app/
│   ├── _layout.tsx          # Root navigation (dark theme)
│   ├── index.tsx            # Home: exercise selection + config
│   └── session.tsx          # Active workout with voice agent
├── components/
│   ├── VoiceAgent.tsx       # DOM component — ElevenLabs conversation (runs in WebView)
│   └── ExerciseCard.tsx     # Exercise selection card
├── src/
│   ├── constants/
│   │   ├── exercises.ts     # Exercise presets
│   │   └── prompts.ts       # Agent system prompt + tool definitions
│   ├── hooks/
│   │   └── useWorkoutState.ts  # Workout state + client tool callbacks
│   └── types.ts             # TypeScript types
├── app.json                 # Expo config with mic permissions
└── package.json
```

## Architecture

The app uses Expo's [DOM Components](https://docs.expo.dev/guides/dom-components/) (`'use dom'` directive) to run the ElevenLabs `@11labs/react` SDK inside a WebView. This gives access to browser audio APIs (getUserMedia/WebRTC) while the rest of the app is fully native.

```
┌─────────────────────────────────────────────────────────┐
│  Native App (React Native)                              │
│  ├── Home Screen (exercise selection)                   │
│  └── Session Screen (workout tracker, rep counter)      │
│       │                                                 │
│       ├── [Native UI] Set dots, rep circle, rest timer  │
│       └── [WebView DOM Component] VoiceAgent.tsx        │
│            ├── @11labs/react useConversation             │
│            ├── WebRTC audio streaming                   │
│            └── Client tools → bridge → native state     │
├─────────────────────────────────────────────────────────┤
│  ElevenLabs Conversational AI Agent                     │
│  ├── STT (Scribe) — transcribes your voice              │
│  ├── LLM (Claude/GPT) — Goggins persona + workout logic │
│  └── TTS (Flash v2.5) — 75ms latency voice response    │
└─────────────────────────────────────────────────────────┘
```

## Notes

- **Expo Go is not supported** — DOM components require a development build
- **Use a real device** — the microphone doesn't work in simulators for WebView audio
- **Gym noise** — tune the agent's turn detection settings in ElevenLabs if gym noise causes issues
- **Cost** — ElevenLabs charges per audio minute (STT) and per character (TTS). A 1-hour session is moderate cost
- **API key security** — the agent ID is a public identifier (safe for client-side). Your ElevenLabs API key stays on their servers
