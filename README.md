Paste this as your README.md (it’s long + hackathon-ready, with setup, env, RLS SQL, troubleshooting, demo script). Good README templates recommend clear description, prerequisites, install/run steps, troubleshooting, and links/next steps.

YakSafe
YakSafe is a hyper‑local anonymous social feed inspired by Yik Yak, rebuilt as a hackathon MVP with an AI safety gate that blocks harmful posts before they reach the feed.

Table of Contents
Why YakSafe

Core Features

Tech Stack

Architecture Overview

Project Structure

Prerequisites

Quickstart (Run Locally)

Supabase Setup

Database + RLS (Required)

Environment Variables

Demo Script (2–3 minutes)

Troubleshooting

Roadmap

License

Why YakSafe
Anonymous + hyper‑local apps can be fun, but they often fail because moderation comes too late. YakSafe adds a “safety gate” check at posting time and includes basic community mechanics (zones, points, realtime feed).

Core Features
AI safety gate (backend moderation API)

Blocks unsafe text and returns a reason

Allows safe posts to continue

Hyper‑local zones

Zone filter: Campus, Bagru, Jaipur

Realtime feed updates

New posts appear instantly using Supabase Realtime

Gamification

Posts earn YakPoints when safe

Auth + Dashboard

Login/Register (Supabase Auth)

Dashboard shows quick stats (points, post count, reports)

Tech Stack
Frontend: React + Vite

Backend API: Python Flask (moderation service)

Database/Auth/Realtime: Supabase (Postgres + RLS + Realtime)

Architecture Overview
User types a post in the frontend.

Frontend calls the Flask API: POST /moderate with { text }.

If safe → frontend inserts the post into Supabase posts.

Supabase Realtime pushes INSERT events to other clients in the same zone.

Project Structure
text
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── (optional) .venv/
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── supabaseClient.js
    ├── index.html
    ├── package.json
    └── vite.config.js
Prerequisites
Node.js 18+

Python 3.10+

A Supabase project (URL + anon key)

Quickstart (Run Locally)
1) Start backend (Flask)
Open Terminal 1:

bash
cd backend

python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python app.py
Backend should run on:

http://127.0.0.1:5000/health

2) Start frontend (Vite)
Open Terminal 2:

bash
cd frontend
npm install
npm run dev
Vite prints a URL (usually http://localhost:5173).

Supabase Setup
1) Create tables (minimum)
Create a posts table with (minimum recommended columns):

id (uuid / bigint) primary key

text (text)

author (text)

points (int)

zone (text)

user_id (uuid) ← important for RLS

hidden (bool) default false

created_at (timestamptz) default now()

Optional:

reported (bool) default false

2) Enable Realtime (if you want live updates)
Supabase Dashboard → Database → Replication / Publications → ensure posts is included in supabase_realtime publication.

Database + RLS (Required)
If you see:

new row violates row-level security policy for table "posts"

It means Row Level Security is enabled but you don’t have policies that allow inserts/selects. Supabase RLS requires explicit policies per operation.
​

Run this SQL in Supabase SQL editor
Adjust names only if your schema differs:

sql
-- Ensure columns exist (safe to re-run)
alter table public.posts
  add column if not exists user_id uuid;

alter table public.posts
  add column if not exists hidden boolean default false;

alter table public.posts
  add column if not exists reported boolean default false;

alter table public.posts
  add column if not exists zone text default 'Campus';

alter table public.posts
  add column if not exists created_at timestamptz default now();

-- Enable RLS
alter table public.posts enable row level security;

-- Allow authenticated users (including anonymous sessions) to read visible posts
drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible"
on public.posts
for select
to authenticated
using (hidden = false);

-- Allow authenticated users to insert only their own rows
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);
Important: the frontend must insert user_id = current user id. Otherwise insert will fail.

Environment Variables
Frontend: frontend/.env
Create:

text
VITE_API_BASE=http://127.0.0.1:5000
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
Backend
This MVP does not require backend env vars (simple heuristic moderation).
If you later add model keys, create backend/.env and load them.

Demo Script (2–3 minutes)
Open Home page and explain the idea: “Reviving hyper‑local anonymous feed with safety gate.”

Go to /app.

Select a zone (Campus/Bagru/Jaipur).

Click Seed demo to populate posts.

Try posting:

Safe: This is awesome

Unsafe: hate → should block with reason

Open a second tab in the same zone → show realtime posts.

Go to /auth, register/login, then open /dashboard.

Troubleshooting
Backend health fails
Confirm backend terminal shows it’s running.

Test: http://127.0.0.1:5000/health

Frontend can’t reach backend (Axios “Network Error”)
Ensure VITE_API_BASE=http://127.0.0.1:5000

Restart Vite after editing .env

Supabase insert error (RLS)
Run the SQL policies from the Database + RLS section.

Ensure frontend inserts user_id and it matches auth.uid() (current session).
​

Realtime not working
Ensure posts is added to Supabase Realtime publication.

Ensure your .on("postgres_changes", ...) subscription is active.

1) Add screenshots (10 minutes)
Take 3 screenshots: Home, App feed, Dashboard.

Create a folder:

powershell
mkdir screenshots
Put images like:

screenshots/home.png

screenshots/feed.png

screenshots/dashboard.png

Add to README:

text
## Screenshots



GitHub renders images fine with relative paths in Markdown.
​

2) Add .env.example (2 minutes)
Create frontend/.env.example so others can run it:

text
VITE_API_BASE=http://127.0.0.1:5000
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
3) Sanity-check “fresh clone works” (5 minutes)
In a new folder:

powershell
git clone <your-repo-url>
cd <repo>

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
New terminal:

powershell
cd frontend
npm install
npm run dev
Fix anything missing in README until these steps work.

4) Deploy a demo (optional but huge for hackathon)
If you can, deploy frontend (Vite) to GitHub Pages/Netlify and backend (Flask) to Render/Railway. Vite’s deploy guide uses npm run build and deploys the dist folder for static hosting.
​

5) Create a release tag (polish)
On GitHub → Releases → “Draft a new release”, tag it v0.1.0 and paste your demo + setup notes. GitHub supports creating releases/tags from the UI (or GitHub CLI).
​

6) Do a final “judge flow” in README
Add a short section “Demo in 30 seconds” + the exact URLs + default accounts (if any).

Roadmap
Better moderation model + per‑zone safety tuning

Rate limiting + anti-spam

Admin review queue for reports

Reputation system beyond points

“Hot / New / Rising” sorting + trending topics

License
MIT (recommended for hackathons). If you don’t want open source yet, change to “All rights reserved”.

