import re
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models import Resource, ResourceChunk, Note

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into words."""
    if not text:
        return []
    words = re.findall(r'\b[a-zA-Z0-9_\u00C0-\u017F]+\b', text.lower())
    # remove short stop words
    stop_words = {"the", "a", "an", "in", "on", "of", "and", "or", "to", "for", "with", "is", "was", "are", "by", "this", "that", "it"}
    return [w for w in words if w not in stop_words and len(w) > 1]

def search_materials(
    db: Session,
    query: str,
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Search indexed resource chunks and notes for relevant passages.
    Returns ranked citations.
    """
    query_tokens = tokenize(query)
    if not query_tokens:
        return []

    results = []

    # 1. Search Resource Chunks
    chunk_query = db.query(ResourceChunk, Resource).join(Resource, ResourceChunk.resource_id == Resource.id)
    if resource_id:
        chunk_query = chunk_query.filter(Resource.id == resource_id)
    elif topic_id:
        chunk_query = chunk_query.filter(Resource.topic_id == topic_id)
    elif course_id:
        chunk_query = chunk_query.filter(Resource.course_id == course_id)

    chunks = chunk_query.limit(200).all()
    for chunk, res in chunks:
        chunk_tokens = tokenize(chunk.text_content)
        if not chunk_tokens:
            continue
        # Term overlap score
        matches = sum(1 for token in query_tokens if token in chunk_tokens)
        if matches > 0:
            score = matches / (math.sqrt(len(chunk_tokens)) + 1)
            # Find the best excerpt containing a matching term
            excerpt = chunk.text_content[:300] + ("..." if len(chunk.text_content) > 300 else "")
            results.append({
                "score": score,
                "source_type": "resource",
                "source_id": res.id,
                "title": res.title,
                "type": res.type,
                "page_number": chunk.page_number,
                "timestamp_secs": chunk.timestamp_secs,
                "quote": excerpt,
                "full_text": chunk.text_content
            })

    # 2. Search Notes
    note_query = db.query(Note).filter(Note.is_deleted == False)
    if topic_id:
        note_query = note_query.filter(Note.topic_id == topic_id)
    elif course_id:
        note_query = note_query.filter(Note.course_id == course_id)

    notes = note_query.limit(100).all()
    for note in notes:
        combined_text = f"{note.title}\n{note.summary}\n{note.content}"
        note_tokens = tokenize(combined_text)
        if not note_tokens:
            continue
        matches = sum(1 for token in query_tokens if token in note_tokens)
        if matches > 0:
            score = (matches * 1.2) / (math.sqrt(len(note_tokens)) + 1)
            results.append({
                "score": score,
                "source_type": "note",
                "source_id": note.id,
                "title": note.title,
                "type": "note",
                "page_number": None,
                "timestamp_secs": None,
                "quote": note.summary or (note.content[:250] + ("..." if len(note.content) > 250 else "")),
                "full_text": note.content
            })

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]
