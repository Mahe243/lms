import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NovaCompanion } from '../kingdom/NovaCompanion';
import type { ChatMessage } from '../../types';
import { initialChatMessages } from '../../data/mockData';

export const AITutorView: React.FC = () => {
  const { user, geminiApiKey, updateUser } = useApp();
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

    // If user configured custom Gemini API key
    if (geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are Professor Nova, an elite academic cognitive tutor for an ambitious student in MBA and Computer Science. Respond thoroughly with academic rigor, LaTeX formulas, code, or structured bullet points.\n\nUser Question: ${text}` }] }]
          })
        });
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I processed your request, Maheswar. Let's delve into the underlying principles.";
        
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'tutor',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        updateUser({ weeklyXP: user.weeklyXP + 30 });
        return;
      } catch (err) {
        console.error('Gemini API call failed, falling back to local reasoning:', err);
      }
    }

    // Intelligent built-in cognitive response simulation
    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      if (text.toLowerCase().includes('gamma') || text.toLowerCase().includes('greek')) {
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

This realized cashflow offsets your continuous time-decay (**Theta**). If realized volatility exceeds implied volatility, your net Gamma scalping P&L is strictly positive.`;
      } else if (text.toLowerCase().includes('black-scholes') || text.toLowerCase().includes('pde')) {
        reply = `### Intuitive Derivation of the Black-Scholes PDE

The fundamental breakthrough of Black, Scholes, and Merton was constructing a **riskless hedged portfolio** $\\Pi$:

$$\\Pi = V - \\Delta S$$

By setting $\\Delta = \\frac{\\partial V}{\\partial S}$, the stochastic Brownian shock $dW$ in Ito's Lemma perfectly vanishes:

$$d\\Pi = \\left( \\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} \\right) dt$$

Because the portfolio is instantaneously completely deterministic and riskless, to prevent arbitrage it **must yield the risk-free rate** $r$:

$$d\\Pi = r\\Pi dt = r(V - \\Delta S) dt$$

Equating the two yields the immortal Black-Scholes-Merton Partial Differential Equation:

$$\\frac{\\partial V}{\\partial t} + rS\\frac{\\partial V}{\\partial S} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} - rV = 0$$

Notice the absence of the stock's expected growth rate $\\mu$—proving derivative prices depend only on volatility $\\sigma$ and risk-free interest $r$!`;
      } else {
        reply = `### Analysis & Core Principles

Addressing: *"**${text}**"*

From a systems and financial perspective, consider the primary trade-offs:
1. **Mathematical Mechanics:** In high-dimensional optimization, local curvature determines stability. Every convex objective requires continuous parameter validation.
2. **Operational Latency vs Accuracy:** Whether balancing BM25 inverted indexes against HNSW graphs or balancing Delta-hedging costs against Gamma risk, discrete discretization error is bounded by $O(\\Delta t)$.
3. **Synthesis:** In your upcoming RBI Grade B mock or Capstone PRD, always articulate the boundary conditions where the primary model degrades.`;
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
      updateUser({ weeklyXP: user.weeklyXP + 30 });
    }, 800);
  };

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
