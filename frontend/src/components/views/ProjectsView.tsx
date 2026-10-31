import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sampleProject } from '../../data/mockData';
import confetti from 'canvas-confetti';

export const ProjectsView: React.FC = () => {
  const { user, updateUser } = useApp();
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

  // Calculate live underwriting metrics
  const dscr = existingDebt > 0 ? (monthlyRevenue / existingDebt) : 999;
  const creditWeight = Math.max(0, Math.min(1, (creditScore - 300) / 600));
  const cashflowWeight = Math.min(dscr / 3.0, 1.0);
  const compositeScore = Number(((creditWeight * 0.55) + (cashflowWeight * 0.45)).toFixed(3));

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

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setAgentLogs(null);

    setTimeout(() => {
      setIsSimulating(false);
      setAgentLogs([
        '⚡ [T+0.12s] Document Extraction Agent: 36 bank statement PDFs ingested via OCR. SHA-256 integrity verified.',
        '🔍 [T+0.45s] Cashflow Agent: Recurring operating revenue detected at $' + monthlyRevenue.toLocaleString() + '/mo. DSCR computed at ' + dscr.toFixed(2) + 'x.',
        '🛡️ [T+0.88s] Fraud Anomaly Agent: Account Aggregator API token validated. Anomaly score: 0.012 (Clean).',
        '⚖️ [T+1.24s] Senior Credit Committee Supervisor: Composite risk index scored at ' + compositeScore + '.',
        '✅ [T+1.50s] DECISION RENDERED: ' + verdict + ' | Max Approved: $' + maxLimit.toLocaleString() + ' @ ' + interestRate + '% p.a.',
      ]);
      confetti({ particleCount: 50 });
      updateUser({ weeklyXP: user.weeklyXP + 60 });
    }, 700);
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
              Projects: Learn by Building
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary text-xs font-bold font-code-sm">
              CAPSTONE PORTFOLIO
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
            Translating theoretical mastery into production-grade multi-agent architectures, PRDs, and venture memos.
          </p>
        </div>

        {/* Project Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low dark:bg-dark-surface-2 rounded-xl border border-surface-variant/40">
          <button
            onClick={() => setActiveProject('fintech')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeProject === 'fintech' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            FinTech Underwriting Agents
          </button>
          <button
            onClick={() => setActiveProject('uber')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeProject === 'uber' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Uber Health NEMT PRD
          </button>
        </div>
      </div>

      {/* Project Meta Card */}
      <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-code-sm text-[11px] font-bold text-primary dark:text-inverse-primary uppercase tracking-wider">
              {activeProject === 'fintech' ? 'Capstone 01 • Distributed Systems & Quant' : 'Capstone 02 • Product Management & Ops'}
            </span>
            <span className="text-on-surface-variant text-xs">•</span>
            <span className="text-xs font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">
              {activeProject === 'fintech' ? '82% Completed' : '90% Completed'}
            </span>
          </div>
          <h2 className="font-headline-sm text-xl font-bold font-serif text-on-surface dark:text-dark-text">
            {activeProject === 'fintech' ? sampleProject.title : 'Uber Health — Non-Emergency Medical Transportation (NEMT) PRD'}
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1 max-w-3xl">
            {activeProject === 'fintech' ? sampleProject.subtitle : '0-to-1 PRD for hospital dual-dispatch transport, HIPAA-compliant patient tracking, and healthcare SLA circuit breakers.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sampleProject.tags.map((tag, idx) => (
            <span key={idx} className="hidden lg:inline-block px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-dark-surface-2 text-[10px] font-code-sm font-semibold text-on-surface-variant">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 bg-surface-container-low dark:bg-dark-surface-2 p-1 rounded-xl border border-surface-variant/40 overflow-x-auto">
        <button
          onClick={() => setActiveTab('prd')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'prd' ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          <span>PRD & Architecture Spec</span>
        </button>
        <button
          onClick={() => setActiveTab('python')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'python' ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>Live Python Engine</span>
        </button>
        <button
          onClick={() => setActiveTab('streamlit')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'streamlit' ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Interactive Streamlit Demo</span>
        </button>
        <button
          onClick={() => setActiveTab('memo')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'memo' ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">analytics</span>
          <span>Investment Memo & Risk Matrix</span>
        </button>
      </div>

      {/* TAB 1: PRD & ARCHITECTURE */}
      {activeTab === 'prd' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-6 text-xs text-on-surface dark:text-dark-text leading-relaxed">
          <div>
            <span className="text-[10px] font-code-sm font-bold uppercase tracking-wider text-primary block mb-1">
              Document Ref: PRD-2026-FIN-01
            </span>
            <h3 className="font-headline-sm text-xl font-bold font-serif">
              1. Executive Overview & Problem Definition
            </h3>
            <p className="text-on-surface-variant dark:text-dark-text-muted mt-2">
              {sampleProject.prdContent.overview}
            </p>
          </div>

          <div>
            <h3 className="font-headline-sm text-xl font-bold font-serif mb-2">
              2. Core Problem & Market Inefficiency
            </h3>
            <p className="text-on-surface-variant dark:text-dark-text-muted">
              {sampleProject.prdContent.problemStatement}
            </p>
          </div>

          {/* Architecture Diagram Visualization */}
          <div className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/50">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-2">
              Multi-Agent Orchestration Topology:
            </h4>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre text-on-surface dark:text-dark-text">
{`   [Borrower Application Payload]
                │
   ┌────────────┴────────────────────────────────┐
   ▼                                             ▼
[OCR & Document Agent]                 [Account Aggregator API]
Extracts GSTIN & P&L statements        Verifies real-time banking ledger
   │                                             │
   └──────────────────────┬──────────────────────┘
                          ▼
             [LangGraph Agent Supervisor]
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
[Credit Risk Agent]              [Fraud Anomaly Agent]
Computes DSCR & VaR exposure     Isolation Forest outlier score
         │                                 │
         └────────────────┬────────────────┘
                          ▼
            [Consensus Underwriting Engine]
                          │
                          ▼
     [Approved Term Sheet & Electronic Sanction Letter]`}
            </pre>
          </div>

          <div>
            <h3 className="font-headline-sm text-base font-bold mb-2">
              3. Service Level Agreements (SLAs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleProject.prdContent.slaSpecs.map((sla, sIdx) => (
                <div key={sIdx} className="p-3 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>{sla}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PYTHON ENGINE */}
      {activeTab === 'python' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
                Live Multi-Agent Risk Engine
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                Execute autonomous underwriting rules in the local sandbox (+60 XP).
              </p>
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-code-sm text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSimulating ? 'sync' : 'play_arrow'}
              </span>
              <span>{isSimulating ? 'Evaluating Agents...' : 'Run Agent Simulation'}</span>
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-surface-variant/60 dark:border-dark-border bg-[#18181b] text-gray-200 text-xs font-mono p-4">
            <pre className="overflow-x-auto whitespace-pre">
              {sampleProject.pythonCode}
            </pre>
          </div>

          {/* Simulation Output Terminal */}
          {agentLogs && (
            <div className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-emerald-500/40 text-xs font-code-sm text-on-surface dark:text-dark-text animate-fadeIn flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span>Execution Trace & Agent Consensus</span>
              </div>
              {agentLogs.map((log, idx) => (
                <div key={idx} className="font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STREAMLIT DEMO UI PREVIEW */}
      {activeTab === 'streamlit' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-6">
          <div className="border-b border-surface-variant/30 pb-3">
            <span className="text-[10px] font-code-sm font-bold uppercase tracking-wider text-primary">
              Staging Sandbox: Streamlit Loan Calculator
            </span>
            <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
              Live Underwriting Simulator
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
              Adjust borrower financial parameters to dynamically observe real-time agent verdicts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
            {/* Left Controls Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Monthly Operating Revenue</span>
                  <span className="font-code-sm text-primary font-bold">${monthlyRevenue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="2000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Credit Bureau Score (CIBIL / FICO)</span>
                  <span className="font-code-sm text-primary font-bold">{creditScore}</span>
                </div>
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
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Existing Monthly Debt Service</span>
                  <span className="font-code-sm text-primary font-bold">${existingDebt.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={existingDebt}
                  onChange={(e) => setExistingDebt(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Requested Loan Amount</span>
                  <span className="font-code-sm text-primary font-bold">${requestedLoan.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="250000"
                  step="5000"
                  value={requestedLoan}
                  onChange={(e) => setRequestedLoan(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Right Underwriting Decision Card */}
            <div className="p-space-lg rounded-2xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/50 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] font-code-sm uppercase font-bold text-on-surface-variant block mb-1">
                  Deterministic Underwriting Verdict
                </span>
                <div className={`text-2xl font-bold font-serif ${statusColor}`}>
                  {verdict.replace('_', ' ')}
                </div>
                <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
                  Composite Underwriting Score: <strong>{compositeScore}</strong> (DSCR: {dscr.toFixed(2)}x)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-surface-variant/40">
                <div className="p-3 rounded-xl bg-surface-container-lowest dark:bg-dark-surface">
                  <span className="text-on-surface-variant text-[11px] block">Max Approved Limit</span>
                  <span className="font-code-sm text-lg font-bold text-on-surface dark:text-dark-text">
                    ${maxLimit.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest dark:bg-dark-surface">
                  <span className="text-on-surface-variant text-[11px] block">Recommended Rate</span>
                  <span className="font-code-sm text-lg font-bold text-primary dark:text-inverse-primary">
                    {interestRate > 0 ? `${interestRate}% p.a.` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVESTMENT MEMO */}
      {activeTab === 'memo' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-6 text-xs text-on-surface dark:text-dark-text leading-relaxed">
          <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
            <div>
              <span className="text-[10px] font-code-sm font-bold uppercase tracking-wider text-primary">
                Investment Committee Brief
              </span>
              <h3 className="font-headline-sm text-xl font-bold font-serif">
                Autonomous FinTech Underwriting Platform Memo
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold font-code-sm text-xs">
              IC Score: 94 / 100
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1">Executive Summary</h4>
            <p className="text-on-surface-variant dark:text-dark-text-muted">
              {sampleProject.investmentMemo.executiveSummary}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1">Addressable Market Opportunity</h4>
            <p className="text-on-surface-variant dark:text-dark-text-muted">
              {sampleProject.investmentMemo.marketOpportunity}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-2">Key Risk Mitigation Measures</h4>
            <ul className="space-y-2">
              {sampleProject.investmentMemo.riskMitigation.map((m, mIdx) => (
                <li key={mIdx} className="flex items-start gap-2 text-on-surface-variant dark:text-dark-text-muted">
                  <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">shield</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
