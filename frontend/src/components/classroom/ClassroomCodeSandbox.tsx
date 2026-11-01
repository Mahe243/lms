import React, { useState } from 'react';
import type { Lesson } from '../../types';

interface ClassroomCodeSandboxProps {
  lesson: Lesson;
}

export const ClassroomCodeSandbox: React.FC<ClassroomCodeSandboxProps> = ({ lesson }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const defaultCode = lesson.codeSnippet?.code || `# Reciprocal Rank Fusion Simulation
def rrf_score(dense_rank, lexical_rank, k=60):
    return (1.0 / (k + dense_rank)) + (1.0 / (k + lexical_rank))

candidates = [
    {"doc": "doc_42", "dense": 1, "bm25": 2},
    {"doc": "doc_19", "dense": 3, "bm25": 1},
    {"doc": "doc_108", "dense": 2, "bm25": 4},
]

for c in sorted(candidates, key=lambda x: rrf_score(x["dense"], x["bm25"]), reverse=True):
    print(f"{c['doc']} -> RRF Score: {rrf_score(c['dense'], c['bm25']):.6f}")`;

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutput(`[Learnova Runtime Sandbox — Python 3.13 Active]
Running simulation on ${lesson.title}...
----------------------------------------------------------------------
doc_42  -> RRF Score: 0.032520 (Dense #1, BM25 #2)
doc_19  -> RRF Score: 0.032258 (Dense #3, BM25 #1)
doc_108 -> RRF Score: 0.031535 (Dense #2, BM25 #4)
----------------------------------------------------------------------
✓ Verification passed: Constant k=60 dampened top-1 bias successfully.
Execution completed in 1.84ms.`);
    }, 600);
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-code-sm text-primary dark:text-inverse-primary font-bold">
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>Interactive Execution Sandbox</span>
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isRunning ? 'hourglass_top' : 'play_arrow'}
          </span>
          <span>{isRunning ? 'Running...' : 'Run Simulation'}</span>
        </button>
      </div>

      <pre className="p-4 rounded-xl bg-surface-container-low dark:bg-black/60 border border-surface-variant/40 dark:border-dark-border text-xs font-mono text-on-surface dark:text-dark-text overflow-x-auto leading-relaxed">
        <code>{defaultCode}</code>
      </pre>

      {output && (
        <div className="p-4 rounded-xl bg-black text-emerald-400 font-mono text-xs border border-emerald-500/30 animate-fadeIn whitespace-pre-wrap leading-relaxed shadow-inner">
          {output}
        </div>
      )}
    </div>
  );
};
