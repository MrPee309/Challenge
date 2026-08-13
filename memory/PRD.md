# TCHAK 🔥 — Product Requirements Document

## Original Problem Statement
Build a mobile-first challenge/competition social platform designed **specifically for Haitian youth** (teens & young adults in Haiti). Not a generic global app with "Haiti" as a label — the content, imagery, language and atmosphere must feel naturally relevant to young Haitians: energetic, fun, social, competitive, modern, creative. Core loop: **CHALLENGE → PARTICIPATE → VOTE → COMPETE → WIN**. No news, no politics, no negative imagery. Celebrate creative, connected, competitive Haitian youth.

## User Choices
- Auth: JWT (email + password)
- Participation: photo/video upload (Emergent Object Storage)
- AI: none
- Primary language: Haitian Creole (architecture ready for FR/EN switching)
- App name: chosen by builder → **TCHAK 🔥** (tagline: "Espas pa nou")

## Architecture
- **Frontend**: React (mobile-first, max-w-md), TailwindCSS, shadcn/ui, lucide-react, sonner, framer-based CSS animations. Dark neo-brutalist theme: bg #050505, primary Cyber Yellow #FFE800, coral #FF4D4D, cyan #00E5FF. Fonts: Outfit (display) + Plus Jakarta Sans (body).
- **Backend**: FastAPI, JWT Bearer auth (token in response body, stored in localStorage `tchak_token`), MongoDB (motor), Emergent Object Storage for media.
- **i18n**: LanguageContext + translations.js (ht/fr/en), Kreyòl default.

## User Personas
- Haitian teenagers / young adults, mobile-heavy, into music, dance, fashion, sports, gaming, humor, culture.

## Core Requirements (static)
- Auth (register/login) in Kreyòl
- Home: Challenge Jodi a (featured), Today/Trending tabs, trending marquee
- Challenge detail: participations ranked by votes, participate CTA
- Upload participation: pick challenge, upload photo/video, caption
- Vote (toggle) on participations
- Leaderboard: Top 10 participations + Top creators
- Profile: avatar, location, stats (wins/votes/posts), own participations, logout, language switch
- Discover: 11 categories, filterable challenge grid

## Implemented (2026-06)
- ✅ JWT auth (register/login/me) — Kreyòl error messages
- ✅ 11 seeded challenges across all categories + 9 seeded users + participations with realistic Haitian names & locations
- ✅ Home feed, Discover, Challenge detail, Upload (real object-storage media), Voting, Leaderboard, Profile
- ✅ Language switcher (Kreyòl / Français / English)
- ✅ Media upload to Emergent Object Storage, served via /api/media/{id}
- ✅ Privacy: email only exposed to the authenticated user (not public profiles/leaderboard)
- ✅ Tested: backend 14/14 pytest pass; frontend 100% e2e (interactivity, auth, nav, vote, upload, logout, lang switch)

## Backlog / Remaining
- P1: Comments on participations; follow/friends; share sheet
- P1: Real-time vote counts / notifications
- P2: Challenge creation by users; countdown timers per challenge; weekly winners archive
- P2: Video autoplay in feed; multi-media participations
- P2: CORS hardening (drop allow_credentials or set explicit origins), media Cache-Control headers

## Test Credentials
- test@tchak.ht / test123 ; demo users password: tchak123 (e.g. kendy_pap@tchak.ht)
