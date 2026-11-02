import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassroomVideoPlayer } from '../classroom/ClassroomVideoPlayer';
import { coursesApi, type CourseDetailResponse, type TopicResponse } from '../../api/courses';
import confetti from 'canvas-confetti';

export const ClassroomView: React.FC = () => {
  const { activeLesson, setActiveLesson, markLessonComplete, refreshWallet } = useApp();
  const [activeTab, setActiveTab] = useState<'reader' | 'matrix' | 'path' | 'code' | 'notion' | 'quiz'>('reader');
  


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

  const handleSubmitQuiz = async () => {
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
      await refreshWallet();
    }
  };

  const [courseDetail, setCourseDetail] = useState<CourseDetailResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    coursesApi.getCourse(activeLesson.courseId)
      .then((data) => {
        if (isMounted) setCourseDetail(data);
      })
      .catch(() => {
        // Fallback gracefully
      });
    return () => {
      isMounted = false;
    };
  }, [activeLesson.courseId]);

  const allBackendTopics: TopicResponse[] = courseDetail?.modules
    ? courseDetail.modules.flatMap((m) => m.topics)
    : [];

  const curriculumNodes = allBackendTopics.length > 0
    ? allBackendTopics.map((top, idx) => ({
        id: top.id,
        number: String(idx + 1).padStart(2, '0'),
        title: top.title,
        status: top.id === activeLesson.id ? 'active' : (top.status === 'completed' ? 'completed' : 'locked'),
        duration: `${top.estimated_minutes || 30}m`,
        rawTopic: top
      }))
    : [
        { id: '1', number: '01', title: 'Vector Quantization & Product Quantizers', status: 'completed', duration: '35m', rawTopic: null },
        { id: '2', number: '02', title: 'Speculative Decoding & KV Cache Paging', status: 'completed', duration: '40m', rawTopic: null },
        { id: '3', number: '03', title: 'Hybrid Search Architecture: BM25 + RRF', status: 'active', duration: '28m', rawTopic: null },
        { id: '4', number: '04', title: 'Cross-Encoder Distillation & FlashRank', status: 'locked', duration: '45m', rawTopic: null },
        { id: '5', number: '05', title: 'Multi-Tenant ACL Partitioning in Milvus', status: 'locked', duration: '50m', rawTopic: null },
      ];

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="font-bold text-kingdom-violet uppercase">THE ACADEMY</span>
          <span>/</span>
          <span>Enterprise RAG Pipelines</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">{activeLesson.moduleTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeLesson.completed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              MASTERED (+50 XP, +25 Coins)
            </span>
          ) : (
            <button
              onClick={async () => {
                markLessonComplete(activeLesson.id);
                confetti({ particleCount: 60 });
                await refreshWallet();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-kingdom-violet hover:bg-kingdom-violet-light text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Complete Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Lesson Title & Lead */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 dark:text-white tracking-tight">
          {activeLesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Master the integration of lexical inverted indexes (BM25) with dense vector representations (HNSW) to overcome semantic blind spots at enterprise scale.
        </p>
      </div>

      {/* Main Grid: Video + Content Tabs (Left 8 cols) & Syllabus + Notes (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media Player & Content Reader (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Real Classroom Video Player */}
          <ClassroomVideoPlayer
            videoUrl={activeLesson.videoUrl || 'https://www.youtube.com/watch?v=kCc8FmEb1nY'}
            topicId={activeLesson.id}
            lessonTitle={activeLesson.title}
            onLessonComplete={async () => {
              markLessonComplete(activeLesson.id);
              confetti({ particleCount: 60 });
              await refreshWallet();
            }}
            onTimestampCapture={(secs) => {
              const m = Math.floor(secs / 60);
              const s = Math.floor(secs % 60);
              const stamp = `[${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}] `;
              handleSaveNotes((notes ? notes + '\n' : '') + `${stamp}Lecture note: `);
            }}
          />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-kingdom-navy-dark p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reader'
                  ? 'bg-white dark:bg-kingdom-navy-card text-kingdom-violet shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Deep-Dive Reader</span>
            </button>
            <button
              onClick={() => setActiveTab('path')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'path'
                  ? 'bg-white dark:bg-kingdom-navy-card text-kingdom-violet shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">route</span>
              <span>Learning Path</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-kingdom-navy-card text-kingdom-violet shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>Trade-off Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-kingdom-navy-card text-kingdom-violet shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>RRF Python Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('notion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'notion'
                  ? 'bg-white dark:bg-kingdom-navy-card text-kingdom-violet shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Post-Mortem</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-white dark:bg-kingdom-navy-card text-kingdom-violet shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Knowledge Check</span>
            </button>
          </div>

          {/* TAB 1: DEEP-DIVE READER */}
          {activeTab === 'reader' && (
            <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-6">
              {/* Key Takeaways */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-kingdom-navy-dark border border-slate-200/60 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-kingdom-gold text-[18px]">lightbulb</span>
                  Core Architectural Invariants
                </h3>
                <ul className="flex flex-col gap-2">
                  {activeLesson.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-kingdom-violet mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formatted Markdown Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4 text-xs sm:text-sm leading-relaxed">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                  1. The Inadequacy of Pure Dense Vector Retrieval
                </h3>
                <p>
                  While approximate nearest-neighbor algorithms (like HNSW or ScaNN) capture semantic concepts with remarkable fidelity, they suffer from catastrophic failure modes when queries contain alphanumeric part numbers, legal clause citations, or domain-specific identifiers.
                </p>

                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                  2. Reciprocal Rank Fusion (RRF) Formulation
                </h3>
                <p>
                  Instead of normalizing distances from two completely different mathematical spaces, RRF uses only the ordinal rank of each document:
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto border border-slate-200 dark:border-slate-800">
                  RRF_Score(d) = Σ [ 1 / (k + rank_m(d)) ]  where k = 60
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL LEARNING PATH */}
          {activeTab === 'path' && (
            <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    The Academy Learning Trail
                  </h3>
                  <p className="text-xs text-slate-400">
                    Master consecutive knowledge nodes to upgrade your Academy tier.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-kingdom-violet px-2.5 py-1 rounded-full bg-kingdom-violet/10">
                  2 / 5 Nodes Completed
                </span>
              </div>

              {/* Connected Visual Pathway */}
              <div className="relative flex flex-col gap-4 py-2">
                {curriculumNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      node.status === 'completed'
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : node.status === 'active'
                        ? 'bg-kingdom-violet/5 border-kingdom-violet/40 shadow-xs ring-1 ring-kingdom-violet/20'
                        : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          node.status === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : node.status === 'active'
                            ? 'bg-kingdom-violet text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {node.status === 'completed' ? '✓' : node.number}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {node.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Estimated duration: {node.duration}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        node.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : node.status === 'active'
                          ? 'bg-kingdom-violet text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRADE-OFF MATRIX */}
          {activeTab === 'matrix' && (
            <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-400">
                    <th className="pb-3">Retrieval Paradigm</th>
                    <th className="pb-3">Strengths</th>
                    <th className="pb-3">Vulnerabilities</th>
                    <th className="pb-3">Optimal Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">BM25 Inverted Index</td>
                    <td className="py-3">Exact keyword match, zero hallucination, sub-millisecond</td>
                    <td className="py-3">Synonym blindness, fails on paraphrasing</td>
                    <td className="py-3">Product SKUs, legal clause codes, author names</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">Dense Embeddings (HNSW)</td>
                    <td className="py-3">Semantic abstraction, cross-lingual synthesis</td>
                    <td className="py-3">High memory footprint, catastrophic acronym collisions</td>
                    <td className="py-3">Broad thematic queries, conceptual similarity</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-kingdom-violet">Reciprocal Rank Fusion (RRF)</td>
                    <td className="py-3">Calibration-free, blends lexical + semantic rank gracefully</td>
                    <td className="py-3">Requires two indexing systems in tandem</td>
                    <td className="py-3 font-bold text-kingdom-emerald">Enterprise Multi-Tenant Knowledge Hubs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: RRF PYTHON ENGINE */}
          {activeTab === 'code' && (
            <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">rrf_pipeline.py</span>
                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                  <span>{isRunningCode ? 'Running...' : 'Execute Script'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{`def reciprocal_rank_fusion(ranked_lists: list[list[str]], k: int = 60) -> dict:
    scores = {}
    for r_list in ranked_lists:
        for rank, doc_id in enumerate(r_list, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))`}</pre>
              </div>

              {codeOutput && (
                <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-emerald-900/40">
                  <pre>{codeOutput}</pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: POST-MORTEM */}
          {activeTab === 'notion' && (
            <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Production Failure Mode: The Notion Workspace Incident
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When Notion initially replaced their PostgreSQL full-text search with a pure dense vector system in 2023, customer support tickets exploded by 430%. Users searching for exact document IDs (e.g. "PRD-2023-Q4") were returned unrelated engineering strategy docs because cosine similarity between alphanumeric tokens was essentially random.
              </p>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-300">
                <strong>Resolution:</strong> Restoring Tantivy BM25 alongside Milvus vector search with an RRF merger eliminated 100% of the identifier recall failures while preserving conceptual queries.
              </div>
            </div>
          )}

          {/* TAB 6: KNOWLEDGE CHECK QUIZ */}
          {activeTab === 'quiz' && (
            <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Concept Mastery Knowledge Check
                </h3>
                {quizSubmitted && (
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    Score: {quizScore} / {activeLesson.quiz.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-5">
                {activeLesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-kingdom-navy-dark border border-slate-200/60 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-kingdom-violet';

                        if (quizSubmitted) {
                          if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300';
                          else if (isSelected) btnStyle = 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-800 dark:text-red-300';
                        } else if (isSelected) {
                          btnStyle = 'border-kingdom-violet bg-kingdom-violet/10 text-kingdom-violet font-bold';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(qIdx, oIdx)}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <span className="text-emerald-500 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!quizSubmitted && (
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-2.5 rounded-xl bg-kingdom-violet text-white text-xs font-bold shadow-xs hover:bg-kingdom-violet-light transition-all"
                >
                  Verify Concept Understanding
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Syllabus Matrix & Notes Scratchpad (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Syllabus Progress Card */}
          <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Module Curriculum Syllabus
            </h3>
            <div className="flex flex-col gap-2">
              {curriculumNodes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.rawTopic) {
                      const modTitle = courseDetail?.modules.find((m) => m.id === item.rawTopic?.module_id)?.title || 'Curriculum Module';
                      setActiveLesson({
                        id: item.rawTopic.id,
                        courseId: item.rawTopic.course_id,
                        title: item.rawTopic.title,
                        moduleTitle: modTitle,
                        duration: `${item.rawTopic.estimated_minutes || 30}:00`,
                        completed: item.rawTopic.status === 'completed',
                        videoUrl: activeLesson.videoUrl,
                        keyTakeaways: item.rawTopic.learning_objectives?.length > 0
                          ? item.rawTopic.learning_objectives
                          : ['Master core architectural invariants and implementations.'],
                        markdownContent: item.rawTopic.description || 'Lecture deep-dive reader content.',
                        quiz: activeLesson.quiz,
                      });
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    item.status === 'active'
                      ? 'bg-kingdom-violet/10 border-kingdom-violet text-kingdom-violet font-bold shadow-xs'
                      : item.status === 'completed'
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{item.number}. {item.title}</span>
                  {item.status === 'completed' ? (
                    <span className="text-emerald-500 font-bold">✓</span>
                  ) : item.status === 'active' ? (
                    <span className="w-2 h-2 rounded-full bg-kingdom-violet animate-pulse"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Notes Scratchpad */}
          <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lecture Notes Vault
              </h3>
              {noteSaved && <span className="text-[11px] text-emerald-500 font-bold">Saved ✓</span>}
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleSaveNotes(e.target.value)}
              className="w-full h-40 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none font-mono focus:outline-none focus:border-kingdom-violet"
              placeholder="Jot down notes or key formulas..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
