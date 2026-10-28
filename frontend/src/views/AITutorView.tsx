import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, BookOpen, Layers, CheckSquare, FileText,
  ThumbsUp, ThumbsDown, Plus, Trash2, ExternalLink, Bookmark,
  RotateCcw, AlertTriangle, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { Course, AIConversation, AIMessage } from '../types';
import { api } from '../api';

interface AITutorViewProps {
  courses: Course[];
  initialCourseId?: string;
  initialTopicId?: string;
  initialResourceId?: string;
  selectedPassage?: string;
  initialMessage?: string;
  onNavigate: (tab: string, meta?: any) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  courses,
  initialCourseId,
  initialTopicId,
  initialResourceId,
  selectedPassage,
  initialMessage,
  onNavigate,
}) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState(initialMessage || '');
  const [loading, setLoading] = useState(false);
  const [contextMode, setContextMode] = useState<'my_materials' | 'my_materials_plus_general'>('my_materials_plus_general');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || '');
  const [promptType, setPromptType] = useState('standard');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const data = await api.getAIConversations(selectedCourseId || undefined);
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
        setMessages(data[0].messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [selectedCourseId]);

  useEffect(() => {
    if (activeConvId) {
      const found = conversations.find((c) => c.id === activeConvId);
      if (found) setMessages(found.messages);
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customPromptType?: string, overrideText?: string) => {
    const textToSend = overrideText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const chosenPromptType = customPromptType || promptType;
    setInputMessage('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId || '',
      role: 'user',
      content: textToSend,
      source_citations: [],
      helpfulness_rating: 0,
      prompt_type: chosenPromptType,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.chatWithTutor({
        conversation_id: activeConvId || undefined,
        message: textToSend,
        course_id: selectedCourseId || undefined,
        resource_id: initialResourceId,
        topic_id: initialTopicId,
        selected_passage: selectedPassage,
        context_mode: contextMode,
        prompt_type: chosenPromptType,
      });

      if (!activeConvId && res.conversation_id) {
        setActiveConvId(res.conversation_id);
      }

      const assistantMsg: AIMessage = {
        id: res.message_id,
        conversation_id: res.conversation_id,
        role: 'assistant',
        content: res.content,
        source_citations: res.citations || [],
        helpfulness_rating: 0,
        prompt_type: res.prompt_type,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      fetchConversations();
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        conversation_id: activeConvId || '',
        role: 'assistant',
        content: `❌ Error: ${err.message}`,
        source_citations: [],
        helpfulness_rating: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (msgId: string, rating: number) => {
    try {
      await api.rateAIMessage(msgId, rating);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, helpfulness_rating: rating } : m))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveToNotes = async (content: string) => {
    try {
      await api.createNote({
        title: `AI Tutor Note - ${new Date().toLocaleDateString()}`,
        content,
        course_id: selectedCourseId || undefined,
        template_type: 'questions_doubts',
      });
      alert('Explanation successfully saved to Notes!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-[#e8e2d7] dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
      {/* Left Conversations Sidebar */}
      <div className="w-64 border-r border-[#e8e2d7] dark:border-neutral-800 flex flex-col bg-[#faf8f5]/60 dark:bg-neutral-900/60">
        <div className="p-3 border-b border-[#e8e2d7] dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Tutor History
          </span>
          <button
            onClick={() => {
              setActiveConvId(null);
              setMessages([]);
            }}
            className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            title="New Conversation"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">No prior chats</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConvId(c.id);
                  setMessages(c.messages);
                }}
                className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition ${
                  activeConvId === c.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span className="truncate pr-2">{c.title}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tutor Context Bar */}
        <div className="h-14 border-b border-[#e8e2d7] dark:border-neutral-800 px-6 flex items-center justify-between bg-white dark:bg-neutral-900">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Answer Mode:</span>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setContextMode('my_materials')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  contextMode === 'my_materials'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                My Materials Only
              </button>
              <button
                onClick={() => setContextMode('my_materials_plus_general')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  contextMode === 'my_materials_plus_general'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Materials + General
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-400">Course Scope:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs p-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              <option value="">All Materials</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {selectedPassage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold block mb-0.5">Anchored Excerpt:</span>
              <p className="italic">"{selectedPassage}"</p>
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="text-center py-16 space-y-3 max-w-md mx-auto text-xs text-neutral-500">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                AI Tutor Grounded in Your Materials
              </h3>
              <p className="leading-relaxed">
                Ask about concepts from your uploaded lecture papers, video notes, or flashcards. The tutor will cite exact documents, pages, and timestamps.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs rounded-br-xs'
                    : 'bg-[#faf8f5] dark:bg-neutral-800 border border-[#e8e2d7] dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Grounding Citations */}
                {m.source_citations && m.source_citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5">
                    <span className="font-semibold text-[10px] text-neutral-500 uppercase tracking-wider block">
                      Sources Cited:
                    </span>
                    {m.source_citations.map((cit, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-start justify-between"
                      >
                        <div>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {cit.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 ml-1.5 font-mono">
                            {cit.page_number ? `Page ${cit.page_number}` : ''}
                            {cit.timestamp_secs ? `Timestamp ${Math.floor(cit.timestamp_secs / 60)}:${Math.floor(cit.timestamp_secs % 60).toString().padStart(2, '0')}` : ''}
                          </span>
                          <p className="text-[10px] text-neutral-500 italic mt-0.5">"{cit.quote}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Actions (Save to notes, Helpful/Unhelpful rating) */}
              {m.role === 'assistant' && (
                <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-neutral-400">
                  <button
                    onClick={() => handleSaveToNotes(m.content)}
                    className="hover:text-indigo-600 flex items-center space-x-1"
                  >
                    <Bookmark size={12} />
                    <span>Save to Notes</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => handleRate(m.id, 1)}
                    className={`hover:text-emerald-600 ${m.helpfulness_rating === 1 ? 'text-emerald-600 font-bold' : ''}`}
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    onClick={() => handleRate(m.id, -1)}
                    className={`hover:text-rose-600 ${m.helpfulness_rating === -1 ? 'text-rose-600 font-bold' : ''}`}
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-500 animate-pulse">
              <Sparkles size={14} />
              <span>Grounded tutor retrieving sources and reasoning...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Modifier Pills */}
        <div className="px-5 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center space-x-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase mr-1">Controls:</span>
          {[
            { id: 'explain_simply', label: 'Explain Simply' },
            { id: 'example', label: 'Show Example' },
            { id: 'step_by_step', label: 'Step by Step' },
            { id: 'hint', label: 'Give Me a Hint' },
            { id: 'quiz_me', label: 'Quiz Me' },
            { id: 'shorter', label: 'Make Shorter' },
            { id: 'detailed', label: 'In-Depth Detail' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleSendMessage(btn.id, `Please apply action '${btn.label}' to the previous concept.`)}
              className="px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 hover:border-indigo-500 transition whitespace-nowrap"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-[#e8e2d7] dark:border-neutral-800 flex items-center space-x-2 bg-white dark:bg-neutral-900"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a doubt, question, or conceptual comparison..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
