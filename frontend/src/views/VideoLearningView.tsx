import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Clock, Sparkles, MessageSquare, Plus,
  FileText, CheckCircle2, ChevronRight, Upload, AlertCircle
} from 'lucide-react';
import { Resource, Comment, Course } from '../types';
import { api } from '../api';

interface VideoLearningViewProps {
  courses: Course[];
  initialResourceId?: string;
  onNavigate: (tab: string, meta?: any) => void;
}

export const VideoLearningView: React.FC<VideoLearningViewProps> = ({
  courses,
  initialResourceId,
  onNavigate,
}) => {
  const [videoResources, setVideoResources] = useState<Resource[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Resource | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentType, setNewCommentType] = useState<'observation' | 'doubt'>('observation');
  const [currentTimeSecs, setCurrentTimeSecs] = useState<number>(0);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [showTranscriptUpload, setShowTranscriptUpload] = useState(false);

  // Video notes
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    api.getResources({ res_type: 'video' }).then((res) => {
      setVideoResources(res);
      if (initialResourceId) {
        const found = res.find((r) => r.id === initialResourceId);
        if (found) setSelectedVideo(found);
      } else if (res.length > 0) {
        setSelectedVideo(res[0]);
      }
    });
  }, [initialResourceId]);

  useEffect(() => {
    if (selectedVideo) {
      setCurrentTimeSecs(selectedVideo.resume_position_secs || 0);
      api.getComments({ target_type: 'video', course_id: selectedVideo.course_id }).then(setComments);
    }
  }, [selectedVideo]);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?enablejsapi=1` : null;
  };

  const handleAddTimestampedComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo || !newCommentText.trim()) return;

    try {
      const c = await api.createComment({
        target_type: 'video',
        target_id: selectedVideo.id,
        course_id: selectedVideo.course_id,
        topic_id: selectedVideo.topic_id,
        text: newCommentText,
        comment_type: newCommentType,
        timestamp_secs: currentTimeSecs,
      });
      setComments((prev) => [c, ...prev]);
      setNewCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTranscript = async () => {
    if (!selectedVideo || !transcriptInput.trim()) return;
    try {
      const updated = await api.saveTranscript(selectedVideo.id, transcriptInput);
      setSelectedVideo(updated);
      setShowTranscriptUpload(false);
      setTranscriptInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const embedUrl = getYoutubeEmbedUrl(selectedVideo?.url);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Video Learning Workspace</h2>
          <p className="text-xs text-neutral-500">Timestamped notes, doubt capture, and grounded transcript study</p>
        </div>
      </div>

      {!selectedVideo ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
          No video learning materials added yet. Add a video URL from the Resource Library!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player & Notes Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={selectedVideo.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedVideo.url ? (
                <div className="text-center p-8 text-neutral-400 text-xs">
                  <p className="mb-2">External video link without standard embed preview:</p>
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg inline-block font-medium hover:bg-indigo-700"
                  >
                    Open in External Player ↗
                  </a>
                </div>
              ) : (
                <div className="text-neutral-400 text-xs">Video file not specified</div>
              )}
            </div>

            {/* Video Meta & Resume Position Controls */}
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                  {selectedVideo.title}
                </h3>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Author: {selectedVideo.author || 'Unspecified'} • Resume Timestamp: {formatSeconds(currentTimeSecs)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTranscriptUpload(!showTranscriptUpload)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50"
                >
                  {selectedVideo.extracted_text ? 'View / Edit Transcript' : 'Add Transcript'}
                </button>
                <button
                  onClick={() =>
                    onNavigate('ai-tutor', {
                      resourceId: selectedVideo.id,
                      initialMessage: `I am studying "${selectedVideo.title}". Can you summarize the core principles covered?`,
                    })
                  }
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-1"
                >
                  <Sparkles size={13} />
                  <span>Ask AI Tutor</span>
                </button>
              </div>
            </div>

            {/* Transcript Upload / Inspector Drawer */}
            {showTranscriptUpload && (
              <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Authorized Transcript / VTT / SRT</span>
                  <span className="text-[10px] text-neutral-400">Enables exact timestamp citations</span>
                </div>
                <textarea
                  rows={4}
                  value={transcriptInput || selectedVideo.extracted_text || ''}
                  onChange={(e) => setTranscriptInput(e.target.value)}
                  placeholder="Paste timestamped transcript, SRT, or VTT subtitles here..."
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowTranscriptUpload(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTranscript}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Save Transcript
                  </button>
                </div>
              </div>
            )}

            {/* Video Notes Scratchpad */}
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5">
                <FileText size={14} className="text-amber-500" />
                <span>Notes Beside Video</span>
              </span>
              <textarea
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Type lecture notes as you watch..."
                className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Right Column: Timestamped Comments & Playlist */}
          <div className="space-y-4">
            {/* Timestamped Doubts & Notes Box */}
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs flex flex-col h-96">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                  Timestamped Comments & Doubts
                </span>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  {formatSeconds(currentTimeSecs)}
                </span>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2 text-xs">
                {comments.length === 0 ? (
                  <p className="text-neutral-400 text-center py-8">
                    Add timestamped observations or questions while watching.
                  </p>
                ) : (
                  comments.map((cm) => (
                    <div
                      key={cm.id}
                      className={`p-2.5 rounded-lg border transition ${
                        cm.comment_type === 'doubt'
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40'
                          : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          [{formatSeconds(cm.timestamp_secs || 0)}]
                        </span>
                        <span className="capitalize">{cm.comment_type}</span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">{cm.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddTimestampedComment} className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Record timestamped thought..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                />
                <div className="flex justify-between items-center text-xs">
                  <select
                    value={newCommentType}
                    onChange={(e) => setNewCommentType(e.target.value as any)}
                    className="text-[11px] p-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  >
                    <option value="observation">Observation</option>
                    <option value="doubt">Save as Doubt</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
                  >
                    Save at {formatSeconds(currentTimeSecs)}
                  </button>
                </div>
              </form>
            </div>

            {/* Video Playlist Navigation */}
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                Course Video Playlist
              </span>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-48 overflow-y-auto text-xs">
                {videoResources.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVideo(v)}
                    className={`py-2 px-1 flex items-center justify-between cursor-pointer rounded transition ${
                      selectedVideo.id === v.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="truncate pr-2">{v.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">~{v.estimated_duration_mins}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
