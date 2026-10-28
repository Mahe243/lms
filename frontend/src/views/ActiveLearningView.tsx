import React, { useState, useEffect } from 'react';
import {
  BrainCircuit, Sparkles, BookOpen, CheckCircle2,
  Send, Layers, Table, RefreshCw, Plus, Edit3
} from 'lucide-react';
import { ActiveLearningItem, Course } from '../types';
import { api } from '../api';

interface ActiveLearningViewProps {
  courses: Course[];
  onNavigate: (tab: string, meta?: any) => void;
}

export const ActiveLearningView: React.FC<ActiveLearningViewProps> = ({
  courses,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'teach_back' | 'formula' | 'concept_comparison' | 'glossary'>('teach_back');
  const [items, setItems] = useState<ActiveLearningItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ActiveLearningItem | null>(null);

  // Teach back interaction state
  const [learnerExplanation, setLearnerExplanation] = useState('');
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await api.getActiveLearningItems(activeTab);
      setItems(data);
      if (data.length > 0) {
        setSelectedItem(data[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleEvaluateTeachBack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnerExplanation.trim() || evaluating) return;
    setEvaluating(true);
    try {
      const res = await api.chatWithTutor({
        message: `I am doing a teach-back exercise on "${selectedItem?.title}". Here is my conceptual explanation:\n\n"${learnerExplanation}"\n\nPlease evaluate my explanation: identify what I explained accurately, highlight any misconceptions, missing edge cases, or gaps, and give constructive feedback.`,
        context_mode: 'my_materials_plus_general',
      });
      setAiEvaluation(res.content);
    } catch (err: any) {
      setAiEvaluation(`Evaluation error: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Active Learning Toolset</h2>
          <p className="text-xs text-neutral-500">Engage in Feynman teach-backs, formula derivations, and concept comparisons</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8e2d7] dark:border-neutral-800 space-x-4 text-xs font-medium">
        {[
          { id: 'teach_back', label: 'Teach-Back Mode' },
          { id: 'formula', label: 'Formula & Equation Practice' },
          { id: 'concept_comparison', label: 'Concept Comparison Matrices' },
          { id: 'glossary', label: 'Personal Glossary' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as any);
              setAiEvaluation('');
              setLearnerExplanation('');
            }}
            className={`pb-3 border-b-2 transition ${
              activeTab === t.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'teach_back' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Teach-Back Topics
            </span>
            {items.map((it) => (
              <div
                key={it.id}
                onClick={() => {
                  setSelectedItem(it);
                  setAiEvaluation('');
                  setLearnerExplanation('');
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-xs transition ${
                  selectedItem?.id === it.id
                    ? 'bg-white dark:bg-neutral-900 border-indigo-500 shadow-sm'
                    : 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:bg-white'
                }`}
              >
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">{it.title}</span>
                <span className="text-[10px] text-neutral-400 capitalize mt-1 block">Mastery: {it.mastery_level}</span>
              </div>
            ))}
          </div>

          {/* Teach back interaction workspace */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-5">
            {!selectedItem ? (
              <p className="text-xs text-neutral-400 text-center py-10">Select a concept to teach back.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    Feynman Teach-Back Method
                  </span>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mt-2">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {selectedItem.content?.prompt || 'Explain this concept in plain terms without looking at notes. Test your mastery by teaching the AI tutor.'}
                  </p>
                </div>

                <form onSubmit={handleEvaluateTeachBack} className="space-y-3">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Your Explanation:
                  </label>
                  <textarea
                    rows={6}
                    value={learnerExplanation}
                    onChange={(e) => setLearnerExplanation(e.target.value)}
                    placeholder="Explain the mechanism, assumptions, trade-offs, and examples here..."
                    className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={evaluating || !learnerExplanation.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <Sparkles size={14} />
                      <span>{evaluating ? 'Analyzing Explanation...' : 'Evaluate & Find Gaps'}</span>
                    </button>
                  </div>
                </form>

                {aiEvaluation && (
                  <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs space-y-2 animate-fade-in">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                      Tutor Feedback & Gap Analysis:
                    </span>
                    <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {aiEvaluation}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'formula' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((f) => (
            <div key={f.id} className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3 text-xs">
              <span className="font-bold text-sm block">{f.title}</span>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 font-mono text-center text-sm font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 text-indigo-600 dark:text-indigo-400">
                {f.content?.formula_latex || 'Equation'}
              </div>
              {f.content?.variables && (
                <div className="space-y-1">
                  <span className="font-semibold block text-neutral-500 text-[11px]">Variables:</span>
                  {f.content.variables.map((v: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-neutral-700 dark:text-neutral-300">
                      <span className="font-mono font-bold">{v.name}:</span>
                      <span>{v.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'concept_comparison' && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm">{item.title}</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                      <th className="p-3 font-semibold">Aspect</th>
                      <th className="p-3 font-semibold text-indigo-600">{item.content?.concept_a || 'Concept A'}</th>
                      <th className="p-3 font-semibold text-teal-600">{item.content?.concept_b || 'Concept B'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {item.content?.dimensions?.map((dim: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-3 font-semibold text-neutral-700 dark:text-neutral-300">{dim.aspect}</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{dim.a}</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{dim.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'glossary' && (
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs text-xs space-y-3">
          <h3 className="font-bold text-sm">Personal Terminology Glossary</h3>
          <p className="text-neutral-500">Important definitions and concepts linked to your course notes.</p>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 pt-2">
            <div className="py-2.5">
              <span className="font-bold text-indigo-600">Consensus</span>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">Agreement on a single data value among multiple distributed nodes.</p>
            </div>
            <div className="py-2.5">
              <span className="font-bold text-indigo-600">Happens-Before Relation</span>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">A strict partial ordering of events in distributed systems defined by Leslie Lamport.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
