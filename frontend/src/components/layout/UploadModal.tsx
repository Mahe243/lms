import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, addLibraryItem, courses, setActiveVideoUrl, setCurrentPath, user } = useApp();
  
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user.name);
  const [category, setCategory] = useState<'Book' | 'Research Paper' | 'Lecture Note' | 'Cheat Sheet' | 'Case Study' | 'Video Lecture'>('Lecture Note');
  const [associatedCourse, setAssociatedCourse] = useState(courses[0]?.id || '');
  const [tagsInput, setTagsInput] = useState('');
  const [summary, setSummary] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    // Auto-fill title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    
    // Auto-detect category
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
      setCategory('Video Lecture');
    } else if (file.name.match(/\.(pdf)$/i)) {
      setCategory('Research Paper');
    } else if (file.name.match(/\.(md|txt|docx)$/i)) {
      setCategory('Lecture Note');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'file' && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    if (activeTab === 'link' && !linkUrl.trim()) {
      alert('Please provide a URL link');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    let fileUrl = linkUrl;
    let fileType = 'link';
    let fileSize = '';

    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
      fileType = selectedFile.type || 'document';
      fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Try optional backend upload
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('type', category.toLowerCase());
        formData.append('course_id', associatedCourse);
        formData.append('author', author);
        formData.append('description', summary);

        await fetch('/api/resources/upload', {
          method: 'POST',
          body: formData,
        }).catch(() => {
          // Backend might be offline; client-side storage handles it seamlessly
        });
      } catch {
        // Fallback to client-side only
      }
    }

    setUploadProgress(70);

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter((t) => t.length > 0);

      addLibraryItem({
        title: title || 'Untitled Artifact',
        author: author || user.name,
        category,
        tags: parsedTags.length > 0 ? parsedTags : ['Uploaded Artifact'],
        readTime: category === 'Video Lecture' ? '25m Video' : '15m Read',
        summary: summary || `Uploaded on ${new Date().toLocaleDateString()}`,
        citation: `${author || user.name} (2026). ${title}. Personal LMS Vault.`,
        fileUrl,
        fileType,
        fileSize,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      // If user uploaded a video, immediately load and open it in Classroom!
      if (category === 'Video Lecture' && fileUrl) {
        setActiveVideoUrl(fileUrl);
        setCurrentPath('classroom');
      }

      setIsUploadModalOpen(false);
      resetForm();
    }, 600);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setSummary('');
    setTagsInput('');
    setLinkUrl('');
    setUploadProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-surface-container-lowest dark:bg-dark-surface rounded-2xl shadow-2xl border border-surface-variant/60 dark:border-dark-border overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-variant/40 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-serif font-bold text-on-surface dark:text-dark-text">
                Upload Learning Artifacts & Videos
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
                Add research papers, lecture recordings, PDFs, and notes to your Second Brain (+50 XP)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher: Local File vs Link */}
        <div className="flex border-b border-surface-variant/30 px-5 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'file'
                ? 'border-primary text-primary dark:text-inverse-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            <span>Upload Local File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'link'
                ? 'border-primary text-primary dark:text-inverse-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            <span>Import via URL (YouTube / Video / ArXiv)</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-body-md">
          {activeTab === 'file' ? (
            <div>
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-surface-variant/60 dark:border-dark-border hover:bg-surface-container-low dark:hover:bg-dark-surface-2'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.mp4,.webm,.mkv,.mov,.docx,.md,.txt,.epub"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                <span className={`material-symbols-outlined text-[36px] mb-2 ${selectedFile ? 'text-emerald-500' : 'text-primary'}`}>
                  {selectedFile ? 'task_alt' : 'cloud_upload'}
                </span>

                {selectedFile ? (
                  <div>
                    <span className="font-bold text-sm text-on-surface dark:text-dark-text block">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-sm text-on-surface dark:text-dark-text">
                      Drag & drop your file here, or <span className="text-primary underline">browse</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant dark:text-dark-text-muted mt-1">
                      Supports Video (.mp4, .webm), Documents (.pdf, .docx, .epub), and Markdown (.md, .txt)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Resource or Video URL
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  link
                </span>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://arxiv.org/pdf/..."
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    if (e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be') || e.target.value.endsWith('.mp4')) {
                      setCategory('Video Lecture');
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
                Document / Video Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Transformers & Self-Attention Explained"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
                Resource Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md cursor-pointer"
              >
                <option value="Video Lecture">Video Lecture (Classroom Playable)</option>
                <option value="Research Paper">Research Paper</option>
                <option value="Book">Book / eBook</option>
                <option value="Lecture Note">Lecture Note</option>
                <option value="Cheat Sheet">Cheat Sheet</option>
                <option value="Case Study">Case Study</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
                Author / Source
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University / Prof. Andrew Ng"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
                Associated Course (Optional)
              </label>
              <select
                value={associatedCourse}
                onChange={(e) => setAssociatedCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md cursor-pointer"
              >
                <option value="">General Second Brain (No specific course)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
              Synapse Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Attention, LLM, Deep Learning, Transformer"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
              Key Takeaway or Summary
            </label>
            <textarea
              rows={3}
              placeholder="Brief executive summary or key findings of this material..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md resize-none leading-relaxed"
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1 pt-1 animate-fadeIn">
              <div className="flex justify-between text-[11px] font-code-sm font-bold text-primary">
                <span>Ingesting artifact into Vault...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-variant/30">
            <span className="text-[11px] text-on-surface-variant">
              Indexed for semantic search & Classroom playback
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading || (activeTab === 'file' && !selectedFile) || (activeTab === 'link' && !linkUrl.trim())}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isUploading ? 'sync' : 'upload'}
                </span>
                <span>{isUploading ? 'Processing...' : 'Upload & Index'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
