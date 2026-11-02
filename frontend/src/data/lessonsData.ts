import type { Lesson } from '../types';

export interface EnterpriseLesson extends Lesson {
  lead: string;
  notes: string;
}

export const ENTERPRISE_RAG_LESSONS: Record<string, EnterpriseLesson> = {
  'lesson-vq': {
    id: 'lesson-vq',
    courseId: 'ai-pm-llm',
    title: 'Vector Quantization & Product Quantizers',
    moduleTitle: 'Module 01 • Vector Compaction & Codebooks',
    duration: '35:20',
    completed: true,
    videoUrl: 'https://www.youtube.com/watch?v=ywsyN_l7Wp8',
    lead: 'Master sub-vector clustering, centroid codebooks, and Asymmetric Distance Computation (ADC) to compress high-dimensional vector spaces by 8x-16x.',
    notes: `Product Quantization ADC Insight:
- Distance table is precalculated once per query for each sub-vector codebook.
- 1536-dim float32 (6,144 bytes) is compressed down to 64 bytes of codebook centroid indices!
- ADC avoids querying uncompressed vectors during graph traversal.`,
    keyTakeaways: [
      'Vector Quantization decomposes high-dimensional vector spaces into low-dimensional orthogonal subspaces.',
      'Product Quantizers (PQ) train Voronoi centroids per subspace, enabling fast lookup via Asymmetric Distance Computation (ADC).',
      'Residual Quantization (RQ) iteratively quantizes residual errors, delivering higher recall at sub-millisecond query latencies.',
      'Inverted File with Product Quantization (IVF-PQ) prunes 95% of candidates before codebook distance summation.',
    ],
    markdownContent: `### Vector Quantization & Product Quantization (PQ)

In high-throughput enterprise RAG pipelines, storing millions of uncompressed 1536-dimensional floating-point vectors in RAM consumes tens of gigabytes of expensive memory and incurs massive memory-bandwidth bottlenecks during similarity computation.

\`\`\`
   [1536-dim Vector]
          │
   ┌──────┼──────┬──────┐
   ▼      ▼      ▼      ▼
 [Sub-1] [Sub-2] [Sub-3] [Sub-4] ... [Sub-m] (m=64 subspaces of dim 24)
   │      │      │      │
   ▼      ▼      ▼      ▼
 [Idx 4] [Idx 92] [Idx 18] [Idx 201]  --> 64 bytes instead of 6,144 bytes!
\`\`\`

### Asymmetric Distance Computation (ADC)

When a query arrives, it remains uncompressed in high-precision float32. The query is partitioned into $m$ subvectors, and Euclidean distances to all $k$ centroids in each codebook are precomputed into a compact lookup table of size $m \times k$.

During index scanning, calculating the distance between the query and any stored document requires only $m$ table lookups and additions, completely eliminating vector-vector multiplications!`,
    codeSnippet: {
      language: 'python',
      description: 'Asymmetric Distance Computation (ADC) Table Precomputation',
      code: `import numpy as np

def precompute_adc_table(query_vector: np.ndarray, codebooks: np.ndarray) -> np.ndarray:
    """
    query_vector: (D,) float32
    codebooks: (M, K, D_sub) centroid codebooks
    Returns: (M, K) lookup table of squared distances
    """
    M, K, D_sub = codebooks.shape
    query_subvectors = query_vector.reshape(M, D_sub)
    
    # Compute squared Euclidean distance between each query subvector and all K centroids
    adc_table = np.zeros((M, K), dtype=np.float32)
    for m in range(M):
        diff = codebooks[m] - query_subvectors[m] # (K, D_sub)
        adc_table[m] = np.sum(diff ** 2, axis=1)
        
    return adc_table`,
    },
    quiz: [
      {
        question: 'What is the primary operational advantage of Asymmetric Distance Computation (ADC) in Product Quantization?',
        options: [
          'It forces both query and database vectors to be quantized to binary bits.',
          'The query vector remains unquantized while database vectors use precomputed codebook lookups.',
          'It eliminates the need for Voronoi clustering centroids entirely.',
          'It doubles vector dimensions to enhance cosine precision.',
        ],
        correctIndex: 1,
        explanation: 'In ADC, the incoming query vector is kept uncompressed in float32, and distances to pre-quantized database codes are evaluated via fast table additions.',
      },
      {
        question: 'How much memory reduction does a 64-subspace Product Quantizer achieve over 1536-dim float32 vectors?',
        options: [
          'Approximately 2x reduction.',
          'Approximately 10x reduction.',
          'Approximately 96x reduction (6144 bytes down to 64 bytes).',
          'Zero reduction (PQ only improves speed, not memory).',
        ],
        correctIndex: 2,
        explanation: '1536 dims * 4 bytes = 6,144 bytes per vector. A 64-byte codebook index reduces this to 64 bytes, a 96x memory compaction.',
      },
    ],
  },

  'lesson-speculative': {
    id: 'lesson-speculative',
    courseId: 'ai-pm-llm',
    title: 'Speculative Decoding & KV Cache Paging',
    moduleTitle: 'Module 02 • Fast Inference Engines & vLLM',
    duration: '40:15',
    completed: true,
    videoUrl: 'https://www.youtube.com/watch?v=5ZlavKF_98U',
    lead: 'Explore vLLM PagedAttention virtual memory block allocation and draft-model speculative token verification to break autoregressive inference bottlenecks.',
    notes: `PagedAttention & Speculative Decoding Notes:
- Standard KV caching wastes 60-80% memory due to internal fragmentation and pre-allocated max sequence lengths.
- PagedAttention manages KV tensors in non-contiguous physical memory blocks like OS virtual memory.
- Speculative Decoding: Draft model (e.g. 1B) emits K tokens in parallel; Target model (70B) verifies in 1 forward pass!`,
    keyTakeaways: [
      'Autoregressive generation is strictly memory-bandwidth bound: each generated token requires reading all weights into SRAM.',
      'PagedAttention eliminates memory fragmentation by storing KV cache tensors in fixed-size non-contiguous memory blocks.',
      'Speculative Decoding pairs an efficient draft model with a large target model to verify multiple tokens in a single parallel forward pass.',
      'Acceptance rate alpha determines effective speedup: higher draft model alignment maximizes tokens verified per forward pass.',
    ],
    markdownContent: `### PagedAttention & Virtual Memory Management

Standard LLM inference engines allocate contiguous GPU memory buffers for each request based on the maximum context length (e.g., 8,192 tokens). Because actual user prompts and generations vary widely, over 60% of GPU VRAM is wasted as internal and reservation fragmentation.

\`\`\`
   [Logical KV Blocks]
   Block 0: [Token 0 - 15] ──┐
   Block 1: [Token 16 - 31] ─┼──►  [Block Table]  ──► [Physical GPU Pages (Scattered)]
   Block 2: [Token 32 - 47] ─┘      Virtual -> Phys     Frame 42, Frame 108, Frame 15
\`\`\`

### Speculative Decoding Pipeline

1. **Draft Phase:** A small, fast draft model (e.g., Llama-3-8B) generates $\gamma$ speculative tokens sequentially in low latency.
2. **Verification Phase:** The large target model (e.g., Llama-3-70B) runs a single batched forward pass evaluating all $\gamma + 1$ token probabilities concurrently.
3. **Acceptance:** Tokens matching the target distribution are accepted; the first rejected token is resampled from the target model's corrected distribution.`,
    codeSnippet: {
      language: 'python',
      description: 'Speculative Token Verification Step',
      code: `def verify_speculative_tokens(draft_tokens, target_probs, draft_probs):
    """
    Accepts/rejects tokens based on target-to-draft probability ratios.
    """
    accepted = []
    for t, p_target, p_draft in zip(draft_tokens, target_probs, draft_probs):
        r = np.random.uniform(0, 1)
        if r <= min(1.0, p_target[t] / max(1e-6, p_draft[t])):
            accepted.append(t)
        else:
            # Resample corrected token
            resampled = sample_from_distribution(np.maximum(0, p_target - p_draft))
            accepted.append(resampled)
            break
    return accepted`,
    },
    quiz: [
      {
        question: 'Why does standard autoregressive LLM decoding suffer from memory-bandwidth bottlenecks?',
        options: [
          'Each generated token requires streaming every model weight from HBM to compute cores.',
          'Key-Value cache tensors can only be computed using CPU cores.',
          'Transformers do not support matrix multiplication.',
          'Quantized models cannot generate tokens sequentially.',
        ],
        correctIndex: 0,
        explanation: 'Because generating 1 token performs a forward pass with batch=1, arithmetic intensity is extremely low (~1 FLOP/byte), bound by GPU memory bandwidth.',
      },
      {
        question: 'How does PagedAttention eliminate memory fragmentation in GPU VRAM?',
        options: [
          'By truncating user prompts to 512 tokens.',
          'By splitting KV cache tensors into fixed-size virtual memory blocks allocated dynamically in non-contiguous memory.',
          'By disabling the Key-Value cache entirely during generation.',
          'By compressing weights into 1-bit integers.',
        ],
        correctIndex: 1,
        explanation: 'PagedAttention applies OS-style virtual memory paging: KV tensors are divided into blocks of 16 tokens and allocated dynamically as tokens arrive.',
      },
    ],
  },

  'lesson-hybrid-search': {
    id: 'lesson-hybrid-search',
    courseId: 'ai-pm-llm',
    title: 'Hybrid Search Architecture: Blending Keyword Precision with Semantic Context',
    moduleTitle: 'Module 03 • Advanced Context Compression & Quantization',
    duration: '24:18',
    completed: false,
    videoUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    lead: 'Master the integration of lexical inverted indexes (BM25) with dense vector representations (HNSW) to overcome semantic blind spots at enterprise scale.',
    notes: `Key insight: RRF Score(d) = sum(1 / (k + rank)). k=60 prevents top-1 bias.
Tantivy full-text search handles alphanumeric SKUs, while Milvus HNSW handles semantic intent.`,
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
| **Indexing Memory Overhead** | Low (Disk-backed inverted index) | High (Vector graphs in RAM) | Moderate |`,
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
    return ranked_results`,
    },
    quiz: [
      {
        question: 'Why does Reciprocal Rank Fusion (RRF) avoid calibration bugs common in linear score combination?',
        options: [
          'It normalizes dense cosine distances using z-scores on every single query.',
          'It operates purely on relative positional ranks rather than non-comparable absolute raw similarity scores.',
          'It converts all queries into Boolean search terms.',
          'It trains an auxiliary neural network to balance weights.',
        ],
        correctIndex: 1,
        explanation: 'BM25 produces unbounded positive floats while cosine similarity yields [-1, 1]. RRF discards raw score magnitudes and combines candidate documents by their integer rank position.',
      },
      {
        question: 'In the standard RRF formula Score(d) = Σ [1 / (k + r(d))], what is the role of smoothing constant k (typically 60)?',
        options: [
          'It guarantees the pipeline never returns more than 60 documents.',
          'It mitigates excessive sensitivity to top-ranked candidates, preventing an outlier #1 rank in one list from dominating overall scores.',
          'It sets the maximum latency budget to 60 milliseconds.',
          'It compresses the candidate vector into 60 dimensions.',
        ],
        correctIndex: 1,
        explanation: 'A non-zero k dampens the hyperbolic drop between rank 1 and rank 2, ensuring consensus across multiple searchers out-ranks a fluke solitary #1 result.',
      },
    ],
  },

  'lesson-cross-encoder': {
    id: 'lesson-cross-encoder',
    courseId: 'ai-pm-llm',
    title: 'Cross-Encoder Distillation & FlashRank',
    moduleTitle: 'Module 04 • Multi-Stage Reranking & Edge Deployment',
    duration: '45:30',
    completed: false,
    videoUrl: 'https://www.youtube.com/watch?v=YwN0h_N3QyM',
    lead: 'Implement two-stage candidate retrieval pipelines with transformer-based cross-attention reranking and sub-15ms edge inference.',
    notes: `Two-stage funnel:
10,000,000 docs -> (HNSW/BM25) -> Top 100 Candidates -> (FlashRank MiniLM Cross-Encoder) -> Top 5 LLM Context Window.
Cross-encoders attend over Query + Passage tokens jointly, catching subtle negation and semantic nuance that Bi-encoders miss.`,
    keyTakeaways: [
      'Bi-encoders generate vector embeddings independently: Similarity = cos(u, v), lacking cross-attention between query and passage tokens.',
      'Cross-encoders process (Query, Passage) pairs jointly through all transformer self-attention layers, yielding significantly higher precision.',
      'Two-stage retrieval pairs fast Bi-encoders/BM25 for candidate generation with distilled Cross-Encoders for precision reranking.',
      'FlashRank utilizes lightweight quantized ONNX models to achieve sub-15ms CPU inference without GPU dependencies.',
    ],
    markdownContent: `### Bi-Encoder vs. Cross-Encoder Mechanics

A Bi-Encoder computes $u = f(\\text{query})$ and $v = f(\\text{document})$ in isolation. Because neither vector interacts with the other during embedding calculation, subtle relationships (negations, qualifier clauses, entity constraints) are often lost.

\`\`\`
[Bi-Encoder: Independent Embeddings]
Query ──► Transformer ──► [Vector u]
                                    ├──► Dot Product (Fast, 1ms)
Doc   ──► Transformer ──► [Vector v]

[Cross-Encoder: Full Cross-Attention]
(Query [SEP] Document) ──► Transformer ──► Relevance Score (Accurate, 15ms)
\`\`\`

### Two-Stage Retrieval Architecture

By cascading retrieval stages, we get the sub-millisecond scalability of approximate nearest neighbors alongside the deep contextual comprehension of cross-encoders:

1. **Stage 1 (High Recall):** HNSW Vector search + BM25 retrieve Top 100 documents in ~8ms.
2. **Stage 2 (High Precision):** A quantized MiniLM Cross-Encoder scores all 100 (Query, Doc) pairs in parallel in ~12ms.
3. **Stage 3 (LLM Context):** The Top 5 highest scoring passages are injected into the LLM prompt.`,
    codeSnippet: {
      language: 'python',
      description: 'FlashRank Sub-15ms CPU Reranking Example',
      code: `from flashrank import Ranker, RerankRequest

ranker = Ranker(model_name="ms-marco-MiniLM-L-12-v2", cache_dir="/tmp/opt")

def rerank_passages(query: str, candidates: list[dict]) -> list[dict]:
    rerank_request = RerankRequest(query=query, passages=candidates)
    results = ranker.rerank(rerank_request)
    return results[:5] # Return top-5 high confidence documents`,
    },
    quiz: [
      {
        question: 'What is the primary architectural difference between a Bi-Encoder and a Cross-Encoder?',
        options: [
          'Bi-Encoders run on GPU; Cross-Encoders run only on CPU.',
          'Bi-Encoders encode query and passage independently; Cross-Encoders pass them jointly into transformer self-attention.',
          'Cross-Encoders cannot compute relevance scores.',
          'Bi-Encoders produce floating point numbers while Cross-Encoders produce integers.',
        ],
        correctIndex: 1,
        explanation: 'Cross-Encoders allow all query tokens and document tokens to attend to each other simultaneously, achieving superior relevance scoring at higher latency.',
      },
      {
        question: 'Why is a two-stage retrieval pipeline preferred over running a Cross-Encoder directly on the entire document database?',
        options: [
          'Cross-Encoders are illegal in commercial applications.',
          'Evaluating millions of documents with cross-attention would take minutes per query; Stage 1 fast-filters to the Top-100 in milliseconds.',
          'Bi-Encoders have higher accuracy than Cross-Encoders.',
          'Two-stage pipelines require no memory.',
        ],
        correctIndex: 1,
        explanation: 'Cross-encoders cannot use precomputed index structures. Scoring 1,000,000 documents sequentially is computationally prohibitive in real-time search.',
      },
    ],
  },

  'lesson-multi-tenant': {
    id: 'lesson-multi-tenant',
    courseId: 'ai-pm-llm',
    title: 'Multi-Tenant ACL Partitioning in Milvus',
    moduleTitle: 'Module 05 • Enterprise Security & RBAC Isolation',
    duration: '50:10',
    completed: false,
    videoUrl: 'https://www.youtube.com/watch?v=0bT_jVd38oM',
    lead: 'Design zero-leakage enterprise multi-tenant vector partitions using physical shard keys and RBAC metadata security filters.',
    notes: `Enterprise Security & Multi-Tenancy Invariants:
- Partition key physical sharding prevents index scan contamination and provides strict hardware resource isolation.
- Pre-filtering vs Post-filtering: Post-filtering risks empty result sets if Top-K belong to foreign tenants.
- Always enforce partition routing in coordinator before query dispatch!`,
    keyTakeaways: [
      'Multi-tenancy in vector databases can be implemented via partition keys, separate collections, or metadata filtering.',
      'Partition Key routing directs vector inserts and queries to dedicated physical segments, guaranteeing zero data leakage.',
      'Pre-filtering enforces security predicates during graph beam traversal, whereas post-filtering risks severe recall degradation.',
      'Role-Based Access Control (RBAC) tokens must be cryptographically verified at the retrieval gateway prior to vector index dispatch.',
    ],
    markdownContent: `### Enterprise Multi-Tenancy Architecture

In B2B SaaS applications, multiple enterprise customers share common infrastructure while demanding strict SOC-2, HIPAA, and GDPR isolation boundaries.

\`\`\`
   [Enterprise Query + JWT Auth]
               │
               ▼
   [API Gateway / Auth Interceptor]
   (Extracts: tenant_id="org_enterprise_42")
               │
               ▼
   [Milvus Coordinator / Proxy]
   (Routes to Partition Key: partition_42)
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[Physical Segment A]    [Physical Segment B]
(Tenant 42 ONLY)        (Tenant 99 - UNTOUCHED)
\`\`\`

### Pre-filtering vs. Post-filtering Security Risks

- **Post-filtering Flaw:** If the vector engine retrieves Top-50 global nearest neighbors and filters out non-tenant documents afterward, an attacker might cause empty results or deduce tenant distribution profiles.
- **Pre-filtering / Partition Sharding:** By constraining the HNSW search exclusively within the tenant's physical segment partition, traversal latency is minimized and cross-tenant data contamination is physically impossible.`,
    codeSnippet: {
      language: 'python',
      description: 'Milvus Partition Key Collection Definition',
      code: `from pymilvus import CollectionSchema, FieldSchema, DataType, Collection

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64, is_partition_key=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=1536),
    FieldSchema(name="doc_acl", dtype=DataType.ARRAY, element_type=DataType.VARCHAR, max_capacity=32)
]

schema = CollectionSchema(fields=fields, description="Enterprise multi-tenant knowledge store")
collection = Collection(name="enterprise_vault", schema=schema)`,
    },
    quiz: [
      {
        question: 'What is the primary security flaw of relying purely on post-query metadata filtering for multi-tenant isolation?',
        options: [
          'Post-filtering can exhaust Top-K candidates if top vectors belong to other tenants, causing empty responses or subtle data leakage.',
          'Post-filtering is not supported by SQL databases.',
          'Post-filtering crashes the Milvus cluster.',
          'Post-filtering requires unencrypted vector storage.',
        ],
        correctIndex: 0,
        explanation: 'If another tenant dominates the top nearest neighbors, post-filtering removes them all, leaving the user with zero results or timing-based data disclosure.',
      },
      {
        question: 'How does partition key sharding in Milvus improve retrieval speed for large enterprise tenants?',
        options: [
          'It disables indexing to save CPU cycles.',
          'It restricts HNSW graph traversal solely to the specific tenant physical segment partitions.',
          'It replicates all tenant vectors across every compute node.',
          'It automatically converts all queries into lexical searches.',
        ],
        correctIndex: 1,
        explanation: 'Partition keys route queries directly to the specific shard partitions belonging to that tenant, eliminating wasteful scans over millions of irrelevant vectors.',
      },
    ],
  },
};

export function getLessonById(idOrIndex: string | number): EnterpriseLesson {
  const strId = String(idOrIndex).toLowerCase().trim();

  if (ENTERPRISE_RAG_LESSONS[strId]) {
    return ENTERPRISE_RAG_LESSONS[strId];
  }

  // Lookup by index or partial name
  if (strId === '1' || strId === '01' || strId.includes('quantization') || strId.includes('vq')) {
    return ENTERPRISE_RAG_LESSONS['lesson-vq'];
  }
  if (strId === '2' || strId === '02' || strId.includes('speculative') || strId.includes('paging')) {
    return ENTERPRISE_RAG_LESSONS['lesson-speculative'];
  }
  if (strId === '3' || strId === '03' || strId.includes('hybrid') || strId.includes('rrf') || strId.includes('bm25')) {
    return ENTERPRISE_RAG_LESSONS['lesson-hybrid-search'];
  }
  if (strId === '4' || strId === '04' || strId.includes('cross-encoder') || strId.includes('flashrank')) {
    return ENTERPRISE_RAG_LESSONS['lesson-cross-encoder'];
  }
  if (strId === '5' || strId === '05' || strId.includes('multi-tenant') || strId.includes('milvus') || strId.includes('acl')) {
    return ENTERPRISE_RAG_LESSONS['lesson-multi-tenant'];
  }

  // Default fallback
  return ENTERPRISE_RAG_LESSONS['lesson-hybrid-search'];
}
