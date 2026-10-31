# LEARNOVA — Personal LMS Platform

> **A high-cognition, editorial personal learning operating system for dual-track academic and technical mastery.**  
> Crafted with Apple-like editorial precision, Notion-inspired modular restraint, and Spotify-style curated discovery.

---

## 🏛️ Architectural Overview

Learnova is built upon the **Editorial Intellect** design system (`Playfair Display` + `Plus Jakarta Sans` + `JetBrains Mono` on warm mineral alabaster `#FDF8F5` and deep slate umber `#141413`).

### 🌟 Core Modules & Screen Implementation

1. **Editorial Dashboard (`HomeDashboard`)**
   - Active Focus Protocol indicator with live sync metadata (`MBA + CS DUAL TRACK '28`).
   - Vital Metrics:
     - **Discipline:** 42-day streak (Top 1% cohort velocity).
     - **Deep Work:** 2.5 / 3.0 Hours with dynamic progress bar.
     - **Knowledge Yield:** 1,840 XP (+18% weekly growth).
     - **Retained Nodes:** 14 Modules (94% recall benchmark).
   - Primary Hero Card: *Latency Optimization in Enterprise RAG Pipelines* with 1-click resume straight into Classroom.
   - Today's Focus Protocol: Priority time blocks across Central Banking Macroeconomics, Corporate DCF Valuation, and Product Sense.
   - Fast Recall Log popover trigger.

2. **Classroom Learning Experience (`ClassroomView`)**
   - Course: *AI Product Management & LLM Systems* (CS-742).
   - Lesson: *Hybrid Search Architecture: Blending Keyword Precision with Semantic Context*.
   - Interactive Video Player: Chapter scrubber, speed selectors (1x, 1.25x, 1.5x), HD toggle, and status indicators.
   - Content Tabs:
     - **Deep-Dive Reader:** Comprehensive academic text on dense vector alphanumeric blind spots and lexical inverted indexes.
     - **Trade-off Matrix:** Interactive benchmark table comparing BM25, Dense HNSW, Hybrid RRF, and SPLADE v3 on P99 latency and SKU recall.
     - **RRF Python Engine:** Live executable code block with simulation execution output in console.
     - **Notion Q&A Case Study:** Production architecture breakdown of enterprise search scaling.
     - **Knowledge Check:** 3-question interactive comprehension quiz with immediate scoring and confetti celebration on 100%!
   - Real-Time Lesson Notebook with automatic background saving.
   - Collapsible Syllabus tracker.

3. **AI Tutor: Professor Nova (`AITutorView`)**
   - Personalized 1:1 Intellectual Sparring Partner & Cognitive Mentor.
   - Specialized Personas:
     - **Quant & Derivatives Specialist:** Black-Scholes PDE derivations, option Greeks ($\Delta, \Gamma, \Theta, \nu$), and volatility smiles.
     - **Socratic Professor:** Probing conceptual intuition and first principles.
     - **FAANG Staff Architect:** Distributed systems, Kafka, Flink, and RAG scaling.
     - **Exam Drillmaster:** Timed pressure drills for RBI Grade B & CFA.
   - Real-time conversational engine with LaTeX math rendering and code snippets.
   - Quick Intuition Drill widget with instant verification.
   - Optional **Google Gemini API Key integration** (configure in Settings for unrestricted live LLM generation).

4. **Practice Arena: Timed Exam Simulator (`PracticeArenaView`)**
   - Standardized Mock Exam: *RBI Grade B Phase II – Economic & Social Issues (ESI) + FinTech Full Mock #04*.
   - Live 45-minute countdown clock with auto-evaluation.
   - Dynamic Question Palette with Answered, Flagged, and Unvisited tracking.
   - Full diagnostic evaluation on submission:
     - Score & Percentile ranking (e.g. 96.4th percentile).
     - Vulnerability Taxonomy highlighting weak areas.
     - Detailed rubric explanations for every question.

5. **Study Room & Focus Sanctuary (`StudyRoomView`)**
   - Aesthetic circular Pomodoro Focus Clock with presets:
     - `25m` Standard Pomodoro
     - `50m` Deep Work Sprint
     - `90m` Ultradian Flow State
   - **Natively Synthesized Web Audio Soundscapes:**
     - 🎧 **40Hz Gamma Binaural Beats:** Dual-frequency carrier waves for cognitive focus.
     - 🌧️ **Library Skylight Rain:** Filtered pink-noise rainfall acoustics.
     - ☕ **Cyberpunk Coffeehouse:** Warm atmospheric low-frequency murmur.
     - 🌿 **Pure Pink Noise:** Balanced background masking.
   - Sprint Milestones to-do checklist with task completion toggles.
   - Thought Parker scratchpad to dump distracting thoughts without breaking flow.
   - Circadian Cognitive Profile curve.
   - Zen Fullscreen immersion mode.

6. **Projects: Learn by Building (`ProjectsView`)**
   - Multi-capstone switcher:
     - **Capstone 1:** *Autonomous Agent Orchestration Platform for FinTech Credit Underwriting*.
     - **Capstone 2:** *Uber Health — Non-Emergency Medical Transportation (NEMT) PRD*.
   - 4 Working Workspaces:
     - **PRD & Architecture:** Full system design, SLA circuit breakers, and topology diagram.
     - **Live Python Engine:** Interactive sandbox running multi-agent consensus, DSCR checks, and Cornish-Fisher VaR models.
     - **Interactive Streamlit Demo:** Dynamic loan calculator with sliders for Revenue, Credit Score, Debt Service, and Loan Amount.
     - **Investment Committee Memo:** Market sizing, risk mitigation, and rubric scoring (94/100).

7. **My Library: Second Brain & Vault (`LibraryView`)**
   - Filterable taxonomy across Books, Research Papers, Lecture Notes, and Cheat Sheets.
   - Instant search across titles, authors, and synapse tags (`#derivatives`, `#rag`, `#system-design`, `#macroeconomics`).
   - Rich Document Reader Drawer with standard academic citations and study notes.
   - **Spaced Repetition (SRS) Flashcard Trainer:**
     - Keyboard flip (Spacebar / click).
     - Rating algorithms (`Again`, `Hard`, `Good`, `Easy`) updating spaced review intervals.

8. **Goals & Mastery Matrix (`GoalsProgressView`)**
   - 3 Domain Mastery Trees:
     - MBA Product Management & Growth (84% Mastery)
     - Quantitative Finance & Central Banking (72% Mastery)
     - AI Systems & Distributed Engineering (88% Mastery)
   - Interactive 364-day GitHub-style Deep Work Consistency Heatmap with hover tooltips displaying date and hours logged.
   - Level 16 Cognitive Architect progression.

9. **Global Superpowers**
   - **Command Palette (`⌘K` / `Ctrl+K`):** Global fuzzy launcher to navigate to any screen, course, or tool from anywhere in the platform.
   - **Fast Recall Quick Log:** Pinned hero and header shortcut to record sudden intellectual flashes into your vault (+25 XP).
   - **Persistent Focus Timer:** Header timer that stays synced across page transitions.
   - **Dark & Light Mode:** Seamless toggle between warm mineral Alabaster (`#FDF8F5`) and deep slate Umber (`#141413`).
   - **Local Storage Persistence:** All progress, notes, tasks, flashcard ratings, and streak data persist across browser refreshes.

---

## 🚀 Running the Application

The development server is running locally:

```bash
cd learnova-app
npm run dev
```

Visit in your browser:
**`http://localhost:5173/`**

To build for production:
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom Editorial Intellect tokens
- **Icons & Typography:** Google Material Symbols Outlined, Playfair Display, Plus Jakarta Sans, JetBrains Mono
- **Audio:** Web Audio API (Native browser synthesis for Binaural 40Hz and Ambient Rain)
- **Effects:** Canvas Confetti for milestone rewards
