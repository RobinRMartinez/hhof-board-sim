# HHOF Board Simulator

An AI-powered board meeting simulation for the USA 80+ Hockey Hall of Fame. Users play the role of committee chair and must propose a candidate for induction, making their case to three distinct board members — each with their own personality, priorities, and agenda.

🔗 **Live App:** https://hhof-tools.web.app/board-sim.html

---

## What It Does

- Simulates a real HHOF board induction meeting
- Three AI-powered board member personas respond in character to every message
- Live vote tracker updates as you make your case
- Voice input supported (Chrome/Edge)
- Mobile friendly

---

## Board Members

| Member | Role | Personality |
|---|---|---|
| Fred Merchant | Founder | Author of *The Real Ironmen of Hockey*, emotional, story-driven, heart of the org |
| Mike | Secretary | Decades-long Toronto HHOF volunteer, hockey historian, budget-conscious |
| Patrick Long | Events & Experience | Inductee communication, event planning, travel coordination |

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Model | Gemini 2.5 Flash (Google Cloud) |
| Backend | Supabase Edge Function |
| Frontend | Plain HTML/CSS/JS |
| Hosting | Firebase Hosting |
| Version Control | GitHub |

---

## Architecture

```
board-sim.html (browser)
      ↓
Supabase Edge Function: hhof-board-sim
      ↓
Gemini 2.5 Flash API
      ↓
Three persona responses + vote JSON
      ↓
UI updates vote tracker and chat
```

The Gemini API key is stored as a Supabase secret — never exposed in the browser.

---

## Local Development

### Prerequisites
- Supabase CLI
- Firebase CLI
- Git

### Setup
```bash
git clone https://github.com/RobinRMartinez/hhof-board-sim.git
cd hhof-board-sim
```

Add your Supabase anon key to `board-sim.html`:
```javascript
const SUPABASE_ANON_KEY = "your_anon_key_here";
```

### Deploy Edge Function
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase functions deploy hhof-board-sim --no-verify-jwt
```

### Deploy to Firebase
```bash
copy board-sim.html public\board-sim.html
firebase deploy --only hosting
```

---

## Deployment Workflow

After any changes:

```bash
# If Edge Function changed
supabase functions deploy hhof-board-sim --no-verify-jwt

# If HTML changed
copy board-sim.html public\board-sim.html
firebase deploy --only hosting

# Commit to GitHub
git add .
git commit -m "your message"
git push
```

---

## Background

This project was inspired by a concept from a healthcare finance educator building AI-driven case studies where students interview hospital executives in real time. The HHOF board simulation applies the same concept — replacing static case analysis with live, role-playing AI conversations.

---

## About HHOF

The USA 80+ Hockey Hall of Fame honors hockey players and builders aged 80+ who are actively involved in the game. Founded in 2024 by Fred Merchant, author of *The Real Ironmen of Hockey*.

🌐 [usa80plushockeyhalloffame.com](https://usa80plushockeyhalloffame.com)

---

*Built by Robin Martinez — June 2026*
