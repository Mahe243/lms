# Personal LMS — Autonomous Learning Management System

A complete, production-grade personal Learning Management System inspired by Moodle, built specifically for individual learners. The application integrates courses, modules, topics, rich notes, PDF/video materials, interactive FSRS flashcards, active learning, spaced revision, honest analytics, and an AI tutor grounded in your private materials.

---

## 🚀 Quick Start Guide

### ⚡ Option A: 1-Click Launch (Recommended)
Simply double-click **`start.bat`** (or run `.\start.ps1` in PowerShell) in the root folder. It will automatically:
1. Start the FastAPI backend on `http://127.0.0.1:8000`.
2. Start the Vite React frontend on `http://localhost:5173`.
3. Open `http://localhost:5173` in your default web browser.

---

### 💻 Option B: Manual Terminal Launch

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** & npm

### 2. Backend Setup
```bash
# Navigate to the workspace root
cd c:\Users\reddy\Downloads\lms

# Activate the existing virtual environment (or create one)
.\.venv\Scripts\Activate.ps1

# Run the FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000` with SQLite WAL mode persistence at `data/lms.db`.

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend/
cd frontend

# Run the Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser. All API requests are proxied directly to the backend.

---

## 🛠️ Architecture & Tech Stack

- **Backend**:
  - **FastAPI** with Pydantic V2 schemas and SQLAlchemy ORM.
  - **SQLite** with Write-Ahead Logging (`WAL`) and foreign key constraints.
  - **FSRS / SM-2 Engine**: Spaced repetition algorithm for flashcards and topic revision schedules.
  - **Local RAG Service**: Term-overlap TF/IDF text retrieval with source document and timestamp citations.
  - **Activity Tracker**: Non-overlapping interval merger (no double-counting), 30-minute visit sessionization, and honest 15-minute study streaks.
  - **Document Extractors**: `pypdf` for searchable text extraction, WebVTT/SRT transcript parser.
- **Frontend**:
  - **React 19** with **TypeScript** and **Vite**.
  - **Tailwind CSS** with warm off-white tones (`#fdfbf7`, `#f7f4ee`) and dark mode support.
  - **Lucide Icons** and **Canvas Confetti**.
  - **Keyboard Navigation**: `Ctrl+K` Global Search, `Ctrl+Q` Quick Capture.

---

## 🌟 Core Features & Modules

1. **Personal Dashboard**:
   - Today's study plan, continuation queue, upcoming deadlines, flashcards due for review.
   - Distinct, honest metrics: study-day streak, active time today/this week, visit counts, and course completion.
2. **Course & Topic Hierarchy**:
   - `Course` → `Module` → `Topic` → `Subtopic` nested tree.
   - Non-optional topic completion percentage calculated strictly without inflation.
   - Understanding levels (`unfamiliar`, `basic`, `comfortable`, `confident`).
3. **Notes & Knowledge Management**:
   - Rich-text editor with headings, checklists, callouts, and code blocks.
   - Templates for Lecture Notes, Reading Notes, Video Notes, Formula Sheets, Case Analysis, and Weekly Reviews.
   - Version history snapshots, trash recovery, backlinks, and text-selection actions.
4. **Resource Library & Video Learning**:
   - Support for PDFs, videos, articles, audio, and documents.
   - Automatic PDF text extraction and WebVTT/SRT transcript parsing.
   - Interactive video player with timestamped notes, comments, and resume position tracking.
5. **Interactive Flashcards (FSRS / SM-2)**:
   - Basic, Cloze deletion (`{{c1::term}}`), and Reversed card formats.
   - 4-grade rating: *Again*, *Hard*, *Good*, *Easy* with instant 1-click Undo.
   - AI draft cards require explicit learner review before joining study decks.
6. **Practice & Quizzes**:
   - Multiple choice, multi-select, and numerical questions with configurable tolerance.
   - Historical attempt snapshots and Mistake Log for targeted re-practice.
7. **Active Learning Suite**:
   - **Teach-Back Evaluation**: Explain concepts in your own words with rubric self-scoring.
   - **Formula Practice**: Interactive symbol & formula recall drills.
   - **Concept Matrices**: Compare and contrast related ideas side-by-side.
   - **Dynamic Glossary**: Searchable, course-linked vocabulary index.
8. **Study Session Tracker & Focus Mode**:
   - Pomodoro (25/5m) and Free Focus stopwatch with cross-refresh state persistence.
   - Post-session 4-question reflection (Goal achieved, focus rating, challenges, next step).
   - Distraction-Free Study mode with quick scratchpad and embedded AI tutor drawer.
9. **Doubt Inbox**:
   - Central triage for questions raised across courses, videos, notes, or quiz errors.
   - Direct escalation to the AI tutor with preserved context.
10. **Study Planner & Kanban Tasks**:
    - Calendar with conflict detection and exam countdown widgets.
    - Kanban task board (`To Do`, `In Progress`, `Review`, `Done`) with assignment submission tracking.
11. **Topic Spaced Revision**:
    - Intervals: 1 day, 3 days, 7 days, 14 days, 30 days.
    - Topic readiness score based on last revision recency.
12. **Analytics & Learning Journal**:
    - 90-day GitHub-style study heatmap.
    - Course time allocation and quiz accuracy.
    - Daily reflection journal with mood tracking.
13. **Data Portability & 1-Click Demo Management**:
    - Complete workspace JSON backup & restore.
    - ZIP archive export of all notes as Markdown files with YAML frontmatter.
    - CSV export of activity events and study sessions.
    - 1-click **Clean Demo Data** button in Settings (deletes only `is_demo=true` data without affecting personal notes).

---

## 🤖 AI Tutor Configuration

The AI Tutor is designed to assist you by grounding its responses directly in your uploaded PDFs, notes, and video transcripts, citing the exact document and page/timestamp.

### Setup Instructions
1. Open the application and navigate to **Settings** (`/settings`) → **AI Configuration**.
2. Select your provider (**Google Gemini** or **OpenAI**).
3. Enter your API key and click **Save Settings**.
4. Alternatively, you can create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   # or
   OPENAI_API_KEY=your_openai_api_key_here
   ```
*(Note: If no API key is provided, the AI Tutor displays a clear setup message explaining how to enable it, avoiding hallucinations or fabricated facts).*

---

## 🧪 Running Automated Tests

Run the backend unit test suite:
```bash
.\.venv\Scripts\python -m pytest backend/tests
```
All 14 comprehensive tests cover progress calculation, FSRS spaced repetition, non-overlapping active time deduplication, quiz grading with tolerance, and full workspace JSON backup & restore.
