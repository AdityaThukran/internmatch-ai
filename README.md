# InternMatch AI — Smart Career & Internship Discovery System

![InternMatch AI](client/public/images/ai-matching.jpg)

An AI-driven career recommendation, real-time multi-platform internship aggregator, and ATS-tailored auto-application platform built with a high-performance **Express** backend, **React 18** client (styled with the signature **HelloBonsai** emerald design language), and **Python NLP Semantic Engine**.

---

## 🚀 Key Features

- **🌐 Real-Time Internship Aggregation**: Scrapes and aggregates authentic, live internship postings from **LinkedIn**, **Internshala**, **Unstop**, and remote job boards every 60s with automatic deduplication and URL verification.
- **📄 AI Resume Extractor & Keyword Matcher**: Upload any resume (PDF, DOCX, TXT) via PyMuPDF to automatically extract skills, education, and experience.
- **🎯 Smart Fit Re-ranking**: Scores opportunities using cosine similarity against the candidate's profile with matching percentage pills and missing skill insights.
- **⚡ AI Tailored SOP & Auto-Apply**: Instant generation of structured, ATS-optimized Statements of Purpose tailored specifically to the company and role with 1-click status updates.
- **📊 Kanban Live Application Tracker**: Visual multi-stage tracking (`Saved`, `Applied`, `Interviewing`, `Offers`) with custom notes, metrics, and milestone logging.
- **🔔 Real-Time Notification Center**: Bell swing animations, glowing radar pulse badges, per-item deletion, category filtering, and automated pipeline milestone alerts.
- **📱 Android & Mobile Optimized**: Responsive bottom navigation, swipeable filter chips, fluid touch targets, and zero horizontal overflow on small screens.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Lucide/Feather Icons (`react-icons`), Axios, HelloBonsai UI Design System.
- **Backend**: Node.js, Express, MongoDB (Mongoose) with In-Memory fallback mode, Supabase PostgreSQL sync.
- **AI / NLP**: Python Flask, PyMuPDF, Semantic matching engine, Google Gemini API.
- **Deployment**: Cloudflare Pages (Frontend SPA), Node.js / Docker (Backend API).

---

## 📂 Project Structure

```text
├── client/                     # React Frontend Application
│   ├── public/                 # HTML shell, favicon, _redirects (for Cloudflare SPA)
│   ├── src/
│   │   ├── components/         # Navigation, Bell, Modals, Feed Personalizer
│   │   ├── pages/              # Internships, Recommendations, Applications, Notifications
│   │   ├── context/            # AuthContext
│   │   └── services/           # Axios API Client
│   └── package.json
│
├── server/                     # Express REST API Server
│   ├── config/                 # DB, Supabase, and App configs
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose schemas (Internship, Application, Notification)
│   ├── routes/                 # Express API routes
│   ├── services/               # aiCrawlerDaemon, scraper, aggregator, cronService
│   └── server.js
│
├── ai-service/                 # Python NLP Semantic Service
│   ├── app/                    # Matching engine, resume processor, skill extractor
│   └── server.py               # Flask microservice
│
├── .gitignore                  # Production-grade git exclusions
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Git

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm start
```
*Backend runs on `http://localhost:5000` (serving both API and compiled frontend).*

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```
*Frontend dev server runs on `http://localhost:3000` with hot-reloading.*

### 4. Python AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python server.py
```
*AI service runs on `http://localhost:8000`.*

---

## ☁️ Deployment Guide

### Deploying Frontend to Cloudflare Pages

1. **Connect via GitHub**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
   - Select this repository.
   - Set the following build configuration:
     - **Framework preset**: `Create React App`
     - **Root directory**: `client`
     - **Build command**: `npm run build`
     - **Build output directory**: `build`
   - In **Environment Variables**, set:
     - `REACT_APP_API_URL`: Your deployed backend URL (e.g. `https://your-api.onrender.com/api` or `https://your-domain.com/api`)
   - Click **Save and Deploy**. Cloudflare Pages will build and deploy your site with a custom `*.pages.dev` URL and SSL!

2. **Direct CLI Deployment with Wrangler**:
   ```bash
   cd client
   npm run build
   npx wrangler pages deploy build --project-name=internmatch-ai
   ```

*(The included `client/public/_redirects` file automatically handles client-side routing on Cloudflare Pages so direct URLs like `/applications` never return 404).*

---

## 📄 License
MIT License. Built for university placement systems and engineering students.
