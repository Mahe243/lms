import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export const ClassroomView: React.FC = () => {
  const { activeLesson, markLessonComplete } = useApp();
  const [activeTab, setActiveTab] = useState<'reader' | 'matrix' | 'code' | 'notion' | 'quiz'>('reader');
  
  // Video player simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [videoProgress, setVideoProgress] = useState(45); // percentage

  // Notes state
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('learnova_classroom_notes') || 
      "Key insight: RRF Score(d) = sum(1 / (k + rank)). k=60 prevents top-1 bias.\nTantivy full-text search handles alphanumeric SKUs, while Milvus HNSW handles semantic intent.";
  });
  const [noteSaved, setNoteSaved] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Python simulator output in Classroom
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const handleSaveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem('learnova_classroom_notes', val);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setCodeOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput(`[RRF Pipeline Initialized: k=60]
Processing 4 dense vector candidates and 4 BM25 lexical candidates...
----------------------------------------------------------------------
Rank 1: doc_42  | RRF Score: 0.032520 (Dense #1 [0.01639] + Lexical #2 [0.01613])
Rank 2: doc_19  | RRF Score: 0.032258 (Dense #3 [0.01587] + Lexical #1 [0.01639])
Rank 3: doc_108 | RRF Score: 0.031535 (Dense #2 [0.01613] + Lexical #4 [0.01540])
Rank 4: doc_88  | RRF Score: 0.015625 (Dense #4 [0.01562])
Rank 5: doc_55  | RRF Score: 0.015873 (Lexical #3 [0.01587])
----------------------------------------------------------------------
✓ Top candidate "doc_42" successfully routed to Cross-Encoder reranker.
Latency overhead: 2.1ms (99.8% faster than linear distance calibration)`);
    }, 600);
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    activeLesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === activeLesson.quiz.length) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      markLessonComplete(activeLesson.id);
    }
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-variant/40 dark:border-dark-border pb-3">
        <div className="flex items-center gap-space-xs text-xs font-code-sm text-on-surface-variant dark:text-dark-text-muted">
          <span className="font-semibold text-primary dark:text-inverse-primary uppercase">CS-742</span>
          <span>/</span>
          <span>Enterprise RAG Pipelines</span>
          <span>/</span>
          <span className="text-on-surface dark:text-dark-text font-semibold">{activeLesson.moduleTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeLesson.completed ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-code-sm">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              MASTERED (+120 XP)
            </span>
          ) : (
            <button
              onClick={() => {
                markLessonComplete(activeLesson.id);
                confetti({ particleCount: 60 });
              }}
              className="px-3 py-1 rounded-full bg-primary hover:bg-primary-container text-white text-xs font-bold font-label-md flex items-center gap-1 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Lesson Title & Lead */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-2xl lg:text-3xl font-serif font-bold text-on-surface dark:text-dark-text tracking-tight">
          {activeLesson.title}
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant dark:text-dark-text-muted">
          Master the integration of lexical inverted indexes (BM25) with dense vector representations (HNSW) to overcome semantic blind spots at enterprise scale.
        </p>
      </div>

      {/* Main Grid: Video + Content Tabs (Left 8 cols) & Syllabus + Notes (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Media Player & Content Reader (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Interactive Video Media Player */}
          <div className="relative rounded-2xl overflow-hidden bg-[#121211] text-white shadow-xl aspect-video flex flex-col justify-between border border-white/10 group">
            {/* Ambient Background Simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none"></div>

            {/* Video Canvas Graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <div className={`w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl transition-transform ${isPlaying ? 'scale-90 opacity-40' : 'group-hover:scale-110'}`}>
                  <span className="material-symbols-outlined text-[36px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-code-sm text-white/90">
                  Lecture 03.4: RRF Fusion vs Linear Score Interpolation
                </div>
              </div>
            </div>

            {/* Video Top Overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between text-xs font-code-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>HD 1080p • 60 FPS</span>
              </div>
              <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded">
                Chapter 3 of 4: Reciprocal Rank Math
              </span>
            </div>

            {/* Video Controls Bar */}
            <div className="relative z-10 p-4 flex flex-col gap-2 bg-gradient-to-t from-black/95 to-transparent">
              {/* Scrubber Timeline */}
              <div 
                className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = ((e.clientX - rect.left) / rect.width) * 100;
                  setVideoProgress(Math.max(0, Math.min(100, pos)));
                }}
              >
                <div 
                  className="h-full bg-primary rounded-full relative transition-all"
                  style={{ width: `${videoProgress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md"></div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between text-xs text-white/90">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <span className="font-code-sm text-xs">
                    {Math.floor((videoProgress / 100) * 24)}:18 / {activeLesson.duration}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {['1.0x', '1.25x', '1.5x'].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 rounded text-[11px] font-code-sm transition-colors ${
                        playbackSpeed === speed ? 'bg-primary text-white font-bold' : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                  <button 
                    onClick={() => alert('Fullscreen mode activated')}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low dark:bg-dark-surface-2 p-1 rounded-xl border border-surface-variant/40 dark:border-dark-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reader'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Deep-Dive Reader</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>Trade-off Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>RRF Python Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('notion')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'notion'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>Notion Q&A Architecture</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Knowledge Check</span>
              {quizSubmitted && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          </div>

          {/* TAB 1: DEEP-DIVE READER */}
          {activeTab === 'reader' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4 leading-relaxed font-body-md text-on-surface dark:text-dark-text">
              <div className="flex items-center gap-2 text-xs font-code-sm text-primary dark:text-inverse-primary font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>Foundational Theory</span>
              </div>
              <h3 className="font-headline-sm text-xl font-serif font-bold">
                The Alphanumeric Blind Spot of Dense Vectors
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-dark-text-muted">
                Dense embedding transformers map textual semantics into high-dimensional geometric manifolds. While this works miracles for conceptual associations (e.g. matching "pediatrician" to "child doctor"), it exhibits an information-loss compression bottleneck when queries contain exact alphanumeric strings like Part SKUs, internal Jira tickets, or tax codes.
              </p>

              <div className="my-2 p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/50 dark:border-dark-border font-code-sm text-xs flex flex-col gap-2">
                <span className="text-on-surface-variant dark:text-dark-text-muted font-bold">
                  DUAL-PIPELINE HYBRID RETRIEVAL TOPOLOGY:
                </span>
                <pre className="text-primary dark:text-inverse-primary overflow-x-auto whitespace-pre font-mono">
{`   [User Query: "Find invoice INV-2026-X9 for ACME Corp"]
                │
   ┌────────────┴──────────────────────────┐
   ▼                                       ▼
[Lexical Inverted Index (BM25)]   [Dense Vector Index (HNSW)]
Exact token match on "INV-2026-X9" Semantic context on ACME vendor
   │                                       │
   ▼ (Rank 1: INV-2026-X9)                 ▼ (Rank 42: blurred match)
   └───────────────────┬───────────────────┘
                       ▼
         [Reciprocal Rank Fusion (k=60)]
                       │
                       ▼
         [Cross-Encoder Neural Reranker]
                       │
                       ▼
         [Top 3 Validated Context Documents to LLM]`}
                </pre>
              </div>

              <h4 className="font-headline-sm text-base font-bold mt-2">
                Core Key Takeaways
              </h4>
              <ul className="space-y-2 text-sm text-on-surface-variant dark:text-dark-text-muted">
                {activeLesson.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 2: TRADE-OFF MATRIX */}
          {activeTab === 'matrix' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
              <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                Indexing Paradigms: Benchmark Trade-Off Matrix
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-dark-text-muted">
                Evaluated against a corpus of 1.2M enterprise technical documents on AWS c6i.4xlarge instances.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body-md border-collapse">
                  <thead>
                    <tr className="border-b border-surface-variant/60 dark:border-dark-border font-bold uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted bg-surface-container-low dark:bg-dark-surface-2">
                      <th className="p-3">Retrieval Paradigm</th>
                      <th className="p-3">P99 Latency</th>
                      <th className="p-3">Exact SKU Recall</th>
                      <th className="p-3">Conceptual Recall@10</th>
                      <th className="p-3">RAM Footprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/30 dark:divide-dark-border">
                    <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
                      <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                        BM25 (Lucene / Tantivy)
                      </td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">4.2 ms</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">99.4%</td>
                      <td className="p-3 font-code-sm text-amber-600">54.2% (Vocabulary Miss)</td>
                      <td className="p-3 font-code-sm">Low (Disk Inverted Index)</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
                      <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                        Dense HNSW (Milvus / Qdrant)
                      </td>
                      <td className="p-3 font-code-sm">18.5 ms</td>
                      <td className="p-3 font-code-sm text-red-500 font-bold">62.1% (Fails on IDs)</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">89.8%</td>
                      <td className="p-3 font-code-sm">High (RAM Graphs)</td>
                    </tr>
                    <tr className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary">
                      <td className="p-3 font-bold text-primary dark:text-inverse-primary">
                        Hybrid RRF + Flash Reranker
                      </td>
                      <td className="p-3 font-code-sm font-bold">28.4 ms (Optimized)</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">98.9%</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">93.7% (Industry Peak)</td>
                      <td className="p-3 font-code-sm">Moderate</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
                      <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                        Learned Sparse (SPLADE v3)
                      </td>
                      <td className="p-3 font-code-sm">34.2 ms</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">95.1%</td>
                      <td className="p-3 font-code-sm">90.4%</td>
                      <td className="p-3 font-code-sm">High (Inference Cost)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CODE & SIMULATOR */}
          {activeTab === 'code' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                    Reciprocal Rank Fusion (RRF) Python Engine
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                    Scale-invariant rank aggregation algorithm implementation.
                  </p>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-code-sm text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isRunningCode ? 'sync' : 'play_arrow'}
                  </span>
                  <span>{isRunningCode ? 'Executing...' : 'Run Simulation'}</span>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-surface-variant/60 dark:border-dark-border bg-[#18181b] text-gray-200 text-xs font-mono p-4">
                <pre className="overflow-x-auto whitespace-pre">
                  {activeLesson.codeSnippet?.code}
                </pre>
              </div>

              {codeOutput && (
                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-emerald-500/30 text-xs font-code-sm text-on-surface dark:text-dark-text animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                    <span className="material-symbols-outlined text-[16px]">terminal</span>
                    <span>Console Output</span>
                  </div>
                  <pre className="whitespace-pre overflow-x-auto text-on-surface dark:text-dark-text font-mono">
                    {codeOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTION Q&A ARCHITECTURE */}
          {activeTab === 'notion' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
              <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                Case Study: How Notion Q&A Handles Workspace Scale
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-dark-text-muted leading-relaxed">
                Notion operates one of the world's highest-density collaborative document graphs. When introducing AI Q&A across private enterprise workspaces, they encountered two distinct failure modes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 dark:border-dark-border">
                  <span className="font-bold text-red-500 block mb-1">Failure Mode 1: Acronym Collisions</span>
                  <p className="text-on-surface-variant dark:text-dark-text-muted">
                    Different engineering teams inside the same organization used identical 3-letter acronyms for entirely different internal microservices. Pure vector embeddings smoothed them together.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 dark:border-dark-border">
                  <span className="font-bold text-red-500 block mb-1">Failure Mode 2: Permission Graph Latency</span>
                  <p className="text-on-surface-variant dark:text-dark-text-muted">
                    Pre-filtering vector graphs with complex permission ACLs caused catastrophic indexing fragmentation. Post-filtering resulted in empty result sets when top-100 candidates were inaccessible.
                  </p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant dark:text-dark-text-muted leading-relaxed">
                <strong>Solution:</strong> Notion deployed Tantivy (Rust-based Lucene alternative) co-located alongside vector index nodes, passing parallel hits into a localized RRF score accumulator. By filtering candidate documents via bitsets before scoring, end-to-end P95 retrieval latency dropped from 220ms to 38ms.
              </p>
            </div>
          )}

          {/* TAB 5: KNOWLEDGE CHECK QUIZ */}
          {activeTab === 'quiz' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
                <div>
                  <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                    Lesson Comprehension Validation
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                    Pass with 100% to cement retention and earn +120 XP.
                  </p>
                </div>
                {quizScore !== null && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-code-sm ${
                    quizScore === activeLesson.quiz.length ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Score: {quizScore} / {activeLesson.quiz.length}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {activeLesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 dark:border-dark-border flex flex-col gap-3">
                    <p className="font-semibold text-sm text-on-surface dark:text-dark-text">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        let optStyle = 'border-surface-variant/50 dark:border-dark-border hover:bg-surface-container-high dark:hover:bg-dark-surface';
                        if (quizSubmitted) {
                          if (oIdx === q.correctIndex) {
                            optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold';
                          } else if (isSelected && isSelected !== (oIdx === q.correctIndex)) {
                            optStyle = 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200';
                          }
                        } else if (isSelected) {
                          optStyle = 'border-primary bg-primary/10 text-primary dark:text-inverse-primary font-semibold';
                        }

                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(qIdx, oIdx)}
                            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && oIdx === q.correctIndex && (
                              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 rounded-lg bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/30 text-xs text-on-surface-variant dark:text-dark-text-muted font-body-sm mt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < activeLesson.quiz.length}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs disabled:opacity-50 transition-all shadow-md cursor-pointer"
                  >
                    Submit Knowledge Check
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                      setQuizScore(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-variant transition-colors"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Syllabus & Real-Time Notes Pad (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Real-time Notebook Pad */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface dark:text-dark-text">
                <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
                <span>Active Lesson Notebook</span>
              </div>
              <span className={`text-[10px] font-code-sm ${noteSaved ? 'text-emerald-500 font-bold' : 'text-on-surface-variant/60'}`}>
                {noteSaved ? 'Saved to Vault' : 'Auto-saved'}
              </span>
            </div>

            <textarea
              rows={6}
              value={notes}
              onChange={(e) => handleSaveNotes(e.target.value)}
              placeholder="Capture lecture annotations, timestamps, or synthetic insights..."
              className="w-full p-2.5 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 dark:border-dark-border text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Course Syllabus Matrix */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
              <span className="text-xs font-bold font-serif uppercase tracking-wider text-on-surface dark:text-dark-text">
                Course Syllabus
              </span>
              <span className="text-xs font-code-sm text-primary dark:text-inverse-primary font-bold">
                4 / 6 Done
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between text-on-surface-variant">
                <span className="font-semibold">01. Vector Quantization & Product Quantizers</span>
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between text-on-surface-variant">
                <span className="font-semibold">02. Speculative Decoding & KV Cache Paging</span>
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between text-primary dark:text-inverse-primary font-bold">
                <span>03. Hybrid Search Architecture: BM25 + RRF</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between text-on-surface-variant opacity-60">
                <span>04. Cross-Encoder Distillation & FlashRank</span>
                <span className="material-symbols-outlined text-[16px]">lock</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between text-on-surface-variant opacity-60">
                <span>05. Multi-Tenant ACL Partitioning in Milvus</span>
                <span className="material-symbols-outlined text-[16px]">lock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
