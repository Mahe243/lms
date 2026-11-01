import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface BotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
}

export const StudyBotWidget: React.FC = () => {
  const {
    activeLesson,
    activeCourseId,
    courses,
    setIsUploadModalOpen,
    setCurrentPath,
    geminiApiKey,
    user,
    updateUser,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello ${user.name}! I am Nova, your AI Study Assistant. I can help you understand complex concepts, explain how to upload resources, or load YouTube video lectures. How can I assist you right now?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: BotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsTyping(true);

    const lower = textToSend.toLowerCase();

    // Specific fast action handlers
    if (lower.includes('how to upload') || lower.includes('upload resource') || lower.includes('upload file') || lower.includes('upload video')) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `### How to Upload Resources to Learnova LMS:\n\n1. **Click the '+ Upload' button** in the top navigation bar or the button below.\n2. Choose **'Upload Local File'** to upload PDFs, Word documents (.docx), Markdown (.md), or video files (.mp4, .webm).\n3. Or choose **'Import via URL'** to paste any YouTube video link or ArXiv paper.\n4. Click **'Add to Vault & Earn +50 XP'**.\n\nAll uploaded files are saved in your **My Library Vault** and any uploaded video can be played immediately in the Classroom!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionButton: {
              label: 'Open Upload Dialog',
              action: () => setIsUploadModalOpen(true),
            },
          },
        ]);
      }, 500);
      return;
    }

    if (lower.includes('youtube') || lower.includes('watch video') || lower.includes('play video')) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `### How to Watch YouTube Videos in Learnova LMS:\n\n1. Navigate to the **Classroom** view.\n2. Click the **'Paste YouTube URL'** button right above the video player.\n3. Paste any YouTube link (e.g. \`https://www.youtube.com/watch?v=zjkBMFhNj_g\`) or use one of the one-click lecture presets.\n4. The YouTube video will immediately embed with native playback controls, captions, and speed selectors!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionButton: {
              label: 'Open Classroom Player',
              action: () => {
                setCurrentPath('classroom');
                setIsOpen(false);
              },
            },
          },
        ]);
      }, 500);
      return;
    }

    if (lower.includes('summarize') || lower.includes('summary') || lower.includes('key takeaways')) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `### Summary of Active Lesson:\n**${activeLesson.title}** (${currentCourse.code})\n\n**Key Takeaways:**\n${activeLesson.keyTakeaways.map((k, i) => `${i + 1}. ${k}`).join('\n')}\n\n**Core Concept:**\n${activeLesson.markdownContent.slice(0, 300)}...`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionButton: {
              label: 'View Deep-Dive in Classroom',
              action: () => {
                setCurrentPath('classroom');
                setIsOpen(false);
              },
            },
          },
        ]);
      }, 600);
      return;
    }

    // Try Gemini API if key is configured
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are Nova, an AI study assistant and tutor for an LMS student named ${user.name}. 
The student is currently reviewing: ${activeLesson.title} (Course: ${currentCourse.title}).
Answer concisely, with academic depth, clear bullet points, or code if applicable.

Student question: ${textToSend}`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const data = await response.json();
        const reply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I have processed your question. Let's examine the underlying framework.";

        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        updateUser({ weeklyXP: user.weeklyXP + 20 });
        return;
      } catch (err) {
        console.warn('Gemini call failed, using intelligent built-in tutor logic', err);
      }
    }

    // High-yield contextual cognitive fallback response
    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      if (lower.includes('hybrid search') || lower.includes('rrf') || lower.includes('vector')) {
        reply = `### Hybrid Search Architecture & Reciprocal Rank Fusion (RRF)\n\nIn modern production RAG pipelines, combining **lexical precision** (BM25) with **semantic context** (dense vector embeddings) eliminates the single points of failure of each model:\n\n$$\\text{RRF Score}(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}$$\n\n- **Constant $k = 60$** prevents rank-1 bias.\n- BM25 handles exact alphanumeric SKUs, part numbers, and error codes.\n- HNSW vector graphs handle conceptual intent and synonyms.`;
      } else if (lower.includes('dcf') || lower.includes('valuation') || lower.includes('wacc')) {
        reply = `### Discounted Cash Flow (DCF) & Terminal Value\n\nEnterprise value represents the present value of Unlevered Free Cash Flows (UFCF) discounted at the Weighted Average Cost of Capital (WACC):\n\n$$\\text{EV} = \\sum_{t=1}^N \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}}{(1 + \\text{WACC})^N}$$\n\nTerminal Value is typically computed using Gordon Growth ($g = 2\\%-3\\%$) or Exit Multiple methods.`;
      } else {
        reply = `### Concept Analysis: ${textToSend}\n\nRegarding your question about **${textToSend}** in the context of **${activeLesson.title}**:\n\n1. **First Principles:** Every distributed system and quantitative model requires identifying invariant constraints (e.g. latency budgets vs exact recall).\n2. **Practical Application:** When implementing this in production, prioritize deterministic circuit breakers before scaling.\n3. **Study Recommendation:** You can review the companion notes in the **Deep-Dive Reader** tab or test your retention with the **Knowledge Check Quiz**!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      updateUser({ weeklyXP: user.weeklyXP + 20 });
    }, 700);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-95'
              : 'bg-primary text-white hover:bg-primary-container hover:scale-105 ring-4 ring-primary/20'
          }`}
          title="Open AI Study Assistant"
        >
          <span className="material-symbols-outlined text-[22px]">
            {isOpen ? 'close' : 'smart_toy'}
          </span>
          <span className="text-xs font-bold font-label-md hidden sm:inline">
            {isOpen ? 'Close Assistant' : 'Ask AI Bot'}
          </span>
          {!isOpen && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 w-96 max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-7rem)] bg-surface-container-lowest dark:bg-dark-surface rounded-2xl shadow-2xl border border-surface-variant/60 dark:border-dark-border flex flex-col z-50 overflow-hidden animate-fadeIn select-none">
          {/* Header */}
          <div className="p-4 bg-surface-container-low dark:bg-dark-surface-2 border-b border-surface-variant/40 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-on-surface dark:text-dark-text font-serif">
                  Nova AI Study Copilot
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-code-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active & Contextualized</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Context Banner */}
          <div className="px-3.5 py-1.5 bg-primary/5 dark:bg-primary/10 border-b border-primary/10 text-[11px] text-primary dark:text-inverse-primary font-code-sm truncate flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">menu_book</span>
            <span className="truncate">Context: {activeLesson.title}</span>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-surface dark:bg-dark-surface-2 border-b border-surface-variant/30 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              onClick={() => handleSend('How do I upload resources and videos?')}
              className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-all text-on-surface-variant text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">upload</span>
              <span>How to Upload</span>
            </button>
            <button
              onClick={() => handleSend('How do I watch YouTube videos in Classroom?')}
              className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-all text-on-surface-variant text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">play_circle</span>
              <span>Watch YouTube</span>
            </button>
            <button
              onClick={() => handleSend('Summarize the key points of this active lesson')}
              className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-all text-on-surface-variant text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">summarize</span>
              <span>Summarize</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed font-body-md select-text">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-surface-container-low dark:bg-dark-surface-2 text-on-surface dark:text-dark-text border border-surface-variant/40 dark:border-dark-border rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{m.text}</p>
                  
                  {m.actionButton && (
                    <button
                      onClick={m.actionButton.action}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      <span>{m.actionButton.label}</span>
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-on-surface-variant/60 dark:text-dark-text-muted mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 p-2 bg-surface-container-low dark:bg-dark-surface-2 rounded-xl w-16 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-surface-container-low dark:bg-dark-surface-2 border-t border-surface-variant/40 dark:border-dark-border flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about this lesson or LMS..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface text-xs text-on-surface dark:text-dark-text border border-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-primary text-white hover:bg-primary-container disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
