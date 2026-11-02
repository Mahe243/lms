import { PMII_VAULT_ITEMS } from './vaultData';
import type { Course, Lesson, Flashcard, LibraryItem, MockExam, ProjectData, UserProfile } from '../types';

export const initialUser: UserProfile = {
  name: 'Maheswar',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  program: 'MBA Product & CS Dual Track',
  cohort: "Class of '28",
  term: 'TERM 2',
  week: 'WEEK 08',
  streakDays: 1,
  streakTopPercent: 1,
  deepWorkHoursToday: 2.5,
  deepWorkTargetToday: 3.0,
  weeklyXP: 1840,
  retainedNodes: 14,
  level: 16,
};

export const coursesData: Course[] = [
  {
    id: 'ai-pm-llm',
    title: 'Latency Optimization in Enterprise RAG Pipelines',
    track: 'CS',
    code: 'CS-742',
    instructor: 'Dr. Elena Rostova',
    progress: 68,
    totalModules: 6,
    completedModules: 4,
    currentLesson: 'Hybrid Search Architecture: Blending Keyword Precision with Semantic Context',
    timeLeft: '12m left',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    accentColor: '#4f46e5',
    description: 'Master low-latency retrieval architectures, vector quantization, speculative decoding, and hybrid lexical-semantic reranking at enterprise scale.',
  },
  {
    id: 'monetary-policy',
    title: 'Monetary Policy Transmission & Inflation Targeting',
    track: 'Finance',
    code: 'FIN-820',
    instructor: 'Prof. Raghuram Patel',
    progress: 84,
    totalModules: 8,
    completedModules: 7,
    currentLesson: 'Taylor Rule vs Constrained Discretion in Emerging Markets',
    timeLeft: '35m left',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600',
    accentColor: '#855300',
    description: 'Rigorous central banking frameworks, liquidity adjustment facility (LAF), open market operations, and Phillips curve dynamics for RBI Grade B Phase II.',
  },
  {
    id: 'corporate-valuation',
    title: 'Corporate Valuation & DCF Modeling in Financial Markets',
    track: 'Finance',
    code: 'MBA-610',
    instructor: 'Prof. Alistair Vance',
    progress: 52,
    totalModules: 5,
    completedModules: 2,
    currentLesson: 'Terminal Value Sensitivity & Unlevered Free Cash Flow Projections',
    timeLeft: '45m left',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    accentColor: '#005338',
    description: 'Wall Street institutional financial analysis, Weighted Average Cost of Capital (WACC), Monte Carlo scenario analysis, and M&A accretion/dilution.',
  },
  {
    id: 'product-sense-healthcare',
    title: 'Product Sense: Designing Uber for Critical Healthcare',
    track: 'MBA',
    code: 'PM-904',
    instructor: 'Maya Lin (VP Product)',
    progress: 30,
    totalModules: 4,
    completedModules: 1,
    currentLesson: 'Non-Emergency Medical Transportation (NEMT) PRD & SLA Circuit Breakers',
    timeLeft: '1h 20m left',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    accentColor: '#3525cd',
    description: '0-to-1 PRD authorship for complex marketplace topologies, HIPAA compliance boundaries, dual-dispatch driver economics, and healthcare SLA commitments.',
  },
  {
    id: 'flink-kafka-streaming',
    title: 'Real-Time Stream Processing with Apache Flink & Kafka',
    track: 'CS',
    code: 'CS-812',
    instructor: 'Alexei Ivanov',
    progress: 90,
    totalModules: 7,
    completedModules: 6,
    currentLesson: 'Exactly-Once State Semantics & RocksDB State Backend Optimization',
    timeLeft: '18m left',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
    accentColor: '#ba1a1a',
    description: 'Event-driven distributed streaming pipelines, watermark propagation, stateful CEP pattern matching, and high-throughput low-latency telemetry.',
  },
];

export const currentClassroomLesson: Lesson = {
  id: 'lesson-hybrid-search',
  courseId: 'ai-pm-llm',
  title: 'Hybrid Search Architecture: Blending Keyword Precision with Semantic Context',
  moduleTitle: 'Module 03 • Advanced Context Compression & Quantization',
  duration: '24:18',
  completed: false,
  videoUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
  keyTakeaways: [
    'Dense vector search often fails on exact alphanumeric tokens (SKUs, legal clauses, ticker symbols, tax codes).',
    'BM25 provides deterministic keyword precision with inverted indexes but suffers from vocabulary mismatch and synonym blindness.',
    'Reciprocal Rank Fusion (RRF) offers parameter-free, scale-invariant rank combination: RRF_Score(d) = Σ [1 / (k + r_i(d))] where k is conventionally 60.',
    'Learned sparse representations (SPLADE v3) bridge lexical tokenization with transformer-derived semantic expansions.',
  ],
  markdownContent: `### The Alphanumeric Blind Spot of Dense Vectors

Dense embeddings compress semantic meaning into dense high-dimensional manifolds (e.g. 1536 dims). While they excel at capturing abstract thematic parallels, they consistently suffer an information bottleneck when queried for:
- Exact part identifiers (e.g., \`RX-9042-REV-B\`)
- Rare acronyms and regulatory statutes (e.g., \`Section 42-B(ii)\`)
- Exact quotation excerpts where paraphrasing is catastrophic

\`\`\`
   [User Query]
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[BM25 Inverted Index]      [HNSW Vector Index]
(Exact keyword match)      (Semantic neighborhood)
   │                                │
   ▼                                ▼
[Lexical Top-100]          [Semantic Top-100]
   └────────────┬───────────────────┘
                ▼
   [Reciprocal Rank Fusion (RRF)]
                │
                ▼
   [Cross-Encoder Reranker]
                │
                ▼
   [Top-K Context Windows to LLM]
\`\`\`

### Indexing Paradigms: Trade-off Matrix

| Metric | BM25 (Lucene / Tantivy) | Dense HNSW (Qdrant / Milvus) | Hybrid RRF + Reranker |
| :--- | :--- | :--- | :--- |
| **P99 Query Latency** | **4.2 ms** (Ultra Fast) | 18.5 ms | 28.4 ms (Acceptable) |
| **Exact SKU Recall** | **99.4%** | 62.1% (Fails) | **98.9%** |
| **Conceptual Recall@10** | 54.2% | **89.8%** | **93.7%** (Best-in-Class) |
| **Indexing Memory Overhead** | Low (Disk-backed inverted index) | High (Vector graphs in RAM) | Moderate |

### Production Case Study: Notion Q&A at Scale
Notion processes hundreds of millions of private customer documents across varied domains. Single vector embedding models failed across customer internal jargon and project code names. By implementing a dual-pipeline retrieval mechanism fusing Tantivy full-text index with dense vectors via RRF and caching top-100 candidates, Notion reduced end-to-end question answering hallucination by 42%.`,
  codeSnippet: {
    language: 'python',
    description: 'Production Reciprocal Rank Fusion (RRF) Implementation with normalization',
    code: `def reciprocal_rank_fusion(dense_ranks: list[str], lexical_ranks: list[str], k: int = 60) -> list[tuple[str, float]]:
    """
    Combines ranked candidate lists using scale-invariant Reciprocal Rank Fusion.
    Score = sum(1 / (k + rank_i))
    """
    scores = {}
    
    # Process dense vector rankings
    for rank, doc_id in enumerate(dense_ranks, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))
        
    # Process BM25 lexical rankings
    for rank, doc_id in enumerate(lexical_ranks, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))
        
    # Sort descending by cumulative RRF score
    ranked_results = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return ranked_results

# Example Run
dense_top = ["doc_42", "doc_108", "doc_19", "doc_88"]
lexical_top = ["doc_19", "doc_42", "doc_55", "doc_108"]
fused = reciprocal_rank_fusion(dense_top, lexical_top)
print("Fused Top Documents:", fused[:3])
# Result: [('doc_42', 0.0325), ('doc_19', 0.0322), ('doc_108', 0.0315)]`,
  },
  quiz: [
    {
      question: 'Why does pure dense semantic search often underperform in enterprise workspaces compared to e-commerce or open-domain web search?',
      options: [
        'Dense vectors cannot encode strings longer than 128 characters.',
        'Enterprise documents heavily rely on arbitrary alphanumeric IDs, legal clauses, and project codenames that lack semantic neighborhoods.',
        'Cosine similarity is mathematically non-convex in Euclidean manifolds.',
        'Dense models consume 100x more bandwidth over HTTP/2.',
      ],
      correctIndex: 1,
      explanation: 'Dense models compress strings into generalized conceptual embeddings. Arbitrary identifiers like "TASK-8941" or "Clause 14(c)" have negligible semantic context and are smoothed out, causing missed exact matches that BM25 handles trivially.',
    },
    {
      question: 'What is the primary operational advantage of Reciprocal Rank Fusion (RRF) over weighted linear score blending?',
      options: [
        'RRF operates purely on discrete ranks, removing the need for score calibration across disparate distance scales (e.g., BM25 uncalibrated scores vs cosine [-1, 1]).',
        'RRF guarantees 0ms query latency on GPU clusters.',
        'RRF eliminates the need for cross-encoder rerankers entirely.',
        'RRF compresses the vector database by 8x.',
      ],
      correctIndex: 0,
      explanation: 'BM25 produces unbounded positive floating scores, while dense models output cosine or dot-product metrics. Normalizing them linearly requires continuous calibration; RRF neatly bypasses calibration by fusing ordinal ranks.',
    },
    {
      question: 'In the standard RRF formula Score(d) = Σ [1 / (k + rank)], what is the empirical purpose of constant k (typically 60)?',
      options: [
        'It sets the maximum number of documents that can be fetched from the database.',
        'It prevents high-ranking items from dominating the score excessively while penalizing lower-ranked items smoothly.',
        'It matches the 60-second HTTP timeout standard.',
        'It represents the batch size of the transformer tokenizer.',
      ],
      correctIndex: 1,
      explanation: 'Without k, the difference between rank 1 (score 1.0) and rank 2 (score 0.5) is massive compared to rank 50 (0.02) and rank 51 (0.0196). Constant k dampens the steep drop-off at the top.',
    },
  ],
};

export const initialChatMessages = [
  {
    id: 'msg-1',
    sender: 'user' as const,
    text: 'Professor Nova, can you unpack why Gamma risk is considered the second derivative of portfolio value, and why market makers fear short gamma near expiry?',
    timestamp: '19:42',
  },
  {
    id: 'msg-2',
    sender: 'tutor' as const,
    text: `Delighted you asked, Maheswar. This touches the mathematical core of option convexity and hedging mechanics.

### 1. Mathematical Foundation
Delta (\\Delta) represents your first-order sensitivity to underlying spot price $S$:
$$\\Delta = \\frac{\\partial V}{\\partial S}$$

Gamma (\\Gamma) is the second derivative—the rate of change of Delta with respect to spot:
$$\\Gamma = \\frac{\\partial^2 V}{\\partial S^2} = \\frac{N'(d_1)}{S \\sigma \\sqrt{T}}$$

Where $N'(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-x^2/2}$ is the standard normal probability density function.

### 2. The P&L Curvature Breakdown
When you are **Long Gamma** ($\\Gamma > 0$), your Delta moves *with* the market. As the stock rallies, you naturally become longer; as it crashes, you naturally become shorter. You "buy low, sell high" automatically during dynamic delta-hedging.

When you are **Short Gamma** ($\\Gamma < 0$), the opposite nightmare occurs:
- As the underlying stock plunges, your position automatically gets **more long**.
- To remain delta-neutral, you are forced to **sell into an accelerating market drop**.
- Near expiry ($T \\to 0$), for At-The-Money (ATM) options, $S \\sigma \\sqrt{T} \\to 0$, causing Gamma to **spike asymptotically toward infinity**!

This phenomenon is famously known as the *Pin Risk Vortex*.`,
    timestamp: '19:43',
    latex: [
      '\\Gamma = \\frac{\\partial^2 V}{\\partial S^2} = \\frac{N\'(d_1)}{S \\sigma \\sqrt{T}}',
      '\\Delta = \\frac{\\partial V}{\\partial S}',
    ],
    quizDrill: {
      question: 'Quick Intuition Check: An equity market maker is short 1,000 ATM call contracts with 2 hours to expiration. If the stock gaps up by 3% in minutes, what must the market maker execute to re-hedge delta neutrality?',
      options: [
        'Sell underlying stock aggressively into the rally.',
        'Buy underlying stock aggressively at higher prices.',
        'Buy deep out-of-the-money puts only.',
        'Do nothing because theta decay will offset delta.',
      ],
      correctIndex: 1,
      explanation: 'Because the market maker is short calls, their Gamma is deeply negative. As the stock rallies, their negative delta deepens; to return to delta-neutral (Delta = 0), they must urgently BUY stock at prevailing elevated market prices, sustaining slippage.',
    },
  },
];

export const libraryItemsData: LibraryItem[] = [
  ...PMII_VAULT_ITEMS,
  {
    id: 'hull-derivatives',
    title: 'Options, Futures, and Other Derivatives (10th Ed.)',
    author: 'John C. Hull',
    year: '2022',
    category: 'Book',
    tags: ['Derivatives', 'Quantitative Finance', 'Greeks', 'Stochastic Calculus'],
    readTime: '34h total',
    progress: 74,
    rating: 5,
    summary: 'The undisputed bible of quantitative derivatives pricing. Covers Black-Scholes-Merton model derivations, volatility smiles, interest rate trees, and credit risk modeling.',
    fullNotes: `# Hull Chapter 14 & 15: The Greek Letters
- Delta hedging must be rebalanced discretely in real life; transaction costs create a friction band.
- Vega is highest for at-the-money options with longer maturities.
- The fundamental Black-Scholes partial differential equation:
  $$\\frac{\\partial V}{\\partial t} + rS\\frac{\\partial V}{\\partial S} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} = rV$$`,
    citation: 'Hull, J. C. (2022). Options, Futures, and Other Derivatives (10th ed.). Pearson Education.',
    bookmarked: true,
  },
  {
    id: 'attention-paper',
    title: 'Attention Is All You Need',
    author: 'Vaswani, A., Shazeer, N., Parmar, N., et al.',
    year: '2017',
    category: 'Research Paper',
    tags: ['Transformers', 'Deep Learning', 'Attention Mechanism', 'LLM Architecture'],
    readTime: '45m',
    progress: 100,
    rating: 5,
    summary: 'Foundational paper introducing the Transformer architecture, replacing recurrent and convolutional layers with Scaled Dot-Product Multi-Head Self-Attention.',
    fullNotes: `# Transformer Core Equations
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
Key intuition: Division by $\\sqrt{d_k}$ prevents dot products from growing excessively large in high dimensions, preventing gradients from vanishing in the softmax region.`,
    citation: 'Vaswani, A., et al. (2017). Attention is all you need. NeurIPS 2017.',
    bookmarked: true,
  },
  {
    id: 'kleppmann-ddia',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    year: '2017',
    category: 'Book',
    tags: ['Distributed Systems', 'Kafka', 'Consensus', 'LSM-Trees'],
    readTime: '28h total',
    progress: 88,
    rating: 5,
    summary: 'A masterpiece on storage engines (B-trees vs SSTables/LSM), replication lag, consensus algorithms (Raft/Paxos), and batch/stream processing architectures.',
    fullNotes: `# Key Takeaways
- B-Trees optimize for random reads by updating fixed 4KB blocks in-place.
- LSM-Trees (Log-Structured Merge Trees) turn all random writes into sequential disk writes in memory (MemTable) before flushing to immutable SSTables.
- Unbounded streaming requires explicit event-time vs processing-time semantics with watermarks.`,
    citation: 'Kleppmann, M. (2017). Designing Data-Intensive Applications. O\'Reilly Media.',
    bookmarked: true,
  },
  {
    id: 'mckinsey-valuation',
    title: 'Valuation: Measuring and Managing the Value of Companies',
    author: 'Tim Koller, Marc Goedhart, David Wessels (McKinsey)',
    year: '2020',
    category: 'Book',
    tags: ['Corporate Valuation', 'DCF', 'ROIC', 'WACC', 'M&A'],
    readTime: '32h total',
    progress: 60,
    rating: 5,
    summary: 'The authoritative corporate finance manual detailing Return on Invested Capital (ROIC), economic profit, clean NOPAT calculations, and terminal growth constraints.',
    citation: 'Koller, T., Goedhart, M., & Wessels, D. (2020). Valuation (7th ed.). McKinsey & Company / Wiley.',
    bookmarked: false,
  },
  {
    id: 'rbi-bulletin-liquidity',
    title: 'RBI Monetary Policy Report & Liquidity Management Framework',
    author: 'Reserve Bank of India Monetary Policy Committee',
    year: '2026',
    category: 'Research Paper',
    tags: ['Macroeconomics', 'RBI Grade B', 'Inflation Targeting', 'Banking'],
    readTime: '1h 15m',
    progress: 100,
    rating: 5,
    summary: 'Comprehensive review of the Standing Deposit Facility (SDF) as an uncollateralized floor, weighted average call rate (WACR) corridor, and CPI headline targeting mandates.',
    citation: 'Reserve Bank of India. (2026). Monetary Policy Report October 2026. RBI Publications.',
    bookmarked: true,
  },
];

export const flashcardsData: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What is the mathematical formulation of Reciprocal Rank Fusion (RRF)?',
    back: 'RRF(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}\n\nWhere M is the set of retrieval models, r_m(d) is the ordinal rank of document d in model m, and k is a dampening constant (conventionally 60).',
    category: 'AI Systems',
    tags: ['RAG', 'Search', 'Information Retrieval'],
    difficulty: 'medium',
    reviewCount: 6,
    nextReview: 'In 3 days',
  },
  {
    id: 'fc-2',
    front: 'What are the 5 core assumptions underpinning the Black-Scholes-Merton option pricing model?',
    back: '1. Log-normal distribution of stock prices (Geometric Brownian Motion with constant μ and σ).\n2. Constant risk-free interest rate r.\n3. Frictionless markets (no transaction costs or taxes, continuous trading).\n4. No arbitrage opportunities.\n5. European-style exercise only (no early exercise prior to expiry).',
    category: 'Quantitative Finance',
    tags: ['Options', 'Black-Scholes', 'Derivatives'],
    difficulty: 'easy',
    reviewCount: 12,
    nextReview: 'In 7 days',
  },
  {
    id: 'fc-3',
    front: 'Explain the difference between Standing Deposit Facility (SDF) and Reverse Repo in RBI monetary policy.',
    back: 'SDF allows banks to park surplus funds with the RBI WITHOUT requiring the RBI to pledge government securities as collateral.\n\nReverse Repo requires collateralized pledging of G-Secs. SDF absorbs liquidity without constraining RBI’s sovereign bond reserves.',
    category: 'Macroeconomics',
    tags: ['RBI Grade B', 'Central Banking', 'Liquidity'],
    difficulty: 'hard',
    reviewCount: 3,
    nextReview: 'Tomorrow',
  },
  {
    id: 'fc-4',
    front: 'Why is Return on Invested Capital (ROIC) superior to Return on Equity (ROE) when analyzing operational performance?',
    back: 'ROE can be artificially inflated through financial leverage (taking on excessive debt). ROIC measures the cash return generated by the core operating assets regardless of capital structure (debt vs equity financing).',
    category: 'Corporate Finance',
    tags: ['Valuation', 'ROIC', 'Corporate Strategy'],
    difficulty: 'easy',
    reviewCount: 8,
    nextReview: 'In 5 days',
  },
];

export const mockExamData: MockExam = {
  id: 'rbi-grade-b-mock-04',
  title: 'RBI Grade B Phase II — Economic & Social Issues (ESI) + FinTech Full Mock #04',
  totalQuestions: 15,
  durationMinutes: 45,
  sections: [
    {
      name: 'Section A: Quantitative Finance & Macroeconomics',
      questions: [
        {
          id: 1,
          text: 'Under the Flexible Inflation Targeting Framework (FITF) in India, what is the mandated consumer price index (CPI) headline target and tolerance band?',
          options: [
            '3.0% with a tolerance band of ± 1.5%',
            '4.0% with a tolerance band of ± 2.0% (2% to 6%)',
            '5.0% with a tolerance band of ± 1.0%',
            '4.5% with a fixed corridor of ± 0.5%',
          ],
          correctAnswer: 1,
          topic: 'Macroeconomics & Monetary Policy',
          difficulty: 'Easy',
          explanation: 'The RBI Monetary Policy Framework mandates a 4% CPI inflation target with an upper tolerance limit of 6% and a lower tolerance limit of 2%. Three consecutive quarters outside this band constitutes a policy failure requiring an explanatory report to Parliament.',
        },
        {
          id: 2,
          text: 'In the Black-Scholes framework, what does the option Greek "Theta" (\\Theta) quantify?',
          options: [
            'Sensitivity of option price to changes in implied volatility.',
            'Rate of decay in option value as time elapses towards expiration (time decay), all else equal.',
            'Rate of change of delta with respect to the underlying spot price.',
            'Sensitivity to the risk-free rate of interest.',
          ],
          correctAnswer: 1,
          topic: 'Option Pricing & Risk',
          difficulty: 'Easy',
          explanation: 'Theta measures the negative rate of change of an option\'s price over time (∂V/∂t). For long vanilla option holders, Theta is strictly negative, reflecting eroding extrinsic time value.',
        },
        {
          id: 3,
          text: 'Consider an enterprise RAG pipeline experiencing high p99 latency during hybrid search. Which architectural intervention delivers the highest reduction in latency without degrading Recall@10?',
          options: [
            'Replace all vector indexes with SQLite linear string regex scanning.',
            'Implement 2-stage retrieval: Fetch Top-100 candidates via ANN vector search + Tantivy BM25, followed by a quantized cross-encoder reranker on only Top-30.',
            'Increase dense embedding dimensionality from 1536 to 8192 dims.',
            'Disable lexical indexing and double the LLM temperature parameter.',
          ],
          correctAnswer: 1,
          topic: 'AI Systems Architecture',
          difficulty: 'Moderate',
          explanation: 'A 2-stage cascaded pipeline maintains high recall by casting a wide net with lightweight lexical + ANN search, then applying the computationally expensive neural reranker only to the filtered candidate pool.',
        },
        {
          id: 4,
          text: 'When computing Enterprise Value (EV) from Market Capitalization, which calculation correctly accounts for net debt and minority interest?',
          options: [
            'EV = Market Cap + Total Debt - Cash & Cash Equivalents + Minority Interest + Preferred Stock',
            'EV = Market Cap - Total Debt + Cash & Cash Equivalents',
            'EV = Net Income + Operating Cash Flow * WACC',
            'EV = Total Assets - Total Liabilities + EBITDA',
          ],
          correctAnswer: 0,
          topic: 'Corporate Valuation',
          difficulty: 'Moderate',
          explanation: 'Enterprise Value represents the theoretical takeover cost of the core operating business. Cash is subtracted because a buyer can immediately pocket it; debt and minority interest are added because the acquirer must satisfy them.',
        },
        {
          id: 5,
          text: 'In distributed event processing with Apache Flink, what mechanism guarantees "Exactly-Once" state consistency across node failures?',
          options: [
            'Round-robin TCP packet retransmissions.',
            'Asynchronous Barrier Snapshotting (Chandy-Lamport variant) aligned with checkpointed state backends.',
            'Static CPU pinning on master nodes.',
            'Writing all stream events directly to hardcoded CSV files.',
          ],
          correctAnswer: 1,
          topic: 'Distributed Systems',
          difficulty: 'Challenging',
          explanation: 'Flink injects checkpoint barriers into the dataflow stream without pausing processing. Operators take lightweight asynchronous snapshots of their state when barriers arrive, enabling precise deterministic rollback upon failure.',
        },
      ],
    },
  ],
};

export const sampleProject: ProjectData = {
  id: 'fintech-credit-agents',
  title: 'Autonomous Agent Orchestration Platform for FinTech Credit Underwriting',
  subtitle: 'Translating theoretical mastery into production-grade multi-agent financial systems, risk models, and enterprise PRD.',
  tags: ['FinTech', 'Multi-Agent', 'Credit Risk', 'Python', 'Streamlit', 'PRD'],
  completionPercent: 82,
  prdContent: {
    overview: 'Autonomous multi-agent credit underwriting system designed for Tier-1 non-banking financial companies (NBFCs). Decouples underwriting into specialized autonomous agents: Document Extraction Agent, Bank Statement Cashflow Agent, Fraud Anomaly Agent, and Senior Credit Committee Supervisor Agent.',
    problemStatement: 'Traditional small business underwriting takes 3-5 business days due to manual analysis of unstandardized GST invoices and banking statements. The platform achieves sub-90-second deterministic loan decisions while reducing default rates via real-time risk modeling.',
    architectureOverview: 'Event-driven multi-agent architecture built on FastAPI, LangGraph orchestration, Pydantic data contracts, and a deterministic financial rule engine. Agents debate creditworthiness and reach mathematical consensus before issuing a binding credit limit.',
    slaSpecs: [
      'P95 End-to-end Decision Latency: < 45 seconds',
      'Automated Document OCR & Fraud Score: < 8 seconds',
      'Auditability: 100% deterministic decision ledger with SHA-256 provenance hashes',
      'False Positive Decline Rate: < 1.8%',
    ],
  },
  pythonCode: `import math
from dataclasses import dataclass

@dataclass
class ApplicantProfile:
    name: str
    monthly_revenue: float
    credit_score: int
    existing_debt_service: float
    requested_amount: float

class CreditRiskEngine:
    def __init__(self, risk_free_rate: float = 0.065):
        self.rf = risk_free_rate

    def compute_debt_service_ratio(self, profile: ApplicantProfile) -> float:
        """DSCR calculation: operating cashflow / debt service obligations"""
        if profile.existing_debt_service <= 0:
            return 999.0
        return profile.monthly_revenue / profile.existing_debt_service

    def evaluate_credit_decision(self, profile: ApplicantProfile) -> dict:
        dscr = self.compute_debt_service_ratio(profile)
        
        # Scoring logic
        credit_weight = (profile.credit_score - 300) / 600.0  # normalized 0-1
        cashflow_weight = min(dscr / 3.0, 1.0)
        composite_score = (credit_weight * 0.55) + (cashflow_weight * 0.45)
        
        # Risk classification
        if profile.credit_score < 620 or dscr < 1.2:
            verdict = "DECLINED"
            max_limit = 0.0
            interest_rate = 0.0
            rationale = "DSCR below minimum prudential threshold (1.2x) or credit score below 620."
        elif composite_score >= 0.75:
            verdict = "APPROVED_PREMIUM"
            max_limit = min(profile.requested_amount, profile.monthly_revenue * 2.8)
            interest_rate = self.rf + 0.042  # 10.7% p.a.
            rationale = "Exemplary cashflow velocity and prime credit score profile."
        else:
            verdict = "APPROVED_CONDITIONAL"
            max_limit = min(profile.requested_amount * 0.7, profile.monthly_revenue * 1.5)
            interest_rate = self.rf + 0.078  # 14.3% p.a.
            rationale = "Approved with collateral enhancement requirement."

        return {
            "applicant": profile.name,
            "verdict": verdict,
            "composite_score": round(composite_score, 3),
            "max_approved_limit": round(max_limit, 2),
            "interest_rate_percent": round(interest_rate * 100, 2),
            "dscr_ratio": round(dscr, 2),
            "rationale": rationale
        }

# Live Engine Execution
engine = CreditRiskEngine()
applicant = ApplicantProfile(
    name="Maheswar Ventures",
    monthly_revenue=48000.0,
    credit_score=782,
    existing_debt_service=6500.0,
    requested_amount=120000.0
)
decision = engine.evaluate_credit_decision(applicant)
print("=== AGENT UNDERWRITING VERDICT ===")
for k, v in decision.items():
    print(f"{k.upper()}: {v}")
`,
  simulationConfig: {
    applicantName: 'Maheswar Ventures',
    monthlyIncome: 48000,
    creditScore: 782,
    existingDebt: 6500,
    requestedLoan: 120000,
  },
  investmentMemo: {
    executiveSummary: 'Autonomous underwriting reduces customer acquisition friction by 84% while maintaining underwriting quality equivalent to senior human loan committees.',
    marketOpportunity: '$420B underserved SME credit gap across Tier-2/3 economic corridors with digital banking rails (UPI / Account Aggregator).',
    riskMitigation: [
      'Real-time account aggregator API integration to prevent falsified bank statements.',
      'Cornish-Fisher expansion VaR models to stress test borrower cashflows under macroeconomic rate hikes.',
      'Human-in-the-loop escalation circuit for edge cases with composite score between 0.60 and 0.65.',
    ],
    score: 94,
  },
};
