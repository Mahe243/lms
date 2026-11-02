import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { gameApi } from '../../api/game';
import { NovaCompanion } from '../kingdom/NovaCompanion';
import confetti from 'canvas-confetti';

export const ProjectsView: React.FC = () => {
  const { refreshWallet } = useApp();
  const [activeProject, setActiveProject] = useState<'fintech' | 'uber'>('fintech');
  const [activeTab, setActiveTab] = useState<'prd' | 'python' | 'streamlit' | 'memo'>('python');

  // Streamlit Interactive Loan Simulator State
  const [monthlyRevenue, setMonthlyRevenue] = useState(48000);
  const [creditScore, setCreditScore] = useState(782);
  const [existingDebt, setExistingDebt] = useState(6500);
  const [requestedLoan, setRequestedLoan] = useState(120000);

  // Live Python Engine State
  const [isSimulating, setIsSimulating] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[] | null>(null);
  const [forgeAward, setForgeAward] = useState<{ xp: number; coins: number } | null>(null);

  // Calculate live underwriting metrics
  const dscr = existingDebt > 0 ? monthlyRevenue / existingDebt : 999;
  const creditWeight = Math.max(0, Math.min(1, (creditScore - 300) / 600));
  const cashflowWeight = Math.min(dscr / 3.0, 1.0);
  const compositeScore = Number((creditWeight * 0.55 + cashflowWeight * 0.45).toFixed(3));

  let verdict = 'APPROVED_CONDITIONAL';
  let maxLimit = Math.min(requestedLoan * 0.7, monthlyRevenue * 1.5);
  let interestRate = 14.3;
  let statusColor = 'text-amber-500';

  if (creditScore < 620 || dscr < 1.2) {
    verdict = 'DECLINED';
    maxLimit = 0;
    interestRate = 0;
    statusColor = 'text-red-500';
  } else if (compositeScore >= 0.75) {
    verdict = 'APPROVED_PREMIUM';
    maxLimit = Math.min(requestedLoan, monthlyRevenue * 2.8);
    interestRate = 10.7;
    statusColor = 'text-emerald-500';
  }

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setAgentLogs(null);
    setForgeAward(null);

    setTimeout(async () => {
      setIsSimulating(false);
      setAgentLogs([
        '⚡ [T+0.12s] Document Extraction Agent: 36 bank statement PDFs ingested via OCR. SHA-256 integrity verified.',
        '🔍 [T+0.45s] Cashflow Agent: Recurring operating revenue detected at $' +
          monthlyRevenue.toLocaleString() +
          '/mo. DSCR computed at ' +
          dscr.toFixed(2) +
          'x.',
        '🛡️ [T+0.88s] Fraud Anomaly Agent: Account Aggregator API token validated. Anomaly score: 0.012 (Clean).',
        '⚖️ [T+1.24s] Senior Credit Committee Supervisor: Composite risk index scored at ' + compositeScore + '.',
        '✅ [T+1.50s] DECISION RENDERED: ' +
          verdict +
          ' | Max Approved: $' +
          maxLimit.toLocaleString() +
          ' @ ' +
          interestRate +
          '% p.a.',
      ]);
      try {
        // Deterministic milestone key ensures idempotent grading on backend
        const milestoneKey = `${activeProject}_architecture_simulation_v1`;
        const res = await gameApi.recordProjectMilestone({
          project_key: activeProject,
          milestone_key: milestoneKey,
          title: `Ran ${activeProject === 'fintech' ? 'FinTech Credit' : 'Autonomous Fleet'} Underwriting Simulation`,
          summary: `Decision: ${verdict}, Limit: $${maxLimit.toLocaleString()}`,
        });

        if (res && res.reward && res.reward.success) {
          setForgeAward({ xp: res.reward.awarded_xp || 60, coins: res.reward.awarded_coins || 30 });
          confetti({ particleCount: 50 });
        } else {
          setForgeAward(null);
        }
        if (refreshWallet) await refreshWallet();
      } catch {
        // Fallback
      }
    }, 700);
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
              The Innovation Forge
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-kingdom-coral/15 text-kingdom-coral text-xs font-bold font-code-sm border border-kingdom-coral/30">
              PROJECTS & CAPSTONES
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted mt-0.5">
            Interactive Architecture Simulator: Test multi-agent credit risk workflows, evaluate DSCR models, and inspect autonomous underwriting pipelines.
          </p>
        </div>

        {/* Project Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low dark:bg-dark-surface-2 rounded-xl border border-surface-variant/40">
          <button
            onClick={() => setActiveProject('fintech')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeProject === 'fintech'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            FinTech Underwriting Agents
          </button>
          <button
            onClick={() => setActiveProject('uber')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeProject === 'uber'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Uber Health NEMT PRD
          </button>
        </div>
      </div>

      {/* Forge Reward Banner */}
      {forgeAward && (
        <div className="p-4 rounded-2xl bg-kingdom-coral/10 border border-kingdom-coral/30 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <NovaCompanion expression="celebrate" size="sm" />
            <div>
              <span className="font-bold text-sm text-kingdom-coral block">
                Innovation Forge Milestone Verified!
              </span>
              <span className="text-xs text-on-surface-variant">
                Earned +{forgeAward.xp} XP and +{forgeAward.coins} Coins. Your Innovation Forge structure has evolved!
              </span>
            </div>
          </div>
          <button
            onClick={() => setForgeAward(null)}
            className="text-xs font-bold text-kingdom-coral hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-2">
        <button
          onClick={() => setActiveTab('python')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'python'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">code</span>
          <span>Multi-Agent Simulation Engine</span>
        </button>
        <button
          onClick={() => setActiveTab('streamlit')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'streamlit'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Risk Simulation Sandbox</span>
        </button>
        <button
          onClick={() => setActiveTab('prd')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'prd'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          <span>System PRD Specification</span>
        </button>
      </div>

      {/* Tab 1: Python Engine */}
      {activeTab === 'python' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
                <span className="text-xs font-bold font-code-sm text-primary">
                  engine/underwriting_graph.py
                </span>
                <button
                  disabled={isSimulating}
                  onClick={handleRunSimulation}
                  className="px-4 py-1.5 rounded-xl bg-kingdom-coral hover:bg-kingdom-coral/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSimulating ? 'sync' : 'play_arrow'}
                  </span>
                  <span>{isSimulating ? 'Executing Graph...' : 'Run Autonomous Underwriter'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 font-mono text-[11px] overflow-x-auto text-on-surface dark:text-dark-text leading-relaxed">
{`from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class UnderwritingState:
    monthly_revenue: float
    credit_score: int
    existing_debt: float
    requested_loan: float
    dscr: float = 0.0
    verdict: str = "PENDING"
    approved_limit: float = 0.0

def evaluate_risk(state: UnderwritingState) -> UnderwritingState:
    state.dscr = state.monthly_revenue / max(1.0, state.existing_debt)
    credit_weight = max(0.0, min(1.0, (state.credit_score - 300) / 600.0))
    cashflow_weight = min(state.dscr / 3.0, 1.0)
    composite = (credit_weight * 0.55) + (cashflow_weight * 0.45)
    
    if state.credit_score < 620 or state.dscr < 1.2:
        state.verdict = "DECLINED"
        state.approved_limit = 0.0
    elif composite >= 0.75:
        state.verdict = "APPROVED_PREMIUM"
        state.approved_limit = min(state.requested_loan, state.monthly_revenue * 2.8)
    else:
        state.verdict = "APPROVED_CONDITIONAL"
        state.approved_limit = min(state.requested_loan * 0.7, state.monthly_revenue * 1.5)
    return state`}
              </pre>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
                Multi-Agent Execution Terminal
              </span>

              {agentLogs ? (
                <div className="space-y-2 p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 font-mono text-[11px] text-on-surface dark:text-dark-text animate-fadeIn">
                  {agentLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed border-b border-surface-variant/20 pb-1 last:border-0">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-on-surface-variant font-code-sm">
                  Click "Run Autonomous Underwriter" to trigger the multi-agent consensus graph and forge milestone records.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Streamlit Interactive Sandbox */}
      {activeTab === 'streamlit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-on-surface dark:text-dark-text">
              Underwriting Parameters
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="flex justify-between font-bold text-on-surface dark:text-dark-text mb-1">
                  <span>Monthly Revenue</span>
                  <span className="font-code-sm text-primary">${monthlyRevenue.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between font-bold text-on-surface dark:text-dark-text mb-1">
                  <span>CIBIL / Credit Score</span>
                  <span className="font-code-sm text-primary">{creditScore}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="850"
                  step="5"
                  value={creditScore}
                  onChange={(e) => setCreditScore(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between font-bold text-on-surface dark:text-dark-text mb-1">
                  <span>Existing Monthly Debt</span>
                  <span className="font-code-sm text-primary">${existingDebt.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="500"
                  value={existingDebt}
                  onChange={(e) => setExistingDebt(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between font-bold text-on-surface dark:text-dark-text mb-1">
                  <span>Requested Loan Amount</span>
                  <span className="font-code-sm text-primary">${requestedLoan.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="20000"
                  max="300000"
                  step="10000"
                  value={requestedLoan}
                  onChange={(e) => setRequestedLoan(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Live Underwriting Result
              </span>
              <div className={`text-2xl font-bold font-code-sm mt-2 ${statusColor}`}>
                {verdict}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-code-sm">
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-on-surface-variant block text-[10px]">Computed DSCR</span>
                  <span className="text-base font-bold text-on-surface dark:text-dark-text">
                    {dscr.toFixed(2)}x
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-on-surface-variant block text-[10px]">Composite Score</span>
                  <span className="text-base font-bold text-on-surface dark:text-dark-text">
                    {compositeScore}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-on-surface-variant block text-[10px]">Max Credit Limit</span>
                  <span className="text-base font-bold text-on-surface dark:text-dark-text">
                    ${Math.round(maxLimit).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30">
                  <span className="text-on-surface-variant block text-[10px]">Offered Rate</span>
                  <span className="text-base font-bold text-on-surface dark:text-dark-text">
                    {interestRate}% p.a.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              className="w-full py-2.5 rounded-xl bg-kingdom-coral text-white text-xs font-bold hover:bg-kingdom-coral/90 transition-all shadow-sm"
            >
              Verify Decision & Commit to Forge (+50 XP)
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: PRD */}
      {activeTab === 'prd' && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm space-y-4 text-xs leading-relaxed font-body-md text-on-surface dark:text-dark-text">
          <h2 className="text-base font-bold font-serif">
            Product Requirement Document (PRD): Multi-Agent Credit Underwriter
          </h2>
          <p>
            <strong>Problem Statement:</strong> Traditional underwriting takes 3-5 business days due to manual OCR of PDFs, bank statement parsing, and committee consensus delay.
          </p>
          <p>
            <strong>System Architecture:</strong> 4 LangGraph agents running concurrently with sub-second SLA: Document Ingestion, Cashflow Liquidity Analysis, Fraud Anomaly Detection, and Credit Committee Supervisor.
          </p>
        </div>
      )}
    </div>
  );
};
