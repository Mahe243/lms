import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ClassroomVideoPlayerProps {
  videoUrl: string;
  lessonTitle: string;
  onVideoEnded?: () => void;
  onCustomUrlChange?: (url: string) => void;
}

export const ClassroomVideoPlayer: React.FC<ClassroomVideoPlayerProps> = ({
  videoUrl,
  lessonTitle,
  onVideoEnded,
  onCustomUrlChange,
}) => {
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

  // Check if current URL is YouTube
  const isYouTube =
    videoUrl.includes('youtube.com') ||
    videoUrl.includes('youtu.be') ||
    /^[a-zA-Z0-9_-]{11}$/.test(videoUrl.trim());

  // Format YouTube embed with origin to minimize embed blocks
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

      if (videoId) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0&modestbranding=1`;
      }
      return clean;
    } catch {
      return url;
    }
  };

  const getYouTubeWatchUrl = (url: string) => {
    const clean = url.trim();
    if (clean.startsWith('http')) return clean;
    return `https://www.youtube.com/watch?v=${clean}`;
  };

  const handleOpenPopupPlayer = () => {
    const url = getYouTubeWatchUrl(videoUrl);
    window.open(url, 'LMS_Floating_Player', 'width=980,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
  };

  // Preset educational videos
  const lecturePresets = [
    { title: 'Andrej Karpathy: Intro to Large Language Models', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', tag: 'AI/LLM' },
    { title: 'Stanford: Vector Databases, RAG & Search', url: 'https://www.youtube.com/watch?v=QdDoFfkVkcw', tag: 'RAG' },
    { title: 'Prof. Damodaran: Corporate Valuation Masterclass', url: 'https://www.youtube.com/watch?v=znmQ7oMiQrM', tag: 'Finance' },
    { title: 'MIT OpenCourseWare: Central Banking & Monetary Policy', url: 'https://www.youtube.com/watch?v=_SpIaGTq0u8', tag: 'Economics' },
    { title: 'Apache Kafka in 6 Minutes: Streaming Architecture', url: 'https://www.youtube.com/watch?v=Ch5VhJzaoaI', tag: 'Data' },
    { title: '3Blue1Brown: What is a Neural Network?', url: 'https://www.youtube.com/watch?v=aircAruvnKk', tag: 'Math' }
  ];

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      if (onCustomUrlChange) {
        onCustomUrlChange(objectUrl);
      }
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVideoUrlInput.trim()) return;
    if (onCustomUrlChange) {
      onCustomUrlChange(customVideoUrlInput.trim());
    }
    setShowCustomUrlInput(false);
    setCustomVideoUrlInput('');
  };

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

  const handleEnded = () => {
    setIsPlaying(false);
    if (onVideoEnded) {
      onVideoEnded();
      confetti({ particleCount: 75, spread: 60 });
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Video Source Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 dark:border-dark-border text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-0.5 rounded-full font-code-sm font-bold text-[10px] flex items-center gap-1.5 ${
              isYouTube
                ? 'bg-red-600/10 text-red-600 dark:text-red-400'
                : 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {isYouTube ? 'YouTube Stream' : 'Direct / Local Video'}
          </span>
          <span className="font-semibold text-on-surface dark:text-dark-text truncate max-w-xs sm:max-w-md">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isYouTube && (
            <>
              <a
                href={getYouTubeWatchUrl(videoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                title="Open this video directly on YouTube (useful if copyright holder disabled iframe embedding)"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Watch on YouTube</span>
              </a>

              <button
                onClick={handleOpenPopupPlayer}
                className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                title="Open floating player in separate window so you can watch without restriction while taking notes"
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
            <span>Change Video URL</span>
          </button>

          <label className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            <span>Upload MP4</span>
            <input type="file" accept="video/*" className="hidden" onChange={handleLocalVideoUpload} />
          </label>
        </div>
      </div>

      {/* Helpful notification if YouTube video embedding is restricted by owner (e.g. ETPL) */}
      {isYouTube && (
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-500 text-[16px]">info</span>
            <span>
              If YouTube shows <strong>&quot;Video unavailable / Blocked from display&quot;</strong>, the content owner disabled iframe embeds. Click <strong>&quot;Watch on YouTube&quot;</strong> or <strong>&quot;Popup Player&quot;</strong> above to watch smoothly without leaving your notes.
            </span>
          </div>
          <button
            onClick={handleOpenPopupPlayer}
            className="text-primary dark:text-inverse-primary hover:underline font-bold whitespace-nowrap cursor-pointer"
          >
            Open Popup &rarr;
          </button>
        </div>
      )}

      {/* Custom URL Input Bar */}
      {showCustomUrlInput && (
        <form
          onSubmit={handleCustomUrlSubmit}
          className="p-3 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-primary/30 shadow-md flex flex-col gap-2 animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
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
                Load Stream
              </button>
              <button
                type="button"
                onClick={() => setShowCustomUrlInput(false)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-surface-variant/30 text-[11px]">
            <span className="text-on-surface-variant dark:text-dark-text-muted font-semibold">Recommended Lectures:</span>
            {lecturePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onCustomUrlChange) onCustomUrlChange(preset.url);
                  setShowCustomUrlInput(false);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                {preset.tag}: {preset.title.split(':')[0]}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* Main Video Display Container */}
      <div
        ref={videoContainerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative rounded-2xl overflow-hidden bg-black text-white shadow-xl aspect-video flex flex-col justify-between border border-white/10 group select-none"
      >
        {isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            {/* Native HTML5 Video */}
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onError={() => setVideoError(true)}
              className="w-full h-full object-contain cursor-pointer bg-black"
            />

            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center z-10">
                <span className="material-symbols-outlined text-amber-400 text-[48px] mb-2">videocam_off</span>
                <p className="text-white font-bold text-base mb-1">Video Stream Notice</p>
                <p className="text-white/70 text-xs max-w-md mb-4">
                  Unable to stream this direct video file in browser. You can load a local video file from your computer or switch to any YouTube lecture.
                </p>
                <div className="flex gap-2">
                  <label className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-container">
                    Play Local File
                    <input type="file" accept="video/*" className="hidden" onChange={handleLocalVideoUpload} />
                  </label>
                  <button
                    onClick={() => setShowCustomUrlInput(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30"
                  >
                    Paste YouTube Link
                  </button>
                </div>
              </div>
            )}

            {/* Play Overlay */}
            {!isPlaying && !videoError && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[40px] ml-1">play_arrow</span>
                </div>
              </div>
            )}

            {/* Native Controls Overlay Bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Progress Seek Bar */}
              <div
                onClick={handleSeek}
                className="w-full h-1.5 bg-white/30 hover:h-2.5 rounded-full cursor-pointer relative transition-all group/seek"
              >
                <div
                  className="h-full bg-primary rounded-full relative"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Bottom Control Buttons */}
              <div className="flex items-center justify-between text-xs font-code-sm">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 group/vol">
                    <button onClick={toggleMute} className="hover:text-primary transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">
                        {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                      </span>
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-14 h-1 bg-white/30 rounded-lg accent-primary cursor-pointer"
                    />
                  </div>

                  <span className="text-white/70 text-[11px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px]">
                    {['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-1.5 py-0.5 rounded transition-colors ${
                          playbackSpeed === spd ? 'bg-primary text-white font-bold' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>

                  <button onClick={handleFullscreen} className="hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
