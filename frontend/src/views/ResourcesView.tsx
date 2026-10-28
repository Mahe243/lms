import React, { useState, useEffect } from 'react';
import {
  Folder, Plus, Upload, Link2, ExternalLink, Video, FileText,
  Star, Eye, CheckCircle2, RotateCcw, Search, Grid, List,
  Trash2, AlertCircle, Sparkles, BookOpen
} from 'lucide-react';
import { Resource, Course } from '../types';
import { api } from '../api';

interface ResourcesViewProps {
  courses: Course[];
  initialCourseId?: string;
  onNavigate: (tab: string, meta?: any) => void;
  onRefreshResources: () => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  courses,
  initialCourseId,
  onNavigate,
  onRefreshResources,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || '');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Modals
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Add URL state
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('article');
  const [newDesc, setNewDesc] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<Resource | null>(null);

  // File Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources({
        course_id: selectedCourseId || undefined,
        res_type: filterType === 'all' ? undefined : filterType,
      });
      setResources(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterType, selectedCourseId]);

  const handleUrlBlur = async () => {
    if (!newUrl.trim()) return;
    try {
      const dup = await api.checkDuplicateUrl(newUrl);
      if (dup.exists && dup.resource) {
        setDuplicateWarning(dup.resource);
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUrlResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    try {
      await api.createResource({
        title: newTitle || newUrl,
        url: newUrl,
        type: newType as any,
        description: newDesc,
        course_id: selectedCourseId || undefined,
      });
      setShowAddUrlModal(false);
      setNewUrl('');
      setNewTitle('');
      setNewDesc('');
      setDuplicateWarning(null);
      fetchResources();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadLoading(true);
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      if (uploadTitle) form.append('title', uploadTitle);
      if (selectedCourseId) form.append('course_id', selectedCourseId);

      await fetch('/api/resources/upload', {
        method: 'POST',
        body: form,
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchResources();
    } catch (e) {
      console.error(e);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenResource = async (r: Resource) => {
    try {
      await api.recordDeliberateVisit('resource_open', 'resource', r.id, r.course_id);
      setSelectedResource(r);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Learning Resource Library</h2>
          <p className="text-xs text-neutral-500">Collect videos, papers, PDFs, and articles with text indexing</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 shadow-xs"
          >
            <Upload size={14} />
            <span>Upload PDF / File</span>
          </button>
          <button
            onClick={() => setShowAddUrlModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Link / Video</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-[#e8e2d7] dark:border-neutral-800 shadow-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'video', label: 'Videos' },
            { id: 'pdf', label: 'PDFs' },
            { id: 'article', label: 'Articles' },
            { id: 'book', label: 'Books' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filterType === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter resources..."
              className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
            />
          </div>

          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-100'}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-100'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Resources Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => handleOpenResource(r)}
              className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {r.type}
                  </span>
                  {r.indexing_status === 'indexed' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                      <Sparkles size={11} />
                      <span>Searchable RAG</span>
                    </span>
                  ) : r.indexing_status === 'ocr_required' ? (
                    <span className="text-amber-500 font-medium">Scanned (Needs OCR)</span>
                  ) : null}
                </div>

                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-2.5 line-clamp-2">
                  {r.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {r.description || 'No description provided'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{r.author || 'Author unspecified'}</span>
                <span>Opened {r.open_count || 0} times</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#e8e2d7] dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => handleOpenResource(r)}
              className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center justify-between cursor-pointer transition text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-[10px] uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded">
                  {r.type}
                </span>
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">{r.title}</span>
                  <span className="text-neutral-400 text-[11px]">{r.author || 'Unspecified'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-neutral-400 text-[11px]">
                {r.indexing_status === 'indexed' && <span className="text-emerald-600 font-medium">Searchable</span>}
                <span>Opened {r.open_count}x</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Detail / Preview Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {selectedResource.type}
                </span>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mt-1">
                  {selectedResource.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {selectedResource.url && (
                <div className="flex items-center space-x-2">
                  <a
                    href={selectedResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    <span>Open External Resource Link</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {selectedResource.type === 'video' && (
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
                  <span>Take notes and ask AI questions in Video Learning mode:</span>
                  <button
                    onClick={() => {
                      onNavigate('videos', { resourceId: selectedResource.id });
                      setSelectedResource(null);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                  >
                    Open in Video Player →
                  </button>
                </div>
              )}

              {selectedResource.extracted_text && (
                <div className="space-y-1">
                  <span className="font-semibold block text-neutral-700 dark:text-neutral-300">
                    Extracted & Grounded Text:
                  </span>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg max-h-60 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {selectedResource.extracted_text}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
                <span>Indexing: {selectedResource.indexing_status}</span>
                <button
                  onClick={() => {
                    onNavigate('ai-tutor', { resourceId: selectedResource.id });
                    setSelectedResource(null);
                  }}
                  className="flex items-center space-x-1 text-indigo-600 hover:underline font-medium"
                >
                  <Sparkles size={12} />
                  <span>Ask AI Tutor about this Resource</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add URL */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Add Web Resource / Video Link</h3>
            <form onSubmit={handleAddUrlResource} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Resource URL</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              {duplicateWarning && (
                <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Duplicate URL detected:</span>
                    This link already exists as "{duplicateWarning.title}". You can proceed to create or update.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Raft Consensus Visualization"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Resource Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                >
                  <option value="article">Article / Website</option>
                  <option value="video">Video (YouTube / Lecture)</option>
                  <option value="pdf">Online PDF Paper</option>
                  <option value="book">Book / Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of this material..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload File */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Upload File & Process Text</h3>
            <form onSubmit={handleUploadFileSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Choose File (PDF, TXT, MD)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.txt,.md,.vtt,.srt"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  PDF text and page numbers are automatically extracted and indexed for the AI tutor.
                </p>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Leave empty to use filename"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading & Indexing...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
