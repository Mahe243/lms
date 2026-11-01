import React from 'react';

export const ClassroomMatrix: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
          Benchmark Trade-Off Matrix
        </h3>
        <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
          Empirical evaluation against high-density financial, technical, and regulatory corpuses.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-body-md border-collapse">
          <thead>
            <tr className="border-b border-surface-variant/60 dark:border-dark-border font-bold uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted bg-surface-container-low dark:bg-dark-surface-2">
              <th className="p-3">Architecture Paradigm</th>
              <th className="p-3">P99 Latency</th>
              <th className="p-3">Exact ID Recall</th>
              <th className="p-3">Conceptual Recall@10</th>
              <th className="p-3">RAM Footprint</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/30 dark:divide-dark-border">
            <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
              <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                BM25 (Lucene / Tantivy)
              </td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">4.2 ms</td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">99.4%</td>
              <td className="p-3 font-code-sm text-amber-600">54.2%</td>
              <td className="p-3 font-code-sm">Low (Inverted Index)</td>
            </tr>
            <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
              <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                Dense HNSW (Milvus / Qdrant)
              </td>
              <td className="p-3 font-code-sm">18.5 ms</td>
              <td className="p-3 font-code-sm text-amber-600">62.1%</td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">94.8%</td>
              <td className="p-3 font-code-sm">High (Unquantized)</td>
            </tr>
            <tr className="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-2/50 transition-colors">
              <td className="p-3 font-semibold text-on-surface dark:text-dark-text">
                Learnova Hybrid RRF (k=60)
              </td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">12.1 ms</td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">98.9%</td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">96.3%</td>
              <td className="p-3 font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">Optimized (SQ8)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
