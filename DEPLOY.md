# HHOF Board Simulator — Deployment Guide

## What You're Deploying
- `index.ts` → Supabase Edge Function (`hhof-board-sim`)
- `board-sim.html` → Local file (open in browser or host anywhere)

---

## Step 1 — Deploy the Edge Function to Supabase

### Prerequisites
- Supabase CLI installed: https://supabase.com/docs/guides/cli
- Logged in: `supabase login`
- Linked to your project: `supabase link --project-ref zgddygbaqdjoqavjsasv`

### Deploy
```bash
cd C:\Users\Robin\OneDrive\Apps\hhof-board-sim
supabase functions deploy hhof-board-sim --no-verify-jwt
```

### Set the Gemini API key as a secret
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```
Get the Gemini API key from:
- console.cloud.google.com → Project: social-generator-496402
- Account: usa80plushhof@gmail.com
- APIs & Services → Credentials

---

## Step 2 — Get Your Supabase Anon Key

1. Go to https://supabase.com/dashboard/project/zgddygbaqdjoqavjsasv
2. Settings → API
3. Copy the `anon public` key

---

## Step 3 — Update board-sim.html

Open `board-sim.html` and replace this line near the top of the script:
```javascript
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```
With your actual anon key. The anon key is safe to include in HTML — it's public by design.

---

## Step 4 — Test It

Open `board-sim.html` in Chrome or Edge and try a quick starter button.
The board should respond within 2-3 seconds.

---

## Step 5 — Share with Mike

Two options:
1. **Share the file** — email `board-sim.html` directly. Mike opens it locally.
2. **Host it** — drop `board-sim.html` into your existing Firebase/Vercel hosting
   and send Mike a URL. No server needed — it's a single static file.

---

## Folder Structure
```
C:\Users\Robin\OneDrive\Apps\hhof-board-sim\
├── index.ts          ← Supabase Edge Function (deploy this)
├── board-sim.html    ← The simulator (open in browser)
└── DEPLOY.md         ← This file
```

---

## Troubleshooting

**"Connection error" in the simulator**
- Check Supabase Edge Function logs: Dashboard → Edge Functions → hhof-board-sim → Logs
- Verify GEMINI_API_KEY secret is set: `supabase secrets list`
- Run the Gemini disable/enable toggle if you see limit:0 errors (see HHOF Social Media Generator Notion page)

**Mic button not working**
- Must use Chrome or Edge — Safari and Firefox don't support Web Speech API
- Check browser mic permissions

**Votes not updating**
- The Gemini model occasionally drops the JSON block — this is normal
- The conversation still works, votes just don't update that turn
