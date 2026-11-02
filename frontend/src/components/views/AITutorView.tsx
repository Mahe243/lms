import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NovaCompanion } from '../kingdom/NovaCompanion';
import type { ChatMessage } from '../../types';
import { initialChatMessages } from '../../data/mockData';

export const AITutorView: React.FC = () => {
  const { user, refreshWallet } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [persona, setPersona] = useState<'socratic' | 'quant' | 'architect' | 'drill'>('quant');
  const [selectedDrillAnswer, setSelectedDrillAnswer] = useState<number | null>(null);
  const [isDrillSubmitted, setIsDrillSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personas = [
    { id: 'quant', name: 'Quant Specialist', icon: 'trending_up', subtitle: 'Hull, Black-Scholes, Greeks & Volatility' },
    { id: 'socratic', name: 'Socratic Professor', icon: 'psychology', subtitle: 'Probing intuition & first principles' },
    { id: 'architect', name: 'Staff Architect', icon: 'terminal', subtitle: 'Distributed systems, RAG, Kafka & Flink' },
    { id: 'drill', name: 'Exam Drillmaster', icon: 'fitness_center', subtitle: 'High-pressure RBI Grade B & CFA drills' },
  ];

  const suggestedPrompts = [
    'Explain Gamma scalping with concrete numbers and P&L mechanics.',
    'Derive the Black-Scholes PDE intuitively without stochastic calculus.',
    'How does Reciprocal Rank Fusion eliminate score calibration issues in RAG?',
    'What happens to Vega and Theta when an option approaches expiration?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('learnova_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text.trim(),
          context_mode: 'my_materials_plus_general',
          prompt_type: persona === 'drill' ? 'quiz_me' : persona === 'socratic' ? 'step_by_step' : 'standard',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: data.message_id || `msg-${Date.now() + 1}`,
          sender: 'tutor',
          text: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (refreshWallet) await refreshWallet();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'tutor',
          text: '⚠️ **Unable to connect to the AI Tutor service.**\n\nPlease verify that the Learnova backend server is running and accessible at `/api/ai/chat`.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDrillSubmit = (correctIdx: number) => {
    setIsDrillSubmitted(true);
    if (selectedDrillAnswer === correctIdx) {
      if (refreshWallet) refreshWallet();
    }
  };


  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <NovaCompanion expression="thinking" size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
                The Observatory of Wisdom
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-kingdom-violet/15 text-kingdom-violet text-xs font-bold font-code-sm border border-kingdom-violet/30">
                <span className="w-1.5 h-1.5 rounded-full bg-kingdom-violet animate-pulse"></span>
                PROFESSOR NOVA ACTIVE
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted mt-0.5">
              Personalized 1:1 Cognitive Sparring Partner, Socratic reasoning engine, and domain specialist.
            </p>
          </div>
        </div>

        {/* Persona Switcher Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-surface-container-low dark:bg-dark-surface-2 rounded-xl border border-surface-variant/40 dark:border-dark-border">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id as typeof persona)}
              className={`px-3 py-1.5 rounded-lg text-xs font-label-md font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                persona === p.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Chat Canvas (Left 8 cols) & Live Intuition Drill + Reference (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Chat Thread Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest dark:bg-dark-surface rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm h-[720px] overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-space-lg space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'tutor' && (
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs font-body-md leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-container text-white rounded-tr-none'
                      : 'bg-surface-container-low dark:bg-dark-surface-2 text-on-surface dark:text-dark-text border border-surface-variant/40 dark:border-dark-border rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-2 font-code-sm opacity-70">
                    <span className="font-bold">{msg.sender === 'user' ? 'Maheswar' : 'Professor Nova'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="space-y-2 prose dark:prose-invert max-w-none text-xs">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Inline Quiz Drill if provided in chat */}
                  {msg.quizDrill && (
                    <div className="mt-4 p-3.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-primary/20 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-primary dark:text-inverse-primary font-bold">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>Interactive Socratic Intuition Drill</span>
                      </div>
                      <p className="font-semibold text-on-surface dark:text-dark-text">
                        {msg.quizDrill.question}
                      </p>
                      <div className="space-y-1.5 mt-1">
                        {msg.quizDrill.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setSelectedDrillAnswer(oIdx);
                              handleDrillSubmit(msg.quizDrill!.correctIndex);
                            }}
                            className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all flex items-center justify-between ${
                              isDrillSubmitted
                                ? oIdx === msg.quizDrill!.correctIndex
                                  ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : selectedDrillAnswer === oIdx
                                  ? 'bg-red-100 border-red-500 text-red-900'
                                  : 'border-surface-variant/40'
                                : 'border-surface-variant/60 hover:bg-surface-container-high dark:hover:bg-dark-surface'
                            }`}
                          >
                            <span>{opt}</span>
                            {isDrillSubmitted && oIdx === msg.quizDrill!.correctIndex && (
                              <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {isDrillSubmitted && (
                        <p className="text-[11px] text-on-surface-variant dark:text-dark-text-muted mt-1 bg-surface-container-low dark:bg-dark-surface-2 p-2 rounded">
                          {msg.quizDrill.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <img
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 ring-1 ring-primary/30"
                    src={user.avatar}
                  />
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs text-on-surface-variant dark:text-dark-text-muted animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <span>Professor Nova is formulating cognitive analysis...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts Chips */}
          <div className="px-4 py-2 bg-surface-container-low dark:bg-dark-surface-2 border-t border-surface-variant/30 dark:border-dark-border flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-code-sm uppercase font-bold text-on-surface-variant shrink-0">
              Suggestions:
            </span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/60 dark:border-dark-border text-[11px] text-on-surface dark:text-dark-text hover:border-primary whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3.5 bg-surface-container-lowest dark:bg-dark-surface border-t border-surface-variant/40 dark:border-dark-border flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Professor Nova anything (e.g. Greeks, RAG latency, DCF Terminal Value, Basel III)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 dark:border-dark-border text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 font-body-md"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-container text-white disabled:opacity-40 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>

        {/* Right Reference Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Quick Intuition Drill Widget */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold font-serif uppercase tracking-wider text-primary dark:text-inverse-primary">
              <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
              <span>Daily Option Greek Intuition Drill</span>
            </div>

            <p className="text-xs text-on-surface dark:text-dark-text font-medium leading-relaxed">
              Suppose an equity asset drops 5% overnight. Which Greek determines whether your portfolio Delta will become more long or more short?
            </p>

            <div className="space-y-1.5 text-xs">
              {['Delta (Δ)', 'Gamma (Γ)', 'Theta (Θ)', 'Vega (ν)'].map((choice, cIdx) => (
                <div
                  key={cIdx}
                  onClick={() => alert(cIdx === 1 ? 'Correct! Gamma is the rate of change of Delta.' : 'Incorrect. Gamma dictates the velocity and direction of Delta shifts.')}
                  className="p-2.5 rounded-lg border border-surface-variant/50 dark:border-dark-border hover:bg-primary/5 hover:border-primary/50 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{choice}</span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Greek Matrix Reference Card */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
                Derivatives Reference Desk
              </span>
              <span className="text-[10px] font-code-sm text-primary">Hull Ch. 14</span>
            </div>

            <div className="space-y-2 text-xs font-code-sm">
              <div className="p-2 rounded bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between">
                <span>Delta (Δ) = ∂V/∂S</span>
                <span className="text-primary font-bold">Slope</span>
              </div>
              <div className="p-2 rounded bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between">
                <span>Gamma (Γ) = ∂²V/∂S²</span>
                <span className="text-amber-600 font-bold">Curvature</span>
              </div>
              <div className="p-2 rounded bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between">
                <span>Theta (Θ) = ∂V/∂t</span>
                <span className="text-red-500 font-bold">Time Decay</span>
              </div>
              <div className="p-2 rounded bg-surface-container-low dark:bg-dark-surface-2 flex items-center justify-between">
                <span>Vega (ν) = ∂V/∂σ</span>
                <span className="text-purple-600 font-bold">Vol Sensitivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
