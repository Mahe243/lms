import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.config import settings
from backend.models import (
    User, Course, Module, Topic, Subtopic, Note, NoteVersion, Resource, ResourceChunk,
    Comment, FlashcardDeck, Flashcard, FlashcardReview, QuestionBank, Question,
    QuizAttempt, ActiveLearningItem, StudySession, ActivityEvent, Task,
    CalendarEvent, Goal, JournalEntry, Notification
)

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def clean_demo_data(db: Session) -> Dict[str, int]:
    """Deletes ONLY data marked with is_demo=True, ensuring personal learner data is never lost."""
    deleted_counts = {}
    deleted_counts["courses"] = db.query(Course).filter(Course.is_demo == True).delete(synchronize_session=False)
    deleted_counts["notes"] = db.query(Note).filter(Note.is_demo == True).delete(synchronize_session=False)
    deleted_counts["resources"] = db.query(Resource).filter(Resource.is_demo == True).delete(synchronize_session=False)
    deleted_counts["comments"] = db.query(Comment).filter(Comment.is_demo == True).delete(synchronize_session=False)
    deleted_counts["flashcard_decks"] = db.query(FlashcardDeck).filter(FlashcardDeck.is_demo == True).delete(synchronize_session=False)
    deleted_counts["flashcards"] = db.query(Flashcard).filter(Flashcard.is_demo == True).delete(synchronize_session=False)
    deleted_counts["question_banks"] = db.query(QuestionBank).filter(QuestionBank.is_demo == True).delete(synchronize_session=False)
    deleted_counts["questions"] = db.query(Question).filter(Question.is_demo == True).delete(synchronize_session=False)
    deleted_counts["quiz_attempts"] = db.query(QuizAttempt).filter(QuizAttempt.is_demo == True).delete(synchronize_session=False)
    deleted_counts["active_learning_items"] = db.query(ActiveLearningItem).filter(ActiveLearningItem.is_demo == True).delete(synchronize_session=False)
    deleted_counts["study_sessions"] = db.query(StudySession).filter(StudySession.is_demo == True).delete(synchronize_session=False)
    deleted_counts["tasks"] = db.query(Task).filter(Task.is_demo == True).delete(synchronize_session=False)
    deleted_counts["calendar_events"] = db.query(CalendarEvent).filter(CalendarEvent.is_demo == True).delete(synchronize_session=False)
    deleted_counts["goals"] = db.query(Goal).filter(Goal.is_demo == True).delete(synchronize_session=False)
    deleted_counts["journal_entries"] = db.query(JournalEntry).filter(JournalEntry.is_demo == True).delete(synchronize_session=False)
    db.commit()
    return deleted_counts

def seed_demo_data(db: Session) -> bool:
    """Seeds comprehensive, interconnected curriculum and platform data."""
    now = utc_now()
    yesterday = now - timedelta(days=1)
    two_days_ago = now - timedelta(days=2)

    # 0. User Profile
    existing_user = db.query(User).first()
    if not existing_user:
        u = User(
            name="Maheswar",
            email="maheswar@learnova.edu",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
            preferences=json.dumps({
                "program": "Dual MBA / M.S. in Machine Learning",
                "cohort": "Class of 2027",
                "term": "Autumn Quarter",
                "week": "Week 07 of 12",
                "dark_mode": False,
                "ai_provider": "gemini",
                "ai_model": "gemini-1.5-flash",
                "preferred_explanation_language": "English",
                "preferred_depth": "balanced",
                "streak_min_minutes": 15,
                "idle_timeout_minutes": 30,
                "daily_card_limit": 20,
                "daily_review_limit": 50,
                "timezone": "UTC"
            })
        )
        db.add(u)
        db.flush()

    # 1. Course 1: Latency Optimization in Enterprise RAG Pipelines
    c1 = Course(
        id="ai-pm-llm",
        name="Latency Optimization in Enterprise RAG Pipelines",
        code="CS-742",
        category="CS",
        instructor="Dr. Elena Rostova",
        description="Master low-latency retrieval architectures, vector quantization, speculative decoding, and hybrid lexical-semantic reranking at enterprise scale.",
        priority="high",
        cover_color="#4f46e5",
        tags=json.dumps(["RAG", "VectorDB", "HNSW", "Latency", "LLMs"]),
        syllabus="Module 01: Vector Compression & Memory Optimization\nModule 02: Speculative Inference & Reranking",
        learning_goals=json.dumps(["Sub-25ms retrieval latency", "Implement SQ8 and Product Quantization", "Evaluate BM25 vs Dense HNSW trade-offs"]),
        status="active",
        is_demo=True
    )
    db.merge(c1)
    db.flush()

    m1_1 = Module(id="mod-rag-1", course_id=c1.id, title="Module 01: Vector Compression & Memory Optimization", description="Quantization, HNSW graphs, and low-latency embeddings", order_index=1)
    db.merge(m1_1)
    db.flush()

    t1_1 = Topic(
        id="lesson-hybrid-search",
        module_id=m1_1.id,
        course_id=c1.id,
        title="Hybrid Search Architecture: Blending Keyword Precision with Semantic Context",
        description="Low-latency retrieval architectures, vector quantization, and reciprocal rank fusion at enterprise scale.",
        learning_objectives=json.dumps(["Explain RRF formula k=60", "Understand inverted indexes vs vector graphs", "Balance exact match with semantic intent"]),
        estimated_minutes=35,
        status="completed",
        understanding_level="confident",
        order_index=1,
        video_url="https://www.youtube.com/watch?v=zjkBMFhNj_g",
        markdown_content="""### Foundational Architecture: Hybrid Lexical + Semantic Retrieval

Production retrieval architectures must simultaneously satisfy two contradictory requirements:
1. **Exact-Match Precision:** Handling SKU numbers, error codes, legal clauses, and entity names without semantic drift.
2. **Semantic Generalization:** Matching user intent across synonyms, natural language queries, and conceptual abstractions.

#### Reciprocal Rank Fusion (RRF)
$$\\text{RRF Score}(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}$$

Constant $k = 60$ acts as a dampener preventing top-1 dense candidates from dominating lexical matches.""",
        key_takeaways=json.dumps([
            "Reciprocal Rank Fusion (RRF) with constant k=60 balances dense embeddings against BM25 lexical scores without calibration issues.",
            "Inverted indexes (Tantivy/Lucene) ensure sub-5ms exact match recall for SKUs, error codes, and entity IDs.",
            "Quantized vector graphs (SQ8) shrink RAM footprint by 75% with less than 1% degradation in recall."
        ]),
        quiz_data=json.dumps([
            {
                "question": "What is the primary architectural purpose of setting the dampening constant k=60 in Reciprocal Rank Fusion (RRF)?",
                "options": [
                    "It ensures that document length normalization matches BM25's b parameter.",
                    "It prevents high-ranking outliers from dense models from completely dominating lexical matches.",
                    "It scales the maximum score to exactly 1.0.",
                    "It forces vector cosine distances into Euclidean coordinates."
                ],
                "correctIndex": 1,
                "explanation": "Without k, the difference between rank 1 (score 1.0) and rank 2 (score 0.5) is massive compared to rank 50 (0.02) and rank 51 (0.0196). Constant k dampens the steep drop-off at the top."
            }
        ]),
        is_optional=False,
        last_studied_at=yesterday
    )

    t1_2 = Topic(
        id="lesson-pq-sq8",
        module_id=m1_1.id,
        course_id=c1.id,
        title="Vector Quantization: Product Quantizers (PQ) & Scalar Quantizers (SQ8)",
        description="Scalar Quantization (SQ8) and Product Quantization (PQ) for large-scale enterprise vector stores.",
        learning_objectives=json.dumps(["Compare SQ8 vs PQ compression ratios", "Understand Asymmetric Distance Computation", "Optimize vector database RAM budgets"]),
        estimated_minutes=25,
        status="completed",
        understanding_level="comfortable",
        order_index=2,
        video_url="https://www.youtube.com/watch?v=QdDoFfkVkcw",
        markdown_content="""### Scalar & Product Quantization in Enterprise Vector Stores

Uncompressed float32 vectors exhaust cluster RAM rapidly (1M x 1536 x 4 bytes = 6.14 GB).

SQ8 normalizes dimensions into [-128, 127], shrinking memory by 75%. Product Quantization (PQ) achieves up to 32x compression by encoding subvectors as byte code centroids.""",
        key_takeaways=json.dumps([
            "Scalar Quantization (SQ8) compresses 32-bit floats into 8-bit integers, yielding a 4x memory reduction.",
            "Product Quantization (PQ) divides D-dimensional vectors into m orthogonal sub-spaces and quantizes each with k-means centroids.",
            "Asymmetric Distance Computation (ADC) compares full-precision queries against quantized database vectors without decompression."
        ]),
        quiz_data=json.dumps([
            {
                "question": "Why does Asymmetric Distance Computation (ADC) achieve higher retrieval accuracy than Symmetric Distance Computation (SDC)?",
                "options": [
                    "ADC quantizes both query and database vectors.",
                    "ADC keeps the incoming query in full float32 precision, quantizing only database vectors.",
                    "ADC uses Hamming distance instead of Euclidean distance.",
                    "ADC bypasses clustering."
                ],
                "correctIndex": 1,
                "explanation": "ADC eliminates quantization noise on the query side by leaving query vectors in full 32-bit float precision."
            }
        ]),
        is_optional=False,
        last_studied_at=two_days_ago
    )

    t1_3 = Topic(
        id="lesson-speculative-decoding",
        module_id=m1_1.id,
        course_id=c1.id,
        title="Speculative Decoding & KV-Cache Offloading",
        description="Accelerating generative token generation through small draft models and speculative verification.",
        learning_objectives=json.dumps(["Explain speculative verification matrix", "Optimize KV-cache memory bandwidth", "Calculate throughput speedup"]),
        estimated_minutes=30,
        status="in_progress",
        understanding_level="comfortable",
        order_index=3,
        video_url="https://www.youtube.com/watch?v=wjZofJX0v4M",
        markdown_content="""### Speculative Decoding Mechanics

LLM inference is memory-bandwidth bound during autoregressive generation. Speculative decoding uses a lightweight draft model (e.g. 1B parameter) to hypothesize K tokens in parallel, which the primary model verifies in a single forward pass.""",
        key_takeaways=json.dumps([
            "Speculative decoding transforms memory-bound decoding into compute-bound batch verification.",
            "Yields 2x-3x wall-clock latency improvement with mathematically identical output distribution."
        ]),
        quiz_data=json.dumps([
            {
                "question": "What is the primary factor limiting token generation speed in standard autoregressive LLM decoding?",
                "options": [
                    "Compute floating point operations (TFLOPS).",
                    "Memory bandwidth loading model weights from VRAM to compute cores for each individual token.",
                    "Network socket latency.",
                    "Context window fragmentation."
                ],
                "correctIndex": 1,
                "explanation": "Because weights must be read from high-bandwidth memory for every single token generated, batch size 1 inference is memory bandwidth bound."
            }
        ]),
        is_optional=False
    )
    db.merge(t1_1)
    db.merge(t1_2)
    db.merge(t1_3)
    db.flush()

    # Course 2: Monetary Policy Transmission
    c2 = Course(
        id="monetary-policy",
        name="Monetary Policy Transmission & Inflation Targeting",
        code="FIN-820",
        category="Finance",
        instructor="Prof. Raghuram Patel",
        description="Rigorous central banking frameworks, liquidity adjustment facility (LAF), open market operations, and Phillips curve dynamics for RBI Grade B Phase II.",
        priority="high",
        cover_color="#855300",
        tags=json.dumps(["Finance", "Macroeconomics", "RBI", "Liquidity", "LAF"]),
        status="active",
        is_demo=True
    )
    db.merge(c2)
    db.flush()

    m2_1 = Module(id="mod-fin-1", course_id=c2.id, title="Module 01: Central Banking Frameworks & Policy Corridors", description="Taylor rule and liquidity adjustment facilities", order_index=1)
    db.merge(m2_1)
    db.flush()

    t2_1 = Topic(
        id="lesson-taylor-rule",
        module_id=m2_1.id,
        course_id=c2.id,
        title="Taylor Rule vs Constrained Discretion in Emerging Markets",
        description="Mathematical formulation of monetary policy rate setting and flexible inflation targeting.",
        learning_objectives=json.dumps(["Formulate Taylor Rule", "Understand output gap calculations", "Analyze capital flow trilemma"]),
        estimated_minutes=40,
        status="completed",
        understanding_level="confident",
        order_index=1,
        video_url="https://www.youtube.com/watch?v=_SpIaGTq0u8",
        markdown_content="""### The Taylor Rule Equation

$$i_t = r^* + \\pi_t + 0.5(\\pi_t - \\pi^*) + 0.5(y_t - \\bar{y}_t)$$

In emerging market central banks, the rule is modified to incorporate real exchange rate depreciation and foreign reserve constraints.""",
        key_takeaways=json.dumps([
            "Taylor principle requires raising nominal policy rate by more than 1:1 against inflation spikes.",
            "Constrained discretion balances credible rule commitments against black swan macroeconomic shocks."
        ]),
        quiz_data=json.dumps([
            {
                "question": "What is the primary consequence if a central bank violates the Taylor Principle (i.e. coefficient on inflation is < 1)?",
                "options": [
                    "Real interest rates fall when inflation rises, leading to destabilizing inflationary spirals.",
                    "The currency automatically appreciates against reserve assets.",
                    "Banks experience excessive excess liquidity.",
                    "Government debt becomes non-tradable."
                ],
                "correctIndex": 0,
                "explanation": "If nominal rates rise less than inflation, real rates drop, which stimulates borrowing and accelerates inflation further."
            }
        ]),
        is_optional=False
    )
    db.merge(t2_1)
    db.flush()

    # Course 3: Corporate Valuation & DCF Modeling
    c3 = Course(
        id="corporate-valuation",
        name="Corporate Valuation & DCF Modeling in Financial Markets",
        code="MBA-610",
        category="Finance",
        instructor="Prof. Alistair Vance",
        description="Wall Street institutional financial analysis, Weighted Average Cost of Capital (WACC), Monte Carlo scenario analysis, and M&A accretion/dilution.",
        priority="medium",
        cover_color="#005338",
        tags=json.dumps(["Valuation", "DCF", "WACC", "Corporate Finance", "M&A"]),
        status="active",
        is_demo=True
    )
    db.merge(c3)
    db.flush()

    m3_1 = Module(id="mod-val-1", course_id=c3.id, title="Module 01: Discounted Cash Flow Foundations", description="Terminal value, UFCF, and cost of capital", order_index=1)
    db.merge(m3_1)
    db.flush()

    t3_1 = Topic(
        id="lesson-terminal-value",
        module_id=m3_1.id,
        course_id=c3.id,
        title="Terminal Value Sensitivity & Unlevered Free Cash Flow Projections",
        description="Gordon Growth vs Exit Multiple methodologies in institutional valuation.",
        learning_objectives=json.dumps(["Derive Unlevered Free Cash Flow", "Compute Terminal Value", "Perform sensitivity analysis"]),
        estimated_minutes=45,
        status="in_progress",
        understanding_level="comfortable",
        order_index=1,
        video_url="https://www.youtube.com/watch?v=znmQ7oMiQrM",
        markdown_content="""### Terminal Value Formulation

$$\\text{Terminal Value}_N = \\frac{\\text{UFCF}_{N+1}}{\\text{WACC} - g}$$

Long-term perpetual growth rate $g$ must never exceed nominal GDP growth of the operating jurisdiction.""",
        key_takeaways=json.dumps([
            "Terminal value often represents 60%-85% of total DCF enterprise value.",
            "WACC must incorporate dynamic capital structure weights rather than static book values."
        ]),
        quiz_data=json.dumps([
            {
                "question": "Why must the perpetual growth rate 'g' in the Gordon Growth model not exceed the projected long-term nominal GDP growth rate?",
                "options": [
                    "It mathematically creates a negative denominator.",
                    "If a company grows faster than the economy forever, it would eventually become larger than the entire economy.",
                    "Cost of debt becomes invalid.",
                    "Tax shields disappear."
                ],
                "correctIndex": 1,
                "explanation": "In perpetuity, no single business can outpace the total economy without eventually exceeding global GDP."
            }
        ]),
        is_optional=False
    )
    db.merge(t3_1)
    db.flush()

    # Course 4: Product Sense Healthcare
    c4 = Course(
        id="product-sense-healthcare",
        name="Product Sense: Designing Uber for Critical Healthcare",
        code="PM-904",
        category="MBA",
        instructor="Maya Lin (VP Product)",
        description="0-to-1 PRD authorship for complex marketplace topologies, HIPAA compliance boundaries, dual-dispatch driver economics, and healthcare SLA commitments.",
        priority="medium",
        cover_color="#3525cd",
        tags=json.dumps(["Product", "PRD", "Healthcare", "SLA", "Marketplace"]),
        status="active",
        is_demo=True
    )
    db.merge(c4)
    db.flush()

    m4_1 = Module(id="mod-pm-1", course_id=c4.id, title="Module 01: Healthcare Dispatch Topologies", description="NEMT PRD and dual-dispatch SLAs", order_index=1)
    db.merge(m4_1)
    db.flush()

    t4_1 = Topic(
        id="lesson-nemt-prd",
        module_id=m4_1.id,
        course_id=c4.id,
        title="Non-Emergency Medical Transportation (NEMT) PRD & SLA Circuit Breakers",
        description="Marketplace mechanics, insurance reimbursement rails, and on-time reliability guarantees.",
        learning_objectives=json.dumps(["Write enterprise PRD", "Define SLA circuit breakers", "Model healthcare dispatch supply-demand"]),
        estimated_minutes=50,
        status="not_started",
        understanding_level="unfamiliar",
        order_index=1,
        video_url="https://www.youtube.com/watch?v=5nAeyqNuZYU",
        markdown_content="""### Product Requirements Document: NEMT Dual-Dispatch Platform

Critical healthcare logistics differ fundamentally from standard rideshare:
- Missed pickup carries life-safety penalties and hospital dialysis reschedule costs.
- Driver onboarding requires specialized CPR and wheelchair-securement certifications.""",
        key_takeaways=json.dumps([
            "Reliability SLAs require pre-dispatch redundancy buffers rather than real-time matching.",
            "Payer integrations (Medicaid/Medicare) require strict compliance audit trails."
        ]),
        quiz_data=json.dumps([
            {
                "question": "What is the primary dispatch difference between NEMT logistics and standard peer-to-peer rideshare?",
                "options": [
                    "NEMT trips are entirely free to riders.",
                    "NEMT requires deterministic pre-scheduled dispatch with escalation backups due to severe medical rescheduling costs.",
                    "NEMT does not use GPS tracking.",
                    "NEMT trips only operate on weekends."
                ],
                "correctIndex": 1,
                "explanation": "Dialysis, chemotherapy, and post-op appointments cannot tolerate a cancellation; the system must pre-dispatch with cold standby drivers."
            }
        ]),
        is_optional=False
    )
    db.merge(t4_1)
    db.flush()

    # Course 5: Real-Time Stream Processing with Apache Flink & Kafka
    c5 = Course(
        id="flink-kafka-streaming",
        name="Real-Time Stream Processing with Apache Flink & Kafka",
        code="CS-812",
        category="CS",
        instructor="Alexei Ivanov",
        description="Event-driven distributed streaming pipelines, watermark propagation, stateful CEP pattern matching, and high-throughput low-latency telemetry.",
        priority="high",
        cover_color="#ba1a1a",
        tags=json.dumps(["Kafka", "Flink", "Streaming", "Distributed", "RocksDB"]),
        status="active",
        is_demo=True
    )
    db.merge(c5)
    db.flush()

    m5_1 = Module(id="mod-flink-1", course_id=c5.id, title="Module 01: Stateful Stream Architectures", description="State backends and exactly-once processing", order_index=1)
    db.merge(m5_1)
    db.flush()

    t5_1 = Topic(
        id="lesson-flink-state",
        module_id=m5_1.id,
        course_id=c5.id,
        title="Exactly-Once State Semantics & RocksDB State Backend Optimization",
        description="Checkpoint barriers, two-phase commit sinks, and LSM-tree state offloading.",
        learning_objectives=json.dumps(["Explain Chandy-Lamport barrier alignment", "Tune RocksDB block cache", "Implement Kafka 2PC sink"]),
        estimated_minutes=45,
        status="completed",
        understanding_level="confident",
        order_index=1,
        video_url="https://www.youtube.com/watch?v=Ch5VhJzaoaI",
        markdown_content="""### Flink State Backend Architecture

Stateful operators retain intermediate aggregations in RocksDB LSM-trees offloaded from Java heap memory. Checkpoint barriers flow alongside event streams to trigger asynchronous non-blocking state snapshots.""",
        key_takeaways=json.dumps([
            "Asynchronous barrier snapshotting avoids stop-the-world streaming pauses.",
            "RocksDB state backend supports terabyte-scale state exceeding total cluster RAM."
        ]),
        quiz_data=json.dumps([
            {
                "question": "How does Apache Flink achieve exactly-once processing across end-to-end distributed pipelines?",
                "options": [
                    "By pausing incoming traffic whenever state is modified.",
                    "By pairing periodic state checkpointing with a Two-Phase Commit (2PC) sink protocol.",
                    "By deduplicating messages with in-memory Redis caches.",
                    "By strictly avoiding stateful operators."
                ],
                "correctIndex": 1,
                "explanation": "Flink combines lightweight checkpoint barriers with Kafka transactional producers using a Two-Phase Commit protocol."
            }
        ]),
        is_optional=False
    )
    db.merge(t5_1)
    db.flush()

    # 2. Resources (Books, Papers, Video Lectures)
    r1 = Resource(
        id="res-hull",
        title="Options, Futures, and Other Derivatives (10th Ed.)",
        type="book",
        author="John C. Hull",
        tags=json.dumps(["Derivatives", "Quant", "Black-Scholes", "Greeks"]),
        description="The undisputed bible of quantitative derivatives pricing. Covers Black-Scholes-Merton model derivations, volatility smiles, and interest rate trees.",
        personal_rating=5,
        is_favorite=True,
        status="in_progress",
        is_demo=True
    )
    r2 = Resource(
        id="res-attention",
        title="Attention Is All You Need",
        type="pdf",
        url="https://arxiv.org/pdf/1706.03762.pdf",
        author="Vaswani, A., Shazeer, N., Parmar, N., et al.",
        tags=json.dumps(["Transformers", "Attention", "Deep Learning", "LLMs"]),
        description="The seminal 2017 research paper introducing the Transformer architecture, multi-head self-attention, and positional encodings.",
        personal_rating=5,
        is_favorite=True,
        status="completed",
        is_demo=True
    )
    r3 = Resource(
        id="res-video-rag",
        title="Deep Dive: Low-Latency RAG Architectures & Vector Quantization",
        type="video",
        url="https://www.youtube.com/watch?v=zjkBMFhNj_g",
        author="Dr. Elena Rostova",
        tags=json.dumps(["RAG", "VectorDB", "Latency", "Quantization"]),
        description="Master lecture on sub-20ms hybrid search, reciprocal rank fusion (RRF), SQ8 vector compression, and multi-tenant partitioning.",
        personal_rating=5,
        is_favorite=True,
        status="in_progress",
        is_demo=True
    )
    db.merge(r1)
    db.merge(r2)
    db.merge(r3)
    db.flush()

    # RAG Chunks for grounding
    rc1 = ResourceChunk(
        resource_id=r2.id,
        chunk_index=0,
        page_number=1,
        text_content="The Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution."
    )
    rc2 = ResourceChunk(
        resource_id=r3.id,
        chunk_index=0,
        page_number=1,
        text_content="Reciprocal Rank Fusion (RRF) score is computed as sum of 1 / (60 + rank). Constant k=60 prevents top-1 dense candidates from skewing lexical results."
    )
    db.add_all([rc1, rc2])
    db.flush()

    # 3. Flashcards (with FSRS parameters)
    deck = FlashcardDeck(
        name="Quantitative Finance & Systems Architecture",
        description="High-yield flashcards reviewed with FSRS spaced repetition algorithms",
        is_demo=True
    )
    db.add(deck)
    db.flush()

    f1 = Flashcard(
        deck_id=deck.id,
        course_id=c1.id,
        topic_id=t1_1.id,
        front="What is the mathematical definition and role of the parameter k in Reciprocal Rank Fusion (RRF)?",
        back="RRF Score(d) = sum(1 / (k + rank)). Constant k=60 prevents top-ranked candidates from dominating the aggregated ranking curve.",
        stability=3.8,
        reps=4,
        lapses=0,
        interval_days=7,
        state="review",
        is_demo=True
    )
    f2 = Flashcard(
        deck_id=deck.id,
        course_id=c3.id,
        topic_id=t3_1.id,
        front="In options trading, what happens to Gamma as expiration approaches for At-The-Money (ATM) options?",
        back="Gamma approaches infinity for ATM options near expiry (pin risk), requiring hyper-frequent dynamic delta hedging.",
        stability=5.2,
        reps=6,
        lapses=1,
        interval_days=14,
        state="review",
        is_demo=True
    )
    f3 = Flashcard(
        deck_id=deck.id,
        course_id=c1.id,
        topic_id=t1_2.id,
        front="Why does Product Quantization (PQ) achieve greater compression than Scalar Quantization (SQ8)?",
        back="SQ8 quantizes each dimension independently (32-bit to 8-bit, 4x compression). PQ divides D dimensions into m subspaces and quantizes vector groups into cluster centroids (up to 32x compression).",
        stability=2.1,
        reps=2,
        lapses=0,
        interval_days=3,
        state="learning",
        is_demo=True
    )
    db.add_all([f1, f2, f3])
    db.flush()

    # 4. Notes
    n1 = Note(
        course_id=c1.id,
        topic_id=t1_1.id,
        title="RRF Hybrid Search Architecture Notes",
        content="Key insight: RRF Score(d) = sum(1 / (k + rank)). k=60 prevents top-1 bias.\nTantivy full-text search handles alphanumeric SKUs, while Milvus HNSW handles semantic intent.",
        summary="Hybrid search combines inverted indexes and dense vector graphs with dampening constant k=60.",
        tags=json.dumps(["RAG", "Search", "Architecture"]),
        is_favorite=True,
        is_demo=True
    )
    db.add(n1)
    db.flush()

    # 5. Question Bank for Practice Arena
    q_bank = QuestionBank(
        id="bank-rbi-grade-b",
        course_id=c2.id,
        name="RBI Grade B Phase II — Economic & Social Issues Diagnostic Mock",
        description="Curated high-pressure mock exam questions testing monetary economics and financial markets.",
        is_demo=True
    )
    db.merge(q_bank)
    db.flush()

    q1 = Question(
        id="q-mock-1",
        bank_id=q_bank.id,
        course_id=c2.id,
        topic_id=t2_1.id,
        question_type="multiple_choice",
        question_text="Under the Flexible Inflation Targeting Framework (FITF) in India, what is the mandated consumer price index (CPI) headline target and tolerance band?",
        options=json.dumps([
            "3.0% with a tolerance band of ± 1.5%",
            "4.0% with a tolerance band of ± 2.0% (2% to 6%)",
            "5.0% with a tolerance band of ± 1.0%",
            "4.5% with a fixed corridor of ± 0.5%"
        ]),
        correct_answer="1",
        explanation="The RBI Monetary Policy Framework mandates a 4% CPI inflation target with an upper tolerance limit of 6% and a lower tolerance limit of 2%. Three consecutive quarters outside this band constitutes a policy failure requiring an explanatory report to Parliament.",
        difficulty="easy",
        is_demo=True
    )
    q2 = Question(
        id="q-mock-2",
        bank_id=q_bank.id,
        course_id=c3.id,
        topic_id=t3_1.id,
        question_type="multiple_choice",
        question_text='In the Black-Scholes framework, what does the option Greek "Theta" (\\Theta) quantify?',
        options=json.dumps([
            "Sensitivity of option price to changes in implied volatility.",
            "Rate of decay in option value as time elapses towards expiration (time decay), all else equal.",
            "Rate of change of delta with respect to the underlying spot price.",
            "Sensitivity to the risk-free rate of interest."
        ]),
        correct_answer="1",
        explanation="Theta measures the negative rate of change of an option's price over time (∂V/∂t). For long vanilla option holders, Theta is strictly negative, reflecting eroding extrinsic time value.",
        difficulty="easy",
        is_demo=True
    )
    q3 = Question(
        id="q-mock-3",
        bank_id=q_bank.id,
        course_id=c1.id,
        topic_id=t1_1.id,
        question_type="multiple_choice",
        question_text="Consider an enterprise RAG pipeline experiencing high p99 latency during hybrid search. Which architectural intervention delivers the highest reduction in latency without degrading Recall@10?",
        options=json.dumps([
            "Replace all vector indexes with SQLite linear string regex scanning.",
            "Implement 2-stage retrieval: Fetch Top-100 candidates via ANN vector search + Tantivy BM25, followed by a quantized cross-encoder reranker on only Top-30.",
            "Increase dense embedding dimensionality from 1536 to 8192 dims.",
            "Disable lexical indexing and double the LLM temperature parameter."
        ]),
        correct_answer="1",
        explanation="A 2-stage cascaded pipeline maintains high recall by casting a wide net with lightweight lexical + ANN search, then applying the computationally expensive neural reranker only to the filtered candidate pool.",
        difficulty="moderate",
        is_demo=True
    )
    q4 = Question(
        id="q-mock-4",
        bank_id=q_bank.id,
        course_id=c3.id,
        topic_id=t3_1.id,
        question_type="multiple_choice",
        question_text="When computing Enterprise Value (EV) from Market Capitalization, which calculation correctly accounts for net debt and minority interest?",
        options=json.dumps([
            "EV = Market Cap + Total Debt - Cash & Cash Equivalents + Minority Interest + Preferred Stock",
            "EV = Market Cap - Total Debt + Cash & Cash Equivalents",
            "EV = Net Income + Operating Cash Flow * WACC",
            "EV = Total Assets - Total Liabilities + EBITDA"
        ]),
        correct_answer="0",
        explanation="Enterprise Value represents the theoretical takeover cost of the core operating business. Cash is subtracted because a buyer can immediately pocket it; debt and minority interest are added because the acquirer must satisfy them.",
        difficulty="moderate",
        is_demo=True
    )
    q5 = Question(
        id="q-mock-5",
        bank_id=q_bank.id,
        course_id=c5.id,
        topic_id=t5_1.id,
        question_type="multiple_choice",
        question_text='In distributed event processing with Apache Flink, what mechanism guarantees "Exactly-Once" state consistency across node failures?',
        options=json.dumps([
            "Round-robin TCP packet retransmissions.",
            "Asynchronous Barrier Snapshotting (Chandy-Lamport variant) aligned with checkpointed state backends.",
            "Static CPU pinning on master nodes.",
            "Writing all stream events directly to hardcoded CSV files."
        ]),
        correct_answer="1",
        explanation="Flink injects checkpoint barriers into the dataflow stream without pausing processing. Operators take lightweight asynchronous snapshots of their state when barriers arrive, enabling precise deterministic rollback upon failure.",
        difficulty="challenging",
        is_demo=True
    )
    db.merge(q1)
    db.merge(q2)
    db.merge(q3)
    db.merge(q4)
    db.merge(q5)
    db.flush()

    # 6. Study Sessions (Real Focus Duration - seeded only when SEED_DEMO_ACTIVITY=true)
    if settings.SEED_DEMO_ACTIVITY:
        s1 = StudySession(
            session_type="pomodoro",
            course_id=c1.id,
            topic_id=t1_1.id,
            planned_duration_mins=25,
            actual_duration_secs=1500,
            goal="RAG Hybrid Search Architecture",
            session_notes="Deep dive into reciprocal rank fusion k-factor calibration.",
            status="completed",
            is_demo=True,
            created_at=yesterday
        )
        s2 = StudySession(
            session_type="deep_work",
            course_id=c2.id,
            topic_id=t2_1.id,
            planned_duration_mins=50,
            actual_duration_secs=3000,
            goal="Taylor Rule & Macroeconomics",
            session_notes="Derivation of output gap and flexible inflation targeting.",
            status="completed",
            is_demo=True,
            created_at=two_days_ago
        )
        db.add_all([s1, s2])
        db.flush()

    # 7. Goals
    g1 = Goal(
        title="Complete CS-742 Retrieval Latency Sprint",
        goal_type="hours",
        target_value=10.0,
        current_value=6.5,
        unit="hours",
        period="weekly",
        deadline=now + timedelta(days=28),
        course_id=c1.id,
        is_completed=False,
        is_demo=True
    )
    g2 = Goal(
        title="Score >85% on RBI Grade B Phase II Mock",
        goal_type="score",
        target_value=85.0,
        current_value=90.0,
        unit="percent",
        period="monthly",
        deadline=now + timedelta(days=45),
        course_id=c2.id,
        is_completed=True,
        is_demo=True
    )
    db.add_all([g1, g2])
    db.flush()

    # 8. Tasks (Sprint Backlog)
    task1 = Task(title="Derive Reciprocal Rank Fusion mathematical formula", priority="high", status="completed", course_id=c1.id, is_demo=True)
    task2 = Task(title="Analyze Hull chapter 14 Greek sensitivity graphs", priority="high", status="completed", course_id=c3.id, is_demo=True)
    task3 = Task(title="Run simulation on multi-agent credit risk engine", priority="medium", status="todo", course_id=c1.id, is_demo=True)
    task4 = Task(title="Complete RBI Grade B Phase II ESI Mock Section A", priority="medium", status="todo", course_id=c2.id, is_demo=True)
    db.add_all([task1, task2, task3, task4])

    db.commit()
    return True
