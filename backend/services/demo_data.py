import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.models import (
    Course, Module, Topic, Subtopic, Note, NoteVersion, Resource, ResourceChunk,
    Comment, FlashcardDeck, Flashcard, FlashcardReview, QuestionBank, Question,
    QuizAttempt, ActiveLearningItem, StudySession, ActivityEvent, Task,
    CalendarEvent, Goal, JournalEntry, Notification
)

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def clean_demo_data(db: Session) -> Dict[str, int]:
    """
    Deletes ONLY data marked with is_demo=True, ensuring personal learner data is never lost.
    """
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
    """
    Seeds comprehensive, interconnected demo data showcasing all platform features.
    """
    # Check if demo data already exists
    existing = db.query(Course).filter(Course.is_demo == True).first()
    if existing:
        return False

    now = utc_now()
    yesterday = now - timedelta(days=1)
    two_days_ago = now - timedelta(days=2)

    # 1. Courses
    c1 = Course(
        name="Distributed Systems & Cloud Computing",
        description="Comprehensive study of distributed architectures, consensus protocols, replication, fault tolerance, and scalable cloud systems.",
        category="Computer Science",
        instructor="Prof. Martin Kleppmann & Leslie Lamport",
        start_date="2026-09-01",
        target_completion_date="2026-12-15",
        exam_date="2026-12-20",
        priority="high",
        cover_color="#4f46e5",
        tags=json.dumps(["systems", "distributed", "algorithms", "cloud"]),
        syllabus="Module 1: Foundations & Time\nModule 2: Consensus & Raft\nModule 3: Storage & Replication",
        learning_goals=json.dumps(["Master Raft consensus protocol", "Understand CAP Theorem trade-offs", "Build resilient microservices"]),
        status="active",
        is_demo=True
    )
    db.add(c1)
    db.flush()

    # Modules for Course 1
    m1 = Module(course_id=c1.id, title="Unit 1: Time, Clocks & Ordering", description="Logical clocks, Vector clocks, and message causality", order_index=1)
    m2 = Module(course_id=c1.id, title="Unit 2: Consensus & Fault Tolerance", description="State machine replication, 2PC, Paxos, and Raft", order_index=2)
    db.add_all([m1, m2])
    db.flush()

    # Topics
    t1 = Topic(
        module_id=m1.id, course_id=c1.id,
        title="Lamport Timestamps & Vector Clocks",
        description="Establishing partial and total ordering in asynchronous distributed networks without global synchronized clocks.",
        learning_objectives=json.dumps(["Differentiate physical vs logical time", "Calculate vector clock increments", "Define happens-before relation"]),
        estimated_minutes=45, status="completed", understanding_level="confident",
        is_optional=False, order_index=1,
        last_studied_at=yesterday, next_revision_at=now + timedelta(days=7), revision_interval_days=7, revision_count=2
    )
    t2 = Topic(
        module_id=m2.id, course_id=c1.id,
        title="Raft Consensus Algorithm",
        description="Understand leader election, log replication, safety invariants, and joint consensus cluster membership changes.",
        learning_objectives=json.dumps(["Understand randomized election timers", "Trace append entries RPC", "Explain log matching property"]),
        estimated_minutes=60, status="in_progress", understanding_level="comfortable",
        is_optional=False, order_index=1,
        last_studied_at=now, next_revision_at=now + timedelta(days=2), revision_interval_days=2, revision_count=1
    )
    t3 = Topic(
        module_id=m2.id, course_id=c1.id,
        title="Byzantine Fault Tolerance (BFT)",
        description="Handling arbitrary, malicious, or corrupt nodes in peer-to-peer and blockchain consensus.",
        learning_objectives=json.dumps(["Calculate 3f + 1 node requirement", "PBFT phases: pre-prepare, prepare, commit"]),
        estimated_minutes=50, status="not_started", understanding_level="unfamiliar",
        is_optional=False, order_index=2
    )
    db.add_all([t1, t2, t3])
    db.flush()

    # Subtopics
    st1 = Subtopic(topic_id=t2.id, title="Leader Election & Randomized Timers", order_index=1, is_completed=True)
    st2 = Subtopic(topic_id=t2.id, title="Log Replication & Commit Index", order_index=2, is_completed=True)
    st3 = Subtopic(topic_id=t2.id, title="Safety & Election Restriction", order_index=3, is_completed=False)
    db.add_all([st1, st2, st3])

    # 2. Resources (PDF and Video with transcripts)
    r_pdf = Resource(
        course_id=c1.id, topic_id=t2.id,
        title="In Search of an Understandable Consensus Algorithm (Raft Paper)",
        type="pdf", url="https://raft.github.io/raft.pdf",
        description="Original Stanford paper by Diego Ongaro and John Ousterhout detailing Raft consensus.",
        author="Diego Ongaro, John Ousterhout",
        tags=json.dumps(["paper", "consensus", "raft"]),
        estimated_duration_mins=40, status="in_progress", personal_rating=5, is_favorite=True,
        is_indexed=True, indexing_status="indexed",
        extracted_text="Raft is a consensus algorithm for managing a replicated log. It produces a result equivalent to (multi-)Paxos...",
        is_demo=True
    )
    db.add(r_pdf)
    db.flush()

    # Chunks with page numbers for RAG grounding
    rc1 = ResourceChunk(
        resource_id=r_pdf.id, chunk_index=0, page_number=1,
        text_content="Raft decomposes consensus into three independent subproblems: Leader election, Log replication, and Safety. A leader is first elected, which takes complete responsibility for managing log replication."
    )
    rc2 = ResourceChunk(
        resource_id=r_pdf.id, chunk_index=1, page_number=5,
        text_content="Leader Election in Raft uses randomized election timeouts (typically 150-300ms) to ensure split votes are rare and resolved quickly. If a follower receives no communication over its election timeout, it becomes a candidate and increments currentTerm."
    )
    rc3 = ResourceChunk(
        resource_id=r_pdf.id, chunk_index=2, page_number=8,
        text_content="Safety: If a leader has committed a log entry at a given index, no other server will ever apply a different log entry for the same index. The election restriction guarantees that a candidate must contain all committed entries to win an election."
    )
    db.add_all([rc1, rc2, rc3])

    # Video resource with timestamped transcript
    r_video = Resource(
        course_id=c1.id, topic_id=t2.id,
        title="Visualizing Raft Consensus in 10 Minutes",
        type="video", url="https://www.youtube.com/watch?v=vYp4LYbnnW8",
        description="Intuitive visual walkthrough of Raft leader election, heartbeats, and client interactions.",
        author="Secret Knowledge Systems",
        tags=json.dumps(["video", "raft", "animation"]),
        estimated_duration_mins=12, status="in_progress", personal_rating=5,
        resume_position_secs=184.0, is_indexed=True, indexing_status="indexed",
        is_demo=True
    )
    db.add(r_video)
    db.flush()

    rc_v1 = ResourceChunk(
        resource_id=r_video.id, chunk_index=0, timestamp_secs=45.0,
        text_content="[00:45] Every node starts in the Follower state. Followers listen for heartbeats from a leader. If heartbeats stop arriving, election timeout triggers."
    )
    rc_v2 = ResourceChunk(
        resource_id=r_video.id, chunk_index=1, timestamp_secs=180.0,
        text_content="[03:00] During Log Replication, the leader receives a client write, appends it locally as an uncommitted entry, then broadcasts AppendEntries RPCs to all followers."
    )
    db.add_all([rc_v1, rc_v2])

    # 3. Notes
    n1 = Note(
        course_id=c1.id, topic_id=t2.id,
        title="Core Invariants of Raft Consensus",
        content="""# Raft Core Notes

## 1. Node Roles
At any time, each node is in one of three states:
- **Leader**: Handles all client requests, replicates log entries.
- **Follower**: Passive, responds to incoming RPCs from leaders and candidates.
- **Candidate**: Used to elect a new leader.

## 2. Terms
Time is divided into arbitrary terms, numbered with consecutive integers.
Terms act as a logical clock in Raft.

```python
# Term validation
if rpc.term > current_term:
    current_term = rpc.term
    state = State.FOLLOWER
```

> [!NOTE]
> Randomized election timeouts prevent split votes when multiple candidates start elections simultaneously.
""",
        summary="Summary of Raft states (Leader, Follower, Candidate), terms as logical clocks, and the randomized timer mechanism.",
        tags=json.dumps(["raft", "consensus", "cheat-sheet"]),
        is_pinned=True, is_favorite=True, needs_revision=False,
        template_type="lecture", is_demo=True
    )
    db.add(n1)
    db.flush()

    nv1 = NoteVersion(
        note_id=n1.id, version_number=1,
        title=n1.title, content=n1.content, summary=n1.summary
    )
    db.add(nv1)

    # 4. Doubt Inbox comment
    c_doubt = Comment(
        target_type="topic", target_id=t2.id, course_id=c1.id, topic_id=t2.id,
        text="Why does Raft require candidate log comparison in RequestVote rather than just term comparison?",
        comment_type="doubt", priority="high", is_resolved=False,
        is_pinned=True, is_demo=True
    )
    db.add(c_doubt)

    # 5. Flashcards
    deck = FlashcardDeck(
        course_id=c1.id, topic_id=t2.id,
        name="Raft Consensus & Distributed Systems",
        description="Spaced repetition deck for consensus, RPCs, and safety proofs",
        tags=json.dumps(["consensus", "raft", "exams"]),
        is_demo=True
    )
    db.add(deck)
    db.flush()

    fc1 = Flashcard(
        deck_id=deck.id, course_id=c1.id, topic_id=t2.id,
        card_type="basic",
        front="What are the three possible states of a Raft node?",
        back="Leader, Follower, and Candidate.",
        explanation="Nodes start as Followers; transition to Candidate if election timeout elapses; become Leader upon majority vote.",
        source_ref="Raft Paper Page 4", tags=json.dumps(["basics", "raft"]),
        reps=2, lapses=0, stability=2.6, state="review", interval_days=4,
        last_review_at=yesterday, next_review_at=now + timedelta(days=3),
        is_demo=True
    )
    fc2 = Flashcard(
        deck_id=deck.id, course_id=c1.id, topic_id=t2.id,
        card_type="cloze",
        front="Raft uses {{c1::randomized election timeouts}} (typically 150-300ms) to prevent {{c2::split votes}}.",
        back="randomized election timeouts / split votes",
        explanation="Randomization ensures that one candidate usually timeouts first and collects votes before others wake up.",
        source_ref="Raft Paper Page 5", tags=json.dumps(["cloze", "timers"]),
        reps=1, lapses=0, stability=2.5, state="review", interval_days=1,
        last_review_at=yesterday, next_review_at=now, # Due today!
        is_demo=True
    )
    fc3 = Flashcard(
        deck_id=deck.id, course_id=c1.id, topic_id=t2.id,
        card_type="reversed",
        front="Term in Raft",
        back="An arbitrary period of time numbered with consecutive integers that acts as a logical clock.",
        explanation="Terms allow servers to detect obsolete information such as stale leaders.",
        tags=json.dumps(["definitions"]),
        reps=0, lapses=0, stability=2.5, state="new", interval_days=0,
        next_review_at=now,
        is_demo=True
    )
    db.add_all([fc1, fc2, fc3])

    # 6. Question Bank & Questions
    qbank = QuestionBank(
        course_id=c1.id, topic_id=t2.id,
        name="Consensus & Raft Mastery Bank",
        description="Comprehensive questions testing objective recall and analytical understanding",
        is_demo=True
    )
    db.add(qbank)
    db.flush()

    q1 = Question(
        bank_id=qbank.id, course_id=c1.id, topic_id=t2.id,
        question_type="mcq",
        question_text="What happens when a Raft follower receives no heartbeat before its election timeout expires?",
        options=json.dumps([
            "It drops from the cluster permanently",
            "It increments currentTerm and transitions to Candidate",
            "It immediately declares itself Leader",
            "It triggers a crash-stop event"
        ]),
        correct_answer=json.dumps("It increments currentTerm and transitions to Candidate"),
        explanation="Upon election timeout, a follower increments its term, transitions to candidate state, votes for itself, and sends RequestVote RPCs.",
        source_ref="Raft Paper Section 5.2",
        difficulty="easy",
        is_demo=True
    )
    q2 = Question(
        bank_id=qbank.id, course_id=c1.id, topic_id=t2.id,
        question_type="true_false",
        question_text="In Raft, a leader can commit an entry from a previous term directly by counting replicas.",
        options=json.dumps(["True", "False"]),
        correct_answer=json.dumps("False"),
        explanation="Raft never commits log entries from previous terms by counting replicas; it must commit an entry from its current term, which indirectly commits prior entries (Section 5.4.2).",
        source_ref="Raft Paper Section 5.4.2",
        difficulty="hard",
        is_demo=True
    )
    q3 = Question(
        bank_id=qbank.id, course_id=c1.id, topic_id=t2.id,
        question_type="numerical",
        question_text="In a crash-tolerant Paxos or Raft cluster designed to survive f node failures, how many total nodes 2f + 1 are required when f = 2?",
        correct_answer=json.dumps(5),
        numerical_tolerance=0.0,
        numerical_unit="nodes",
        explanation="A majority quorum requires 2f + 1 nodes. For f = 2, 2*(2) + 1 = 5 nodes.",
        difficulty="medium",
        is_demo=True
    )
    db.add_all([q1, q2, q3])

    # 7. Completed Quiz Attempt
    attempt = QuizAttempt(
        bank_id=qbank.id, course_id=c1.id, topic_id=t2.id,
        quiz_title="Raft Foundations Practice Quiz",
        mode="practice",
        score=2.0, max_score=3.0, percentage=66.7,
        time_spent_secs=180,
        questions_snapshot=json.dumps([
            {"id": "q1", "text": "What happens when a follower timeouts?", "type": "mcq"},
            {"id": "q2", "text": "Can a leader commit prior term entries by replicas alone?", "type": "true_false"}
        ]),
        responses=json.dumps({
            "q1": {"user_answer": "It increments currentTerm and transitions to Candidate", "is_correct": True},
            "q2": {"user_answer": "True", "is_correct": False, "correct_answer": "False"}
        }),
        completed_at=yesterday,
        is_demo=True
    )
    db.add(attempt)

    # 8. Active Learning Items
    teach_back = ActiveLearningItem(
        item_type="teach_back", course_id=c1.id, topic_id=t2.id,
        title="Teach-back: Explain Split-Brain Prevention in Raft",
        content=json.dumps({
            "prompt": "Explain how quorum majorities and terms prevent two leaders from coexisting in Raft.",
            "learner_explanation": "Each node only votes once per term. Since any two quorums must overlap by at least one server, two candidates cannot both achieve a majority in the same term.",
            "feedback": "Excellent explanation. You accurately highlighted quorum intersection and the single-vote invariant."
        }),
        reflection_notes="Clear understanding of quorum arithmetic.",
        mastery_level="mastered",
        is_demo=True
    )
    formula_item = ActiveLearningItem(
        item_type="formula", course_id=c1.id, topic_id=t1.id,
        title="Quorum Intersection Formula",
        content=json.dumps({
            "formula_latex": "Q_r + Q_w > N",
            "variables": [
                {"name": "N", "description": "Total replicas", "value": "5"},
                {"name": "Q_r", "description": "Read quorum size", "value": "3"},
                {"name": "Q_w", "description": "Write quorum size", "value": "3"}
            ],
            "application": "Ensures that every read quorum intersects with the most recent write quorum by at least 1 node."
        }),
        mastery_level="mastered",
        is_demo=True
    )
    concept_comp = ActiveLearningItem(
        item_type="concept_comparison", course_id=c1.id, topic_id=t2.id,
        title="Paxos vs Raft Comparison",
        content=json.dumps({
            "concept_a": "Multi-Paxos",
            "concept_b": "Raft",
            "dimensions": [
                {"aspect": "Leader Role", "a": "Weak leader (proposers can overlap)", "b": "Strong leader (all writes flow strictly through leader)"},
                {"aspect": "Log Gaps", "a": "Allows out-of-order log entries and holes", "b": "Strict sequential log without gaps"},
                {"aspect": "Understandability", "a": "Notoriously opaque", "b": "Designed explicitly for pedagogical understandability"}
            ]
        }),
        mastery_level="learning",
        is_demo=True
    )
    db.add_all([teach_back, formula_item, concept_comp])

    # 9. Study Sessions
    ss1 = StudySession(
        course_id=c1.id, topic_id=t2.id,
        goal="Read Raft paper Section 5 and take notes on election safety",
        session_type="focus", planned_duration_mins=45, actual_duration_secs=2700, break_duration_secs=300,
        start_time=yesterday - timedelta(hours=2), end_time=yesterday - timedelta(hours=1, minutes=15),
        status="completed",
        reflection_completed="Read pages 1 to 8 of Raft paper, created summary notes and 3 flashcards.",
        reflection_unclear="Log compaction via snapshotting still needs review.",
        reflection_confidence="high", reflection_next="Implement a toy Raft state machine in Python.",
        session_notes="Very productive session without distractions.",
        is_demo=True
    )
    ss2 = StudySession(
        course_id=c1.id, topic_id=t1.id,
        goal="Practice vector clock exercises",
        session_type="pomodoro", planned_duration_mins=25, actual_duration_secs=1500, break_duration_secs=300,
        start_time=two_days_ago - timedelta(hours=3), end_time=two_days_ago - timedelta(hours=2, minutes=30),
        status="completed",
        reflection_completed="Worked 4 partial ordering causality diagrams.",
        reflection_unclear="Concurrent causality representation.",
        reflection_confidence="medium", reflection_next="Review Lamport logical clock tick rules.",
        is_demo=True
    )
    db.add_all([ss1, ss2])

    # 10. Tasks & Assignments
    task1 = Task(
        course_id=c1.id, topic_id=t2.id,
        title="Implement Raft Election Simulator in Python",
        description="Code a 3-node simulation handling RPC timeouts, candidate votes, and leader heartbeats.",
        task_type="assignment", due_date=now + timedelta(days=5),
        priority="high", status="in_progress", estimated_minutes=120, actual_minutes=45,
        subtasks=json.dumps([
            {"id": "1", "title": "Setup Node class with state enums", "completed": True},
            {"id": "2", "title": "Implement randomized election timer", "completed": True},
            {"id": "3", "title": "Handle RequestVote RPC logic", "completed": False},
            {"id": "4", "title": "Test network partition scenarios", "completed": False}
        ]),
        instructions="Ensure nodes transition cleanly between Follower, Candidate, and Leader.",
        is_demo=True
    )
    task2 = Task(
        course_id=c1.id, topic_id=t1.id,
        title="Complete Vector Clock Practice Sheet",
        description="Solve textbook causality ordering problems.",
        task_type="study", due_date=now + timedelta(days=1),
        priority="medium", status="todo", estimated_minutes=30,
        subtasks=json.dumps([]),
        is_demo=True
    )
    db.add_all([task1, task2])

    # 11. Calendar Events
    cal1 = CalendarEvent(
        course_id=c1.id, topic_id=t2.id,
        title="Deep Work: Raft Coding & Edge Cases",
        event_type="session",
        start_time=now + timedelta(hours=2), end_time=now + timedelta(hours=3, minutes=30),
        is_all_day=False, reminder_mins_before=15, is_completed=False,
        is_demo=True
    )
    cal2 = CalendarEvent(
        course_id=c1.id,
        title="Distributed Systems Midterm Exam",
        event_type="exam",
        start_time=now + timedelta(days=14, hours=9), end_time=now + timedelta(days=14, hours=12),
        is_all_day=False, reminder_mins_before=60, is_completed=False,
        is_demo=True
    )
    db.add_all([cal1, cal2])

    # 12. Goals
    g1 = Goal(
        title="Study Distributed Systems for 6 hours this week",
        goal_type="hours", target_value=6.0, current_value=3.5, unit="hours",
        period="weekly", deadline=now + timedelta(days=4), course_id=c1.id,
        is_completed=False, is_demo=True
    )
    g2 = Goal(
        title="Review 15 Spaced Repetition Flashcards Daily",
        goal_type="flashcards", target_value=15.0, current_value=12.0, unit="cards",
        period="daily", deadline=now + timedelta(hours=6),
        is_completed=False, is_demo=True
    )
    db.add_all([g1, g2])

    # 13. Journal Entries
    j1 = JournalEntry(
        entry_date=yesterday.strftime("%Y-%m-%d"),
        entry_type="daily", course_id=c1.id, topic_id=t2.id,
        learned_text="Understood why candidate vote restrictions must check both term and last log index to guarantee the Leader Completeness property.",
        difficult_text="Dissecting Figure 8 from the Raft paper (why a leader cannot directly commit older term entries).",
        unclear_text="How joint consensus membership changes handle sudden follower disconnects.",
        helped_text="Visualizing animated Raft state transitions.",
        next_text="Draft python prototype for leader election.",
        mood_rating=4, is_demo=True
    )
    db.add(j1)

    # 14. Notifications
    notif1 = Notification(
        notification_type="revision",
        title="Revision Due Today",
        message="Flashcard deck 'Raft Consensus' has cards waiting for spaced repetition review.",
        link_url="/flashcards",
        is_read=False,
        scheduled_for=now
    )
    notif2 = Notification(
        notification_type="deadline",
        title="Assignment Deadline Approaching",
        message="Raft Election Simulator in Python is due in 5 days.",
        link_url="/tasks",
        is_read=False,
        scheduled_for=now
    )
    db.add_all([notif1, notif2])

    # 15. Activity Events for visits & streak
    ae_visit = ActivityEvent(
        event_type="platform_visit",
        session_visit_id="demo-session-1",
        timestamp=now - timedelta(hours=3)
    )
    ae_course = ActivityEvent(
        event_type="course_visit",
        target_type="course",
        target_id=c1.id,
        course_id=c1.id,
        timestamp=now - timedelta(hours=3)
    )
    db.add_all([ae_visit, ae_course])

    db.commit()
    return True
