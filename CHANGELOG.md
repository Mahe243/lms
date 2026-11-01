# CHANGELOG — Learnova LMS Architecture Evolution

All notable changes, architectural fixes, security improvements, and module integrations will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2026-11-02

### Phase 1 — Comprehensive Codebase Audit
- Completed full architectural audit of frontend (`React 19`, `Vite`, `Tailwind CSS`) and backend (`FastAPI`, `SQLAlchemy`, `SQLite/PostgreSQL`).
- Documented existing functionality matrix, identified 109 backend endpoints, 25 database models, and traced mock/localStorage dependencies across all 9 views.
- Published `IMPLEMENTATION_AUDIT.md` and audit report artifact.

### Phase 2 — Core Architecture & Central API Integration Layer
- Established backend database (`lms.db` / `DATABASE_URL`) as single source of truth for courses, topics, resources, notes, flashcards, quizzes, study sessions, goals, and tasks.
- Created `frontend/src/api/` central integration layer:
  - `client.ts`: Standardized fetch wrapper with timeout, token injection, error handling, and offline detection.
  - Domain API clients: `coursesApi.ts`, `notesApi.ts`, `resourcesApi.ts`, `aiApi.ts`, `flashcardsApi.ts`, `quizzesApi.ts`, `studySessionsApi.ts`, `activityApi.ts`, `tasksApi.ts`, `goalsApi.ts`, `userApi.ts`.
- Integrated `frontend/src/context/AppContext.tsx` with reactive database synchronization, sync indicators, and no silent fake fallbacks.

### Phase 3 — Security & Data Persistence
- Removed all direct client-side requests to third-party AI providers (`generativelanguage.googleapis.com`); all AI tutoring now routes strictly through backend `POST /api/ai/chat` using server-side configuration.
- Added access protection token dependency (`X-Learnova-Token`) via `backend/security.py`.
- Restricted CORS in `backend/main.py` strictly to authorized origins (`localhost:5173`, `localhost:3000`, `lms-yrpn.vercel.app`, and `ALLOWED_ORIGINS`).
- Added Alembic database migration environment and executed initial schema migration `46c1ac3fa618_initial_schema.py`.
- Added global standardized JSON exception handler in `backend/main.py`.

### Phase 4 — Learning Modules Integration
- **Classroom**: Refactored monolithic `ClassroomView.tsx` (1,267 lines) into 8 reusable subcomponents:
  - `ClassroomVideoPlayer`: YouTube stream with origin parameters, owner-blocked iframe detection (ETPL) notice, "Watch on YouTube" and "Popup Player", local MP4 playback, and curated lecture presets.
  - `ClassroomReader`: Markdown theory reader with key takeaways and formulas.
  - `ClassroomMatrix`: Interactive benchmark tradeoff matrix.
  - `ClassroomCodeSandbox`: Python execution sandbox.
  - `ClassroomNotes`: Autosaving lecture companion notes to `POST /api/notes`.
  - `ClassroomQuiz`: Knowledge checks with instant scoring and confetti.
  - `ClassroomAITutor`: Live Socratic tutor grounded in active topic.
  - `ClassroomSidebar`: Module and topic syllabus navigation with progress tracking.
- **AI Tutor**: Connected Professor Nova in `AITutorView.tsx` and `StudyBotWidget.tsx` to `POST /api/ai/chat` with RAG source citations, persona routing, and conversation history.
- **Study Room**: Wired focus timer blocks to `studySessionsApi.startSession` and `updateSession`, and sprint tasks to persistent `tasksApi`.
- **Practice Arena**: Connected timed exam evaluations to `quizzesApi.submitQuiz` with score logging.
- **Goals & Progress**: Connected to real backend analytics (`activityApi.getAnalytics`) and persistent learning goals (`goalsApi.getGoals`).
- **My Library**: Upload modal mapped to `/api/resources/upload` with correct `res_type` detection.

### Phase 5 — UX & Navigation Improvements
- Implemented URL hash navigation (`#/home`, `#/classroom`, `#/ai-tutor`, `#/study-room`, `#/practice-arena`, `#/my-library`, `#/goals-and-progress`) with browser back/forward history support.
- Added live DB sync indicator badge in the top navigation header (`DB Live` / `Syncing...` / `Offline`).
- Maintained editorial intellectual aesthetic (`Playfair Display`, `JetBrains Mono`, `Plus Jakarta Sans`, alabaster/umber themes).

### Phase 6 — True Learning Analytics Engine
- Replaced fabricated random math curves in `GoalsProgressView.tsx` with actual 90-day activity intervals computed by `backend/services/activity_service.py`.
- Heartbeat actively pinged every 60 seconds while window is active to log non-gameable study minutes.

### Phase 7 — Verification & Quality Assurance
- Automated tests: 14/14 unit tests passing in pytest (`test_activity_dedup.py`, `test_backup_restore.py`, `test_progress.py`, `test_quiz_grading.py`, `test_spaced_repetition.py`).
- Frontend production build: `npm run build` succeeds cleanly in 2.8s with zero TypeScript or Vite errors.
