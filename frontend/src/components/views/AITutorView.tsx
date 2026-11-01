import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';
import { initialChatMessages } from '../../data/mockData';
import { aiApi } from '../../api/aiApi';

export const AITutorView: React.FC = () => {
  const { user, updateUser, activeCourseId } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [persona, setPersona] = useState<'socratic' | 'quant' | 'architect' | 'drill'>('quant');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
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

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    const promptTypeMap: Record<string, any> = {
      quant: 'worked_example',
      socratic: 'socratic',
      architect: 'teach_concept',
      drill: 'quick_quiz',
    };

    try {
      // Connect directly to backend RAG AI Tutor endpoint
      const response = await aiApi.chatWithTutor({
        conversation_id: conversationId,
        message: text.trim(),
        course_id: activeCourseId,
        context_mode: 'global',
        prompt_type: promptTypeMap[persona] || 'standard',
      });

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: response.message_id || `msg-${Date.now() + 1}`,
          sender: 'tutor',
          text: response.content,
          citations: response.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      updateUser({ weeklyXP: user.weeklyXP + 30 });
    } catch {
      // Contextual AI Tutor response
      let reply = '';
      const low = text.toLowerCase().trim();
      const isGreeting = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good evening', 'good afternoon', 'yo', 'sup'].includes(low);

      if (isGreeting) {
        reply = `Hello **Maheswar**! I am **Professor Nova**, your cognitive study copilot.

I am ready to help you analyze, derive, or synthesize concepts across your curriculum:
- **AI Systems & CS:** Vector quantization, Reciprocal Rank Fusion, latency bounds, and speculative decoding.
- **Quantitative Finance:** Black-Scholes Greeks, Taylor Rule monetary transmission, and DCF corporate valuation.
- **Product Strategy:** Retention loops, marketplace liquidity dynamics, and PRD specifications.

What problem, concept, or derivation shall we work through together today?`;
      } else if (low.includes('gamma') || low.includes('greek')) {
        reply = `### Gamma Scalping & Dynamic Delta Rebalancing

When holding a **Long Gamma** option portfolio, your Delta ($\\Delta$) changes in favor of your directional movement.

$$\\text{Daily Gamma P&L} \\approx \\frac{1}{2} \\Gamma (\\Delta S)^2 - \\Theta \\Delta t$$

#### Concrete Numerical Example:
1. Suppose you hold ATM Call options with $\\Delta = +0.50$ and $\\Gamma = +0.05$.
2. Underlying stock jumps from **\\$100 to \\$104** ($\\Delta S = +\\$4$).
3. Your new Delta increases to:
   $$\\Delta_{new} = 0.50 + (0.05 \\times 4) = +0.70$$
4. You are now over-hedged long by +0.20 shares. To restore Delta-neutrality ($\\Delta = 0$), you **sell 20 shares at \\$104**.
5. If the stock retreats back to **\\$100**, your Delta drops back to +0.50, and you **buy back those 20 shares at \\$100**.
6. **Net profit on the round trip:** $20 \\times (\\$104 - \\$100) = \\$80$ of realized volatility cashflow!

This realized cashflow offsets your continuous time-decay (**Theta**).`;
      } else if (low.includes('rrf') || low.includes('hybrid search') || low.includes('bm25') || low.includes('retrieval')) {
        reply = `### Reciprocal Rank Fusion (RRF) Architecture

RRF solves score-calibration variance between inverted keyword indexes and dense vector spaces:

$$RRF(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}$$

- The dampening constant **$k=60$** prevents top-ranked candidates in one modality from monopolizing the merged rank.
- Alphanumeric tokens (SKUs, IDs) are retrieved with Tantivy BM25, while semantic intent is retrieved with HNSW dense vectors.`;
      } else {
        reply = `### Analytical Breakdown for: "${text}"

From a first-principles perspective:
1. **Core Mechanism:** Identify the underlying invariant constraints (latency bounds, risk-neutral no-arbitrage, or liquidity thresholds).
2. **Tradeoffs:** Weigh computational overhead against model fidelity.
3. **Application:** Test boundary conditions where the primary heuristic degrades.

Would you like me to provide a worked numerical example or test your understanding with a Socratic drill?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'tutor',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      updateUser({ weeklyXP: user.weeklyXP + 15 });
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, conversationId, activeCourseId, persona, user.weeklyXP, updateUser]);

  const handleDrillSubmit = (correctIdx: number) => {
    setIsDrillSubmitted(true);
    if (selectedDrillAnswer === correctIdx) {
      updateUser({ weeklyXP: user.weeklyXP + 40 });
    }
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[28px]">neurology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
                Professor Nova
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-code-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE INTELLECT
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
              Personalized 1:1 Cognitive Sparring Partner & Domain Specialist
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
