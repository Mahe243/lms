import React, { useState, useEffect, useRef, useCallback } from 'react';
import { coursesApi } from '../../api/courses';

interface ClassroomVideoPlayerProps {
  videoUrl?: string;
  topicId: string;
  lessonTitle: string;
  onLessonComplete?: () => void;
  onTimestampCapture?: (seconds: number) => void;
}

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export const ClassroomVideoPlayer: React.FC<ClassroomVideoPlayerProps> = ({
  videoUrl,
  topicId,
  lessonTitle,
  onLessonComplete,
  onTimestampCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const lastSavedTimeRef = useRef<number>(0);

  const youtubeId = extractYouTubeId(videoUrl);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sync initial watch progress from backend on mount or topicId change
  useEffect(() => {
    if (!topicId) return;
    coursesApi
      .getWatchProgress(topicId)
      .then((data) => {
        if (data.resume_position_secs && data.resume_position_secs > 0) {
          setCurrentTime(data.resume_position_secs);
          lastSavedTimeRef.current = data.resume_position_secs;
          if (videoRef.current) {
            videoRef.current.currentTime = data.resume_position_secs;
          }
        }
        if (data.completed) {
          setHasCompleted(true);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, [topicId]);

  // Periodic watch progress saver (every 5 seconds of active watch time)
  const saveProgress = useCallback(
    async (posSecs: number, durSecs: number, forceCompleted: boolean = false) => {
      if (!topicId) return;
      const isCompleted = forceCompleted || (durSecs > 0 && posSecs / durSecs >= 0.85);

      try {
        const res = await coursesApi.recordWatchProgress(topicId, {
          position_secs: posSecs,
          duration_secs: durSecs,
          completed: isCompleted,
        });

        if (isCompleted && !hasCompleted) {
          setHasCompleted(true);
          if (onLessonComplete) onLessonComplete();
        }

        lastSavedTimeRef.current = posSecs;
        return res;
      } catch {
        // Log silently
      }
    },
    [topicId, hasCompleted, onLessonComplete]
  );

  // Direct HTML5 Video Event Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || duration;
    setCurrentTime(current);

    // Save every 5 seconds of difference
    if (Math.abs(current - lastSavedTimeRef.current) >= 5) {
      saveProgress(current, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    setHasError(false);
    setIsBuffering(false);

    if (currentTime > 0 && currentTime < dur) {
      videoRef.current.currentTime = currentTime;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    saveProgress(duration, duration, true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newFraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newFraction * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveProgress(newTime, duration);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      saveProgress(videoRef.current.currentTime, duration);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  // Flush progress on unmount
  useEffect(() => {
    return () => {
      if (currentTime > 0 && duration > 0) {
        coursesApi.recordWatchProgress(topicId, {
          position_secs: currentTime,
          duration_secs: duration,
          completed: hasCompleted,
        }).catch(() => {});
      }
    };
  }, [topicId, currentTime, duration, hasCompleted]);

  // Case 1: Real YouTube Video
  if (youtubeId) {
    return (
      <div key={youtubeId} className="relative rounded-2xl overflow-hidden bg-[#0A0F1D] text-white shadow-xl aspect-video border border-kingdom-violet/20 flex flex-col justify-between group">
        <iframe
          key={youtubeId}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&rel=0`}
          title={lessonTitle || 'Lesson Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          {onTimestampCapture && (
            <button
              onClick={() => onTimestampCapture(Math.floor(currentTime))}
              className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-white/90 hover:bg-kingdom-violet transition-colors flex items-center gap-1 shadow-md"
              title="Add note at current timestamp"
            >
              <span className="material-symbols-outlined text-[14px]">timer</span>
              <span>Timestamp Note</span>
            </button>
          )}

          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-white/90 hover:text-red-400 transition-colors flex items-center gap-1 shadow-md"
            title="Open on YouTube directly if embed has copyright restrictions"
          >
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            <span>YouTube Link</span>
          </a>
        </div>
      </div>
    );
  }

  // Case 2: Direct MP4 / Uploaded Video URL
  const effectiveUrl = videoUrl || '/uploads/sample_lesson.mp4';

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0A0F1D] text-white shadow-xl aspect-video border border-kingdom-violet/20 flex flex-col justify-between group select-none">
      {/* Real HTML5 Video Element */}
      <video
        ref={videoRef}
        src={effectiveUrl}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
          setHasError(true);
          setIsBuffering(false);
        }}
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-10 h-10 border-4 border-kingdom-violet border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-6 gap-3 z-20">
          <span className="material-symbols-outlined text-red-400 text-4xl">error</span>
          <span className="text-sm font-bold text-slate-200">Video source is unavailable or unsupported.</span>
          <p className="text-xs text-slate-400 max-w-md">
            Provide a valid YouTube URL (e.g. youtube.com/watch?v=...) or upload an MP4/WebM file to the Vault.
          </p>
        </div>
      )}

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-white/90 border border-white/10">
          {lessonTitle}
        </span>
        {hasCompleted && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[10px] font-bold font-mono border border-emerald-500/30 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">check</span>
            <span>Completed (85%+)</span>
          </span>
        )}
      </div>

      {/* Timestamp note button */}
      {onTimestampCapture && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => onTimestampCapture(Math.floor(currentTime))}
            className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-white/90 hover:bg-kingdom-violet transition-colors flex items-center gap-1 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>{formatTime(currentTime)} Note</span>
          </button>
        </div>
      )}

      {/* Bottom Interactive Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-4 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        {/* Progress Scrubber */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/bar"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-kingdom-violet rounded-full relative transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md"></div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-kingdom-violet transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <span className="font-mono text-xs text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume Slider */}
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (videoRef.current) videoRef.current.muted = newMuted;
                }}
                className="hover:text-kingdom-violet"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                </span>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-kingdom-violet cursor-pointer h-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-kingdom-violet text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                {speed}x
              </button>
            ))}

            <button
              onClick={() => {
                if (videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  } else {
                    videoRef.current.requestFullscreen().catch(() => {});
                  }
                }
              }}
              className="p-1 hover:text-kingdom-violet ml-1"
              title="Fullscreen"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
