import React, { useState, useEffect } from 'react';
import { NovaCompanion } from '../kingdom/NovaCompanion';
import { resourcesApi } from '../../api/resources';
import type { LibraryItem } from '../../types';

interface ResourceReaderModalProps {
  item: LibraryItem;
  onClose: () => void;
  onToggleBookmark?: (id: string) => void;
}

export const ResourceReaderModal: React.FC<ResourceReaderModalProps> = ({
  item,
  onClose,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'preview'>('content');
  const [isMaximized, setIsMaximized] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copied, setCopied] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [fullText, setFullText] = useState<string>(item.fullNotes || '');
  const [isLoading, setIsLoading] = useState(false);

  // If fullNotes was not passed or is empty, fetch full content from backend API
  useEffect(() => {
    if (!item.fullNotes || item.fullNotes === item.summary) {
      setIsLoading(true);
      resourcesApi
        .getResourceContent(item.id)
        .then((res) => {
          if (res && res.extracted_text) {
            setFullText(res.extracted_text);
          }
        })
        .catch(() => {
          // If content endpoint fails, try getResource
          resourcesApi
            .getResource(item.id)
            .then((r) => {
              if (r && r.extracted_text) {
                setFullText(r.extracted_text);
              }
            })
            .catch(() => {});
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFullText(item.fullNotes);
    }
  }, [item.id, item.fullNotes, item.summary]);

  const handleCopyNotes = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCitation = () => {
    if (!item.citation) return;
    navigator.clipboard.writeText(item.citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
  const isPdf =
    item.fileType?.toLowerCase() === 'pdf' ||
    (item.fileUrl && item.fileUrl.toLowerCase().endsWith('.pdf'));

  // Clean Markdown Renderer
  const renderMarkdown = (content: string) => {
    if (!content) {
      return (
        <div className="py-12 text-center text-on-surface-variant dark:text-dark-text-muted">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block">description</span>
          <p className="font-semibold text-sm">No complete text content available for this resource.</p>
          <p className="text-xs mt-1">Review the executive summary tab or open the original source file.</p>
        </div>
      );
    }

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockLines: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);
        elements.push(
          <div key={key} className="overflow-x-auto my-4 rounded-xl border border-surface-variant/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-high dark:bg-dark-surface-2 border-b border-surface-variant/50">
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="p-2.5 font-bold text-on-surface dark:text-dark-text">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/30">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-surface-container-low/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-on-surface-variant dark:text-dark-text-muted">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <span>{codeBlockLang || 'Code'}</span>
              </div>
              <pre>{codeBlockLines.join('\n')}</pre>
            </div>
          );
          codeBlockLines = [];
          inCodeBlock = false;
          codeBlockLang = '';
        } else {
          flushTable(`pre-code-${idx}`);
          inCodeBlock = true;
          codeBlockLang = line.trim().replace('```', '');
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Tables (lines starting with | and containing |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const rowCells = line.split('|').slice(1, -1);
        if (rowCells.some((c) => c.includes('---'))) {
          // Divider row, skip
          return;
        }
        tableRows.push(rowCells);
        inTable = true;
        return;
      } else if (inTable) {
        flushTable(`table-${idx}`);
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="font-serif font-bold text-xl md:text-2xl text-on-surface dark:text-dark-text mt-6 mb-3 pb-2 border-b border-surface-variant/30">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="font-serif font-bold text-lg md:text-xl text-primary dark:text-inverse-primary mt-5 mb-2.5">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="font-sans font-bold text-sm md:text-base text-on-surface dark:text-dark-text mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted mt-3 mb-1.5">
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.startsWith('> ')) {
        // Blockquotes
        elements.push(
          <blockquote key={idx} className="my-2.5 pl-4 py-1.5 border-l-4 border-kingdom-gold bg-amber-500/5 rounded-r-lg italic text-on-surface-variant dark:text-dark-text-muted text-xs leading-relaxed">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        // Bullet points
        const text = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span className="text-xs text-on-surface dark:text-dark-text leading-relaxed">
              {formatInline(text)}
            </span>
          </div>
        );
      } else if (/^\d+\.\s+/.test(line.trim())) {
        // Numbered list
        const num = line.trim().match(/^(\d+)\.\s+/)?.[1];
        const text = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 pl-2">
            <span className="font-mono text-[11px] font-bold text-kingdom-cyan shrink-0 min-w-[16px]">
              {num}.
            </span>
            <span className="text-xs text-on-surface dark:text-dark-text leading-relaxed">
              {formatInline(text)}
            </span>
          </div>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-4 border-surface-variant/40" />);
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={idx} className="my-2 text-xs text-on-surface dark:text-dark-text leading-relaxed">
            {formatInline(line)}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable('end-table');
    }

    return elements;
  };

  // Helper for bold, italic, code inline
  const formatInline = (text: string): React.ReactNode => {
    // Process **bold** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-on-surface dark:text-dark-text">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-surface-container dark:bg-dark-surface-2 font-mono text-[11px] text-kingdom-cyan border border-surface-variant/30">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const fontSizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-sm md:text-base' : 'text-xs md:text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full bg-surface-container-lowest dark:bg-dark-surface rounded-2xl shadow-2xl border border-surface-variant/60 dark:border-dark-border overflow-hidden flex flex-col transition-all duration-200 ${
          isMaximized ? 'w-[98vw] h-[95vh] max-w-none' : 'max-w-4xl max-h-[90vh] h-[85vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-variant/40 dark:border-dark-border bg-surface-container-low dark:bg-dark-surface-2">
          <div className="flex items-center gap-3 min-w-0">
            <NovaCompanion expression="focused" size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary text-[10px] font-code-sm font-bold uppercase">
                  {item.category}
                </span>
                <span className="text-[11px] text-on-surface-variant dark:text-dark-text-muted truncate">
                  {item.author} {item.year ? `• ${item.year}` : ''}
                </span>
                {item.readTime && (
                  <span className="text-[10px] font-code-sm text-kingdom-gold font-bold">
                    ⏱ {item.readTime}
                  </span>
                )}
              </div>
              <h2 className="font-headline-sm text-base md:text-lg font-bold font-serif text-on-surface dark:text-dark-text truncate mt-0.5">
                {item.title}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(item.id)}
                title={item.bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-amber-500 hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[20px] ${item.bookmarked ? 'text-amber-500 fill-current' : ''}`}>
                  {item.bookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            )}

            <button
              onClick={handleCopyNotes}
              title="Copy notes to clipboard"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore size' : 'Maximize window'}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer hidden sm:inline-flex"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMaximized ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>

            <button
              onClick={onClose}
              title="Close reader"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer ml-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Reading Controls */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-surface-container-lowest dark:bg-dark-surface border-b border-surface-variant/30 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'content'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Complete Notes</span>
              {wordCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-mono">
                  {wordCount}w
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">summarize</span>
              <span>Overview & Meta</span>
            </button>

            {item.fileUrl && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPdf ? 'picture_as_pdf' : 'open_in_new'}
                </span>
                <span>{isPdf ? 'PDF Document' : 'Original File'}</span>
              </button>
            )}
          </div>

          {/* Reading Font Size Controls */}
          {activeTab === 'content' && (
            <div className="hidden sm:flex items-center gap-1 bg-surface-container-low dark:bg-dark-surface-2 p-1 rounded-lg border border-surface-variant/30">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  fontSize === 'sm' ? 'bg-surface shadow-xs text-primary' : 'text-on-surface-variant'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  fontSize === 'base' ? 'bg-surface shadow-xs text-primary' : 'text-on-surface-variant'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  fontSize === 'lg' ? 'bg-surface shadow-xs text-primary' : 'text-on-surface-variant'
                }`}
              >
                A+
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin text-kingdom-cyan">
                progress_activity
              </span>
              <p className="font-bold text-xs">Loading complete knowledge document from vault...</p>
            </div>
          ) : activeTab === 'content' ? (
            <div className={`max-w-3xl mx-auto space-y-1 font-body-md ${fontSizeClass}`}>
              {renderMarkdown(fullText)}
            </div>
          ) : activeTab === 'summary' ? (
            <div className="max-w-2xl mx-auto space-y-5 text-xs">
              {/* Academic Citation Block */}
              <div className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-on-surface text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">format_quote</span>
                    Standard Academic Citation
                  </span>
                  <button
                    onClick={handleCopyCitation}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedCitation ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedCitation ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-code-sm text-on-surface-variant dark:text-dark-text-muted leading-relaxed select-all">
                  {item.citation || `${item.author} (2026). ${item.title}. Learnova Second Brain.`}
                </p>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 space-y-2">
                <h4 className="font-bold text-sm text-on-surface dark:text-dark-text">
                  Executive Summary & Core Thesis
                </h4>
                <p className="text-on-surface-variant dark:text-dark-text-muted leading-relaxed text-xs">
                  {item.summary}
                </p>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Category</span>
                  <span className="font-bold text-on-surface dark:text-dark-text text-xs mt-0.5 block">
                    {item.category}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Estimated Time</span>
                  <span className="font-bold text-on-surface dark:text-dark-text text-xs mt-0.5 block">
                    {item.readTime || '15 mins'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Word Count</span>
                  <span className="font-bold text-on-surface dark:text-dark-text text-xs mt-0.5 block">
                    {wordCount} words
                  </span>
                </div>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-on-surface-variant uppercase mb-2">
                    Curriculum Tags & Concepts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-surface-container dark:bg-dark-surface-2 border border-surface-variant/30 text-primary dark:text-inverse-primary text-xs font-code-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 3: Original File Preview / Download */
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-4">
              {isPdf && item.fileUrl ? (
                <div className="w-full h-full flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-on-surface">Integrated PDF Document Viewer</span>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open in New Tab</span>
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  </div>
                  <iframe
                    src={item.fileUrl}
                    title={item.title}
                    className="w-full flex-1 min-h-[500px] rounded-xl border border-surface-variant/50 shadow-inner"
                  />
                </div>
              ) : (
                <div className="py-16 text-center space-y-4 max-w-md">
                  <span className="material-symbols-outlined text-5xl text-primary opacity-80 block">
                    file_present
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-on-surface dark:text-dark-text">
                      {item.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
                      Direct file access is available for this resource in your Knowledge Kingdom vault.
                    </p>
                  </div>
                  {item.fileUrl && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        <span>Open Original File</span>
                      </a>
                      <a
                        href={item.fileUrl}
                        download
                        className="px-4 py-2 rounded-xl bg-surface-container dark:bg-dark-surface-2 border border-surface-variant text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 bg-surface-container-low dark:bg-dark-surface-2 border-t border-surface-variant/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-code-sm text-on-surface-variant text-[11px]">
              Second Brain Archive Vault • Learnova
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
