import React, { useState } from 'react';
import { aiApi } from '../../api/aiApi';
import type { Lesson } from '../../types';

interface ClassroomAITutorProps {
  courseId: string;
  lesson: Lesson;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  citations?: Array<{ source_title: string; text_snippet: string }>;
}

export const ClassroomAITutor: React.FC<ClassroomAITutorProps> = ({ courseId, lesson }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Hello! I am Professor Nova, your AI Study Copilot for "${lesson.title}". Ask me to summarize this lecture, explain difficult mathematical derivations, or run a Socratic learning check.`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const handleSend = async (customPrompt?: string, promptType: any = 'standard') => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    try {
      const res = await aiApi.chatWithTutor({
        conversation_id: conversationId,
        message: textToSend,
        course_id: courseId,
        topic_id: lesson.id,
        context_mode: 'current_topic',
        prompt_type: promptType,
      });

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const botMsg: Message = {
        sender: 'bot',
        text: res.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Offline fallback with contextual lesson response
      let fallback = `### Analytical Breakdown for: ${lesson.title}\n\n`;
      if (textToSend.toLowerCase().includes('summary') || textToSend.toLowerCase().includes('summarize')) {
        fallback += lesson.keyTakeaways.map((t, i) => `${i + 1}. **${t.split(':')[0]}**: ${t}`).join('\n');
      } else {
        fallback += `The core principle of this lecture rests on deterministic SLAs, minimizing variance, and maintaining clear invariants. Check your companion notes for derivations.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: fallback,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-inverse-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-on-surface dark:text-dark-text">Professor Nova Copilot</h4>
            <span className="text-[10px] text-emerald-500 font-code-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Grounded in {lesson.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleSend('Summarize the key mathematical takeaways and invariants for this lecture', 'simple_explanation')}
            className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
          >
            Summarize Lecture
          </button>
          <button
            onClick={() => handleSend('Explain this concept using a simple real-world analogy', 'simple_explanation')}
            className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
          >
            Simple Analogy
          </button>
          <button
            onClick={() => handleSend('Ask me a challenging Socratic question to test my understanding', 'socratic')}
            className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
          >
            Socratic Drill
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'ml-auto bg-primary text-white rounded-br-xs shadow-sm'
                : 'mr-auto bg-surface-container-low dark:bg-dark-surface-2 text-on-surface dark:text-dark-text rounded-bl-xs border border-surface-variant/30'
            }`}
          >
            <div className="whitespace-pre-wrap">{m.text}</div>

            {m.citations && m.citations.length > 0 && (
              <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] flex flex-col gap-1">
                <span className="font-bold opacity-80">Source Grounding:</span>
                {m.citations.map((c, cIdx) => (
                  <div key={cIdx} className="bg-black/5 dark:bg-white/5 p-1.5 rounded">
                    <strong>{c.source_title}:</strong> {c.text_snippet.slice(0, 100)}...
                  </div>
                ))}
              </div>
            )}

            <span className={`text-[9px] mt-1.5 ${m.sender === 'user' ? 'text-white/70 ml-auto' : 'text-on-surface-variant/60'}`}>
              {m.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="mr-auto bg-surface-container-low dark:bg-dark-surface-2 p-3 rounded-2xl text-xs flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200"></span>
            <span className="text-[11px] ml-1">Analyzing lecture context...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Professor Nova about ${lesson.title}...`}
          className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-xl bg-primary hover:bg-primary-container text-white cursor-pointer disabled:opacity-40 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
};
