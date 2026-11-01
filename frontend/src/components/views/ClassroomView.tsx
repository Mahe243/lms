import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export const ClassroomView: React.FC = () => {
  const {
    activeCourseId,
    courses,
    selectCourse,
    activeLesson,
    selectLesson,
    availableLessons,
    activeVideoUrl,
    setActiveVideoUrl,
    markLessonComplete,
    setIsUploadModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reader' | 'matrix' | 'code' | 'notion' | 'quiz' | 'ai-bot'>('reader');
  
  // AI Bot in Classroom state
  const [aiBotInput, setAiBotInput] = useState('');
  const [aiBotMessages, setAiBotMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Hello Maheswar! I am your AI Study Copilot for this lecture. You can ask me to summarize the video, explain difficult terms, derive formulas, or generate flashcards.',
      time: 'Just now'
    }
  ]);
  const [isAiBotTyping, setIsAiBotTyping] = useState(false);

  // Real HTML5 Video Player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [showControls, setShowControls] = useState(true);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState('');
  const [videoError, setVideoError] = useState(false);

  // Notes state
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`learnova_notes_${activeLesson.id}`) || 
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

  // Sync active lesson video URL
  useEffect(() => {
    setVideoError(false);
    if (activeLesson.videoUrl) {
      setActiveVideoUrl(activeLesson.videoUrl);
      if (videoRef.current) {
        videoRef.current.load();
        setIsPlaying(false);
      }
    }
  }, [activeLesson, setActiveVideoUrl]);

  // Load notes for active lesson
  useEffect(() => {
    const saved = localStorage.getItem(`learnova_notes_${activeLesson.id}`);
    if (saved) {
      setNotes(saved);
    }
    // Reset quiz for new lesson
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [activeLesson.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log('Autoplay prevented:', e));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speedStr: string) => {
    setPlaybackSpeed(speedStr);
    const speed = parseFloat(speedStr);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (!activeLesson.completed) {
      markLessonComplete(activeLesson.id);
      confetti({ particleCount: 70 });
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVideoUrlInput.trim()) return;
    setActiveVideoUrl(customVideoUrlInput.trim());
    setShowCustomUrlInput(false);
    setCustomVideoUrlInput('');
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setActiveVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem(`learnova_notes_${activeLesson.id}`, val);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleAiBotSend = (customPrompt?: string) => {
    const textToSend = customPrompt || aiBotInput;
    if (!textToSend.trim() || isAiBotTyping) return;

    setAiBotMessages((prev) => [
      ...prev,
      { sender: 'user', text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    if (!customPrompt) setAiBotInput('');
    setIsAiBotTyping(true);

    setTimeout(() => {
      setIsAiBotTyping(false);
      let reply = '';
      const low = textToSend.toLowerCase();
      if (low.includes('summarize') || low.includes('summary')) {
        reply = `### Key Takeaways for: ${activeLesson.title}\n\n` +
          activeLesson.keyTakeaways.map((t, idx) => `${idx + 1}. **${t.split(':')[0]}**: ${t}`).join('\n') +
          `\n\n**Practical Conclusion:** This architecture ensures deterministic execution while keeping response latency strictly within enterprise SLAs.`;
      } else if (low.includes('simple') || low.includes('explain')) {
        reply = `### Simple Breakdown for ${activeLesson.title}\n\nImagine you are searching for a specific book in a library:\n\n1. **Keyword search (BM25)** is looking for the exact title on the spine (e.g. ISBN or exact name).\n2. **Semantic search (Dense Vectors)** is asking the librarian for "books that feel like mystery novels in space".\n3. **Hybrid RRF** combines the librarian's list with the exact index so you never miss the exact match while still getting conceptual matches!`;
      } else if (low.includes('quiz') || low.includes('question')) {
        reply = `### Quick Practice Check:\n\n**Q1:** What is the primary purpose of the dampening constant $k=60$ in Reciprocal Rank Fusion?\n*Hint:* Consider what happens to rank 1 vs rank 2 without it!\n\n**Q2:** When is BM25 strictly superior to vector search?\n*Hint:* Think about error codes, serial numbers, and exact product SKUs.`;
      } else {
        reply = `### Analytical Response:\n\nRegarding *"**${textToSend}**"* in this lecture:\n\n- The core principle relies on invariant constraints and latency budgets.\n- You can review the companion notes in the **Deep-Dive Reader** tab or run simulations in the **Code Sandbox**!`;
      }

      setAiBotMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 600);
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

  const isYouTube =
    activeVideoUrl.includes('youtube.com') ||
    activeVideoUrl.includes('youtu.be') ||
    /^[a-zA-Z0-9_-]{11}$/.test(activeVideoUrl.trim());

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (!url) return '';
      const clean = url.trim();
      let videoId = '';
      if (clean.includes('youtube.com/embed/')) {
        videoId = clean.split('youtube.com/embed/')[1]?.split(/[?&]/)[0] || '';
      } else if (clean.includes('youtu.be/')) {
        videoId = clean.split('youtu.be/')[1]?.split(/[?&]/)[0] || '';
      } else if (clean.includes('youtube.com/shorts/')) {
        videoId = clean.split('youtube.com/shorts/')[1]?.split(/[?&]/)[0] || '';
      } else if (clean.includes('youtube.com/live/')) {
        videoId = clean.split('youtube.com/live/')[1]?.split(/[?&]/)[0] || '';
      } else if (clean.includes('v=')) {
        videoId = clean.split('v=')[1]?.split('&')[0] || '';
      } else if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
        videoId = clean;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1` : clean;
    } catch {
      return url;
    }
  };

  const youtubePresets = [
    { title: 'Andrej Karpathy: Intro to LLMs', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', tag: 'AI' },
    { title: 'Stanford: Vector DB & RAG', url: 'https://www.youtube.com/watch?v=QdDoFfkVkcw', tag: 'RAG' },
    { title: 'Damodaran: Valuation Masterclass', url: 'https://www.youtube.com/watch?v=e_H8n1xL_g8', tag: 'Valuation' },
    { title: 'MIT: Central Banking & Rates', url: 'https://www.youtube.com/watch?v=1qhT33g3K0g', tag: 'Finance' },
    { title: 'Flink: Event-Driven Streaming', url: 'https://www.youtube.com/watch?v=B7bV31xW88s', tag: 'Data' },
    { title: '3Blue1Brown: Neural Networks', url: 'https://www.youtube.com/watch?v=aircAruvnKk', tag: 'Math' }
  ];

  const handleOpenPopupPlayer = () => {
    let url = activeVideoUrl.trim();
    if (!url.startsWith('http')) {
      url = `https://www.youtube.com/watch?v=${url}`;
    }
    window.open(url, 'LMS_Floating_Player', 'width=960,height=580,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
  };

  const currentCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Course Switcher & Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-variant/40 dark:border-dark-border pb-3">
        <div className="flex items-center gap-3">
          {/* Course Dropdown Selector */}
          <select
            value={activeCourseId}
            onChange={(e) => selectCourse(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/50 text-xs font-bold font-code-sm text-primary dark:text-inverse-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          <span className="text-on-surface-variant dark:text-dark-text-muted text-xs hidden sm:inline">/</span>
          <span className="text-on-surface dark:text-dark-text font-semibold text-xs hidden sm:inline">
            {activeLesson.moduleTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload / Add Material Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Add Material / Video</span>
          </button>

          {activeLesson.completed ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-code-sm">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              MASTERED (+120 XP)
            </span>
          ) : (
            <button
              onClick={() => {
                markLessonComplete(activeLesson.id);
                confetti({ particleCount: 60 });
              }}
              className="px-3 py-1.5 rounded-full bg-primary hover:bg-primary-container text-white text-xs font-bold font-label-md flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Lesson Title & Lead */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary text-[10px] font-code-sm font-bold uppercase">
            {currentCourse.code} • {currentCourse.track}
          </span>
          <span className="text-xs text-on-surface-variant dark:text-dark-text-muted">
            Instructor: {currentCourse.instructor}
          </span>
        </div>

        <h1 className="font-headline-lg text-2xl lg:text-3xl font-serif font-bold text-on-surface dark:text-dark-text tracking-tight">
          {activeLesson.title}
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant dark:text-dark-text-muted">
          {currentCourse.description}
        </p>
      </div>

      {/* Main Grid: Video + Tabs (8 cols) & Syllabus + Notes (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Media Player & Content Reader (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Video Player Source & Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 dark:border-dark-border text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`px-2 py-0.5 rounded-full font-code-sm font-bold text-[10px] flex items-center gap-1 ${
                isYouTube
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400'
                  : 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {isYouTube ? 'YouTube HD Stream' : 'Local / Direct Video'}
              </span>
              <span className="font-semibold text-on-surface dark:text-dark-text truncate max-w-xs sm:max-w-md">
                {activeLesson.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isYouTube && (
                <>
                  <a
                    href={activeVideoUrl.startsWith('http') ? activeVideoUrl : `https://www.youtube.com/watch?v=${activeVideoUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    title="Open this video directly on YouTube"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Watch on YouTube</span>
                  </a>

                  <button
                    onClick={handleOpenPopupPlayer}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Open floating player in separate window so you can watch while taking notes"
                  >
                    <span className="material-symbols-outlined text-[16px]">picture_in_picture_alt</span>
                    <span>Popup Player</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                title="Paste any YouTube or video URL"
              >
                <span className="material-symbols-outlined text-[16px]">smart_display</span>
                <span>Paste YouTube URL</span>
              </button>

              <label className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-[16px]">file_upload</span>
                <span>Play Local File</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleLocalVideoUpload} />
              </label>

              <button
                onClick={() => setActiveTab('ai-bot')}
                className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary dark:text-inverse-primary hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Ask AI Study Bot"
              >
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                <span>Ask AI Bot</span>
              </button>
            </div>
          </div>

          {/* Custom URL Input Bar */}
          {showCustomUrlInput && (
            <form
              onSubmit={handleCustomUrlSubmit}
              className="p-3 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-primary/30 shadow-md flex flex-col sm:flex-row items-center gap-2 animate-fadeIn"
            >
              <span className="material-symbols-outlined text-primary text-[20px] hidden sm:inline">link</span>
              <input
                type="text"
                placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=zjkBMFhNj_g or ID)..."
                value={customVideoUrlInput}
                onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                className="flex-1 w-full px-3 py-1.5 rounded-lg bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-container"
                >
                  Play Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Real Working Video Player */}
          <div
            ref={videoContainerRef}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative rounded-2xl overflow-hidden bg-black text-white shadow-xl aspect-video flex flex-col justify-between border border-white/10 group select-none"
          >
            {isYouTube ? (
              <iframe
                src={getYouTubeEmbedUrl(activeVideoUrl)}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {/* HTML5 Native Video Element */}
                <video
                  ref={videoRef}
                  src={activeVideoUrl}
                  playsInline
                  preload="metadata"
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-contain cursor-pointer bg-black"
                />

                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center z-10">
                    <span className="material-symbols-outlined text-amber-400 text-[48px] mb-2">videocam_off</span>
                    <p className="text-white font-bold text-sm mb-1">Video Stream Notice</p>
                    <p className="text-white/70 text-xs max-w-md mb-4">
                      Unable to stream this specific URL directly in your browser. You can load a local video file or paste any YouTube or MP4 link using the controls above.
                    </p>
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-container">
                        Play My Video
                        <input type="file" accept="video/*" className="hidden" onChange={handleLocalVideoUpload} />
                      </label>
                      <button
                        onClick={() => setShowCustomUrlInput(true)}
                        className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30"
                      >
                        Paste URL
                      </button>
                    </div>
                  </div>
                )}

                {/* Big Center Play Overlay Button */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-opacity"
                  >
                    <div className="w-18 h-18 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[44px] ml-1">play_arrow</span>
                    </div>
                  </div>
                )}

                {/* Top Video Header Overlay */}
                <div className={`absolute top-0 left-0 right-0 p-3.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-xs font-code-sm text-white/90 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold truncate max-w-sm">{activeLesson.title}</span>
                  </div>

                  {/* Change Video Source / Upload Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">file_upload</span>
                      <span>Play My Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleLocalVideoUpload}
                      />
                    </label>

                    <button
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {/* Custom URL Input Bar Overlay */}
                {showCustomUrlInput && (
                  <form
                    onSubmit={handleCustomUrlSubmit}
                    className="absolute top-12 left-4 right-4 p-3 rounded-xl bg-black/90 backdrop-blur-md border border-white/20 z-30 flex items-center gap-2 animate-fadeIn"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">link</span>
                    <input
                      type="url"
                      placeholder="Paste MP4 stream or YouTube video URL..."
                      value={customVideoUrlInput}
                      onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer"
                    >
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomUrlInput(false)}
                      className="p-1 text-white/70 hover:text-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </form>
                )}

                {/* Bottom Controls Bar */}
                <div className={`absolute bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Timeline Scrubber */}
                  <div
                    onClick={handleSeek}
                    className="w-full h-2 bg-white/25 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all group/bar"
                  >
                    <div
                      className="h-full bg-primary rounded-full relative"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md"></div>
                    </div>
                  </div>

                  {/* Button Controls */}
                  <div className="flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="p-1 hover:text-primary transition-colors cursor-pointer"
                        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                      >
                        <span className="material-symbols-outlined text-[26px]">
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={toggleMute}
                          className="hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                          </span>
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-16 accent-primary cursor-pointer h-1"
                        />
                      </div>

                      <span className="font-code-sm text-xs font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Speed Buttons */}
                      {['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-0.5 rounded text-[11px] font-code-sm transition-colors cursor-pointer ${
                            playbackSpeed === spd
                              ? 'bg-primary text-white font-bold'
                              : 'bg-white/10 hover:bg-white/20 text-white/80'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}

                      {/* Fullscreen */}
                      <button
                        onClick={handleFullscreen}
                        className="p-1 hover:text-primary transition-colors cursor-pointer"
                        title="Fullscreen"
                      >
                        <span className="material-symbols-outlined text-[22px]">fullscreen</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Embed Restriction Fallback Helper Banner */}
          {isYouTube && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400 shrink-0">info</span>
                <span className="leading-snug">
                  If video says <strong>"Video unavailable / blocked on this website by content owner (e.g. ETPL)"</strong>:
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenPopupPlayer}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                  title="Open in compact floating window"
                >
                  <span className="material-symbols-outlined text-[15px]">picture_in_picture_alt</span>
                  <span>Open Floating Player</span>
                </button>
                <a
                  href={activeVideoUrl.startsWith('http') ? activeVideoUrl : `https://www.youtube.com/watch?v=${activeVideoUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold text-xs flex items-center gap-1 text-amber-950 dark:text-amber-100 transition-all"
                >
                  <span>Watch on YouTube</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>
          )}

          {/* Curated YouTube Lectures Quick-Pick */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-xs overflow-x-auto">
            <span className="font-bold text-[10px] uppercase font-code-sm text-on-surface-variant shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-red-500">play_circle</span>
              YouTube Lectures:
            </span>
            <div className="flex items-center gap-1.5">
              {youtubePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveVideoUrl(preset.url);
                    setVideoError(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer"
                >
                  <span className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[9px] font-code-sm">{preset.tag}</span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low dark:bg-dark-surface-2 p-1 rounded-xl border border-surface-variant/40 dark:border-dark-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Python Engine Sandbox</span>
            </button>
            <button
              onClick={() => setActiveTab('notion')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'notion'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>Production Architecture</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Knowledge Check</span>
              {quizSubmitted && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
            </button>
            <button
              onClick={() => setActiveTab('ai-bot')}
              className={`px-4 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'ai-bot'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary dark:text-inverse-primary hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span>Ask AI Study Bot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
                {activeLesson.title}
              </h3>

              <div className="prose dark:prose-invert max-w-none text-xs text-on-surface-variant dark:text-dark-text-muted whitespace-pre-line">
                {activeLesson.markdownContent}
              </div>

              <h4 className="font-headline-sm text-base font-bold mt-2 text-on-surface dark:text-dark-text">
                Key Takeaways & Core Concepts
              </h4>
              <ul className="space-y-2 text-xs text-on-surface-variant dark:text-dark-text-muted">
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
                Benchmark Trade-Off Matrix
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                Evaluated against high-density enterprise technical documents on AWS c6i.4xlarge instances.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body-md border-collapse">
                  <thead>
                    <tr className="border-b border-surface-variant/60 dark:border-dark-border font-bold uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted bg-surface-container-low dark:bg-dark-surface-2">
                      <th className="p-3">Architecture Paradigm</th>
                      <th className="p-3">P99 Latency</th>
                      <th className="p-3">Exact ID Recall</th>
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
                      <td className="p-3 font-code-sm text-amber-600">54.2%</td>
                      <td className="p-3 font-code-sm">Low (Inverted Index)</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
                      <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                        Dense HNSW (Milvus / Qdrant)
                      </td>
                      <td className="p-3 font-code-sm">18.5 ms</td>
                      <td className="p-3 font-code-sm text-red-500 font-bold">62.1%</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">89.8%</td>
                      <td className="p-3 font-code-sm">High (RAM Graphs)</td>
                    </tr>
                    <tr className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary">
                      <td className="p-3 font-bold text-primary dark:text-inverse-primary">
                        Hybrid RRF + Flash Reranker
                      </td>
                      <td className="p-3 font-code-sm font-bold">28.4 ms</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">98.9%</td>
                      <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">93.7%</td>
                      <td className="p-3 font-code-sm">Moderate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CODE SANDBOX */}
          {activeTab === 'code' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                    Executable Python Code Engine
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                    {activeLesson.codeSnippet?.description || 'Interactive algorithm simulator.'}
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
                  {activeLesson.codeSnippet?.code || `# Python code sandbox ready\ndef execute():\n    return "Algorithm verified"`}
                </pre>
              </div>

              {codeOutput && (
                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-emerald-500/30 text-xs font-code-sm text-on-surface dark:text-dark-text animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                    <span className="material-symbols-outlined text-[16px]">terminal</span>
                    <span>Console Output</span>
                  </div>
                  <pre className="whitespace-pre overflow-x-auto font-mono">{codeOutput}</pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ARCHITECTURE CASE STUDY */}
          {activeTab === 'notion' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
              <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                Production System Design Breakdown
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-dark-text-muted leading-relaxed">
                Examining production-grade multi-tenant scale, permission filtering, and low-latency query routing across distributed clusters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
                  <span className="font-bold text-primary block mb-1">Lexical Inverted Shards</span>
                  <p className="text-on-surface-variant dark:text-dark-text-muted">
                    Disk-backed Tantivy/Lucene indexes partitioned by workspace UUID to enforce zero-leakage data isolation and instantaneous exact SKU matching.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
                  <span className="font-bold text-primary block mb-1">Dense HNSW Partitions</span>
                  <p className="text-on-surface-variant dark:text-dark-text-muted">
                    In-memory vector graphs quantized via SQ8 to support rapid semantic search across millions of abstract conceptual queries.
                  </p>
                </div>
              </div>
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-code-sm ${
                      quizScore === activeLesson.quiz.length
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Score: {quizScore} / {activeLesson.quiz.length}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {activeLesson.quiz.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 dark:border-dark-border flex flex-col gap-3"
                  >
                    <p className="font-semibold text-xs text-on-surface dark:text-dark-text">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        let optStyle =
                          'border-surface-variant/50 dark:border-dark-border hover:bg-surface-container-high dark:hover:bg-dark-surface';
                        if (quizSubmitted) {
                          if (oIdx === q.correctIndex) {
                            optStyle =
                              'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold';
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
                    className="px-5 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-variant transition-colors cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: AI STUDY BOT */}
          {activeTab === 'ai-bot' && (
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-serif font-bold text-on-surface dark:text-dark-text">
                      AI Study Copilot ? Lesson Intelligence
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                      Contextualized to: <span className="font-semibold text-primary">{activeLesson.title}</span>
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-code-sm font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                <button
                  onClick={() => handleAiBotSend('Summarize the top 3 takeaways of this video lesson')}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary hover:text-white transition-all text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">summarize</span>
                  <span>Summarize Video</span>
                </button>
                <button
                  onClick={() => handleAiBotSend('Explain this concept in simple terms with an analogy')}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary hover:text-white transition-all text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                  <span>Explain Simply</span>
                </button>
                <button
                  onClick={() => handleAiBotSend('Generate 2 practice quiz questions on this topic')}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary hover:text-white transition-all text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">quiz</span>
                  <span>Quiz Me</span>
                </button>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 max-h-96 overflow-y-auto p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-xs font-body-md leading-relaxed">
                {aiBotMessages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line ${
                        m.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-surface-container-lowest dark:bg-dark-surface text-on-surface dark:text-dark-text border border-surface-variant/40 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/60 mt-0.5 px-1">{m.time}</span>
                  </div>
                ))}

                {isAiBotTyping && (
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 w-16 flex items-center gap-1 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiBotSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question about this lecture..."
                  value={aiBotInput}
                  onChange={(e) => setAiBotInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
                />
                <button
                  type="submit"
                  disabled={!aiBotInput.trim() || isAiBotTyping}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Ask</span>
                </button>
              </form>
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

          {/* Interactive Course Syllabus Matrix */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
              <span className="text-xs font-bold font-serif uppercase tracking-wider text-on-surface dark:text-dark-text">
                Course Syllabus
              </span>
              <span className="text-xs font-code-sm text-primary dark:text-inverse-primary font-bold">
                {availableLessons.filter((l) => l.completed).length} / {availableLessons.length} Completed
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {availableLessons.map((lesson, idx) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary dark:text-inverse-primary font-bold shadow-sm'
                        : 'border-surface-variant/40 dark:border-dark-border hover:bg-surface-container-low dark:hover:bg-dark-surface-2 text-on-surface dark:text-dark-text'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-code-sm text-xs opacity-60">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{lesson.title}</span>
                        <span className="text-[10px] font-code-sm opacity-60 font-normal">
                          {lesson.duration}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {lesson.completed ? (
                        <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px] opacity-40">play_circle</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
