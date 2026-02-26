# 🎭 InkHaven Chat

<div align="center">

![InkHaven Banner](https://img.shields.io/badge/InkHaven-Anonymous%20Chat-8b5cf6?style=for-the-badge&logo=chat&logoColor=white)

**Meet strangers. Stay anonymous. Find your vibe.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)

[🌐 Live Demo](https://www.inkhaven.in) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/beyourselfalways878-prog/inkhaven_chat/issues)

</div>

---

## ✨ What is InkHaven?

InkHaven is a **privacy-first anonymous chat platform** that connects strangers through meaningful conversations. Unlike traditional chat apps, InkHaven focuses on **mood-based matching** — pairing you with someone who's feeling the same vibe right now.

### 🎯 Key Differentiators

| Feature | InkHaven | Competitors |
|---------|----------|-------------|
| **Mood-Based Matching** | ✅ 5 moods | ❌ None |
| **Dual Moderation** | ✅ Safe + 18+ modes | ❌ One-size-fits-all |
| **Karma Reputation** | ✅ 4-tier system | ⚠️ Basic |
| **Icebreaker Generator** | ✅ 20+ prompts | ❌ None |
| **Text-First Design** | ✅ Focused | ⚠️ Video-centric |

---

## 🚀 Features

### 🌈 Mood-Based Matching
Select your current vibe before matching:
- 😌 **Chill** — Relaxed conversations
- 🌊 **Deep** — Meaningful discussions  
- 🎉 **Fun** — Games and jokes
- 💭 **Vent** — When you need to talk
- 🔮 **Curious** — Explore new ideas

### 🛡️ Dual Moderation System
Choose your experience on first visit:
- **Safe Mode** — Family-friendly, strict AI moderation, no adult content
- **18+ Mode** — Age-verified, standard moderation, adult conversations allowed

### ⭐ Karma Reputation
Earn karma through positive interactions:
- **Newcomer** (0-49) — Just joined
- **Trusted** (50-199) — Established member
- **Veteran** (200-499) — Experienced chatter
- **Legend** (500+) — Community pillar

### 🎲 Icebreaker Generator
Never run out of conversation starters with 20+ curated prompts across fun, deep, and creative categories.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15.5 (App Router) |
| **Frontend** | React 19, Tailwind CSS, Framer Motion |
| **Backend** | Supabase (Postgres, Realtime, Auth) |
| **State** | Zustand, React Query |
| **Validation** | Zod |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Monitoring** | Sentry |

---

## 📦 Project Structure

```
inkhaven-chat/
├── app/                    # Next.js App Router pages
│   ├── api/               # Consolidated API routes (12 endpoints)
│   ├── chat/              # Chat room pages
│   ├── legal/             # GDPR, Privacy, Terms, Cookies
│   └── quick-match/       # Mood-based matching page
├── components/            # React components
│   ├── Chat/              # MessageBubble, MessageList, etc.
│   ├── ModerationGate.tsx # Safe/18+ consent modal
│   ├── MoodSelector.tsx   # 5-mood picker
│   ├── KarmaBadge.tsx     # Reputation display
│   └── IcebreakerButton.tsx
├── lib/                   # Core utilities
│   ├── services/          # Business logic (ChatService, ModerationService)
│   ├── supabase.ts        # Database client
│   └── chatClient.ts      # Facade for real/mock chat
└── stores/                # Zustand state management
```

**Total: ~100 files** — Lean, maintainable codebase

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/beyourselfalways878-prog/inkhaven_chat.git
cd inkhaven_chat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

| `SENTRY_AUTH_TOKEN` | Optional: Error tracking |

---

## 📊 API Endpoints

All APIs are consolidated for maintainability:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/messages` | GET, POST | Fetch/send messages |
| `/api/matching` | POST | Enqueue/find match (action-based) |
| `/api/moderation` | GET, POST | Check content, report, ban |
| `/api/presence` | GET, POST | User presence status |
| `/api/rooms` | POST | Create/join rooms |
| `/api/reactions/toggle` | POST | Toggle message reactions |

---

## 🔐 Security

- ✅ **Anonymous Auth** — No personal data required
- ✅ **Mode-Aware Moderation** — Stricter in Safe Mode
- ✅ **Rate Limiting** — Redis-based protection
- ✅ **Row Level Security** — Supabase RLS policies
- ✅ **hCaptcha** — Bot protection
- ✅ **Self-Harm Detection** — Crisis support integration

---

## 📄 Legal

- [Privacy Policy](https://www.inkhaven.in/legal/privacy)
- [Terms of Service](https://www.inkhaven.in/legal/terms)
- [GDPR Compliance](https://www.inkhaven.in/legal/gdpr)
- [Cookie Policy](https://www.inkhaven.in/legal/cookies)

---

## 🤝 Contributing

This is a proprietary project. For inquiries, contact [namamicreations@zenithcryptoai.in](mailto:namamicreations@zenithcryptoai.in).

---

## 📜 License

© 2026 InkHaven. All rights reserved.

---

<div align="center">

**Built with 💜 for meaningful anonymous connections**

[Visit InkHaven](https://www.inkhaven.in)

</div>
