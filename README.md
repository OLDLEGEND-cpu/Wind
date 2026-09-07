# 🌬️ Wind AI — Next-Generation Intelligent Chat Platform

An enterprise-grade, full-stack AI platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Google Gemini 3.6 / 3.7**, featuring dual-database architecture (persistent local SQLite fallback + MySQL/Supabase PostgreSQL), multimodal vision, voice speech-to-text, and a full administrative suite.

---

## ✨ Features & Highlights

- **⚡ Modern AI Streaming**: Server-Sent Events (SSE) token streaming using Google's latest `gemini-3.6-flash` (Wind Fast) and `gemini-3.7-flash` (Wind Pro) models.
- **📷 Multimodal Vision & Documents**:
  - Drag & drop images directly onto the composer.
  - Clipboard paste (`Ctrl+V`) for instant screenshot analysis.
  - Attach images (`PNG`, `JPEG`, `WebP`) and code/data files (`.py`, `.ts`, `.js`, `.json`, `.md`, `.csv`, `.txt`).
  - Clickable full-screen image inspection modal.
- **🎙️ Real-Time Voice Input**: Web Speech API speech-to-text transcription with continuous live preview and active pulsing recording state.
- **🔀 Dynamic Model Engine Switcher**: Toggle between **Wind Fast** (everyday tasks, instant response) and **Wind Pro** (deep reasoning, architecture, coding) on the fly with per-conversation persistence.
- **📥 Conversation Export**:
  - One-click export to **Markdown (`.md`)** with timestamps and speaker tags.
  - Export to **Plain Text (`.txt`)**.
  - One-click copy transcript to clipboard.
- **🔊 Accessibility & Speech Synthesis**: Built-in text-to-speech (*Read Aloud*) to listen to assistant answers.
- **🛠️ Rich Developer Experience**:
  - Mac-style syntax-highlighted code blocks with language tags and instant copy buttons.
  - Inline prompt editing and retry / re-generation flows.
- **🛡️ Enterprise Admin Suite (`/admin`)**:
  - **Overview**: Real-time KPI dashboard (users, chats, messages, token volume, active users).
  - **User Management**: Role controls (`user` vs `admin`), user search, status badges.
  - **API Usage Analytics**: Token consumption graphs, latency metrics, and error rates.
  - **Live Logs**: Streaming query and error logs.
  - **Audit Trail**: Security event logging for compliance and activity tracking.
  - **System Settings**: Signup toggles, maintenance mode, and model defaults.
- **💾 Resilient Multi-Backend Database Architecture**:
  - Automatically attempts MySQL on port 3306.
  - Gracefully falls back to high-performance local persistent SQLite (`db/wind_ai.sqlite` via `better-sqlite3`).
  - Full schema and RLS policies included for **Supabase PostgreSQL** (`db/supabase_schema.sql`).
- **🔒 Authentication & Security**: Secure httpOnly JWT session cookies, bcrypt password hashing, and sliding window rate limiting.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism, Dark/Light Mode
- **AI / LLM**: `@google/generative-ai` SDK (`gemini-3.6-flash`, `gemini-3.7-flash`)
- **Database**: SQLite (`better-sqlite3`) / MySQL (`mysql2`) / Supabase PostgreSQL
- **Markdown & Code**: `react-markdown`, `remark-gfm`, `rehype-highlight`

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/OLDLEGEND-cpu/Wind.git
cd Wind
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_long_random_jwt_secret_here
```

*(Optional: Configure MySQL credentials or Supabase URL & keys if using cloud databases. If left untouched, Wind AI automatically operates on local persistent SQLite without any external server required).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Demo & Admin Account

When initialized, Wind AI automatically seeds a default administrator account:
- **Email**: `admin@windai.app`
- **Password**: `ChangeMe123!`

*(You can also use the **1-Click Admin Demo** button on the `/login` page).*

---

## 🏗️ Production Build & Verification

```bash
# Verify type safety
npx tsc --noEmit

# Compile production bundle
npm run build

# Start production server
npm start
```

---

## 📄 License
MIT License. Built with precision for modern AI workflows.
