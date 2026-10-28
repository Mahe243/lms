import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import get_db
from backend.models import Resource, ResourceChunk
from backend.schemas import ResourceCreate, ResourceUpdate, ResourceOut
from backend.services.text_processor import extract_pdf_pages, extract_text_file, parse_transcript_vtt_srt, chunk_text

router = APIRouter(prefix="/api/resources", tags=["Resources"])

def resource_to_dict(r: Resource) -> dict:
    return {
        "id": r.id,
        "course_id": r.course_id,
        "topic_id": r.topic_id,
        "title": r.title,
        "type": r.type,
        "url": r.url,
        "file_path": r.file_path,
        "description": r.description,
        "author": r.author,
        "tags": json.loads(r.tags) if r.tags else [],
        "estimated_duration_mins": r.estimated_duration_mins,
        "status": r.status,
        "personal_rating": r.personal_rating,
        "is_favorite": r.is_favorite,
        "last_opened_at": r.last_opened_at,
        "open_count": r.open_count,
        "is_indexed": r.is_indexed,
        "indexing_status": r.indexing_status,
        "resume_position_secs": r.resume_position_secs,
        "metadata_info": json.loads(r.metadata_info) if r.metadata_info else {},
        "is_deleted": r.is_deleted,
        "is_demo": r.is_demo,
        "created_at": r.created_at,
        "updated_at": r.updated_at
    }

@router.get("", response_model=List[ResourceOut])
def list_resources(
    course_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    res_type: Optional[str] = None,
    status: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Resource).filter(Resource.is_deleted == False)
    if course_id:
        query = query.filter(Resource.course_id == course_id)
    if topic_id:
        query = query.filter(Resource.topic_id == topic_id)
    if res_type:
        query = query.filter(Resource.type == res_type)
    if status:
        query = query.filter(Resource.status == status)
    if is_favorite is not None:
        query = query.filter(Resource.is_favorite == is_favorite)

    resources = query.order_by(Resource.is_favorite.desc(), Resource.created_at.desc()).all()
    return [resource_to_dict(r) for r in resources]

@router.post("/check-duplicate-url")
def check_duplicate_url(url: str, db: Session = Depends(get_db)):
    if not url:
        return {"exists": False}
    clean_url = url.strip().lower()
    existing = db.query(Resource).filter(
        Resource.is_deleted == False,
        Resource.url.ilike(clean_url)
    ).first()
    if existing:
        return {
            "exists": True,
            "resource": resource_to_dict(existing)
        }
    return {"exists": False}

@router.post("", response_model=ResourceOut)
def create_resource(data: ResourceCreate, db: Session = Depends(get_db)):
    res = Resource(
        course_id=data.course_id,
        topic_id=data.topic_id,
        title=data.title,
        type=data.type,
        url=data.url,
        description=data.description or "",
        author=data.author,
        tags=json.dumps(data.tags or []),
        estimated_duration_mins=data.estimated_duration_mins or 15,
        status=data.status or "saved",
        personal_rating=data.personal_rating or 0,
        is_favorite=data.is_favorite or False,
        metadata_info=json.dumps(data.metadata_info or {})
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return resource_to_dict(res)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    course_id: Optional[str] = Form(None),
    topic_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(""),
    res_type: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # Save file to disk
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    file_name = f"{file_id}_{file.filename}"
    file_path = settings.UPLOAD_DIR / file_name

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    detected_type = res_type
    if not detected_type:
        if ext == ".pdf": detected_type = "pdf"
        elif ext in [".mp4", ".mov", ".mkv", ".webm"]: detected_type = "video"
        elif ext in [".mp3", ".wav", ".m4a"]: detected_type = "audio"
        elif ext in [".png", ".jpg", ".jpeg", ".webp"]: detected_type = "image"
        elif ext in [".ppt", ".pptx"]: detected_type = "presentation"
        else: detected_type = "doc"

    res_title = title or file.filename

    res = Resource(
        course_id=course_id,
        topic_id=topic_id,
        title=res_title,
        type=detected_type,
        file_path=str(file_path),
        description=description or "",
        status="saved",
        indexing_status="indexing" if ext in [".pdf", ".txt", ".md", ".vtt", ".srt"] else "unprocessed"
    )
    db.add(res)
    db.commit()
    db.refresh(res)

    # Process and index text
    if ext == ".pdf":
        pages = extract_pdf_pages(str(file_path))
        chunk_idx = 0
        all_text = []
        for p in pages:
            all_text.append(p["text"])
            chunks = chunk_text(p["text"], page_number=p["page_number"])
            for ch in chunks:
                rc = ResourceChunk(
                    resource_id=res.id,
                    chunk_index=chunk_idx,
                    page_number=ch["page_number"],
                    text_content=ch["text"]
                )
                db.add(rc)
                chunk_idx += 1
        res.extracted_text = "\n\n".join(all_text)
        res.is_indexed = True
        res.indexing_status = "indexed" if chunk_idx > 0 else "ocr_required"
    elif ext in [".txt", ".md"]:
        text = extract_text_file(str(file_path))
        chunks = chunk_text(text)
        for idx, ch in enumerate(chunks):
            rc = ResourceChunk(
                resource_id=res.id,
                chunk_index=idx,
                text_content=ch["text"]
            )
            db.add(rc)
        res.extracted_text = text
        res.is_indexed = True
        res.indexing_status = "indexed"
    elif ext in [".vtt", ".srt"]:
        text = extract_text_file(str(file_path))
        segments = parse_transcript_vtt_srt(text)
        for idx, seg in enumerate(segments):
            rc = ResourceChunk(
                resource_id=res.id,
                chunk_index=idx,
                timestamp_secs=seg["timestamp_secs"],
                text_content=seg["text"]
            )
            db.add(rc)
        res.extracted_text = text
        res.is_indexed = True
        res.indexing_status = "indexed"

    db.commit()
    db.refresh(res)
    return resource_to_dict(res)

@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource_to_dict(r)

@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: str, data: ResourceUpdate, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    if data.course_id is not None: r.course_id = data.course_id
    if data.topic_id is not None: r.topic_id = data.topic_id
    if data.title is not None: r.title = data.title
    if data.type is not None: r.type = data.type
    if data.url is not None: r.url = data.url
    if data.description is not None: r.description = data.description
    if data.author is not None: r.author = data.author
    if data.tags is not None: r.tags = json.dumps(data.tags)
    if data.estimated_duration_mins is not None: r.estimated_duration_mins = data.estimated_duration_mins
    if data.status is not None: r.status = data.status
    if data.personal_rating is not None: r.personal_rating = data.personal_rating
    if data.is_favorite is not None: r.is_favorite = data.is_favorite
    if data.resume_position_secs is not None: r.resume_position_secs = data.resume_position_secs
    if data.metadata_info is not None: r.metadata_info = json.dumps(data.metadata_info)

    db.commit()
    db.refresh(r)
    return resource_to_dict(r)

@router.delete("/{resource_id}")
def delete_resource(resource_id: str, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    # Delete uploaded file if present
    if r.file_path and os.path.exists(r.file_path):
        try:
            os.remove(r.file_path)
        except Exception:
            pass
    db.delete(r) # cascades to ResourceChunks
    db.commit()
    return {"message": "Resource deleted successfully"}

@router.post("/{resource_id}/transcript")
def upload_transcript(resource_id: str, transcript_text: str = Form(...), db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Delete previous chunks
    db.query(ResourceChunk).filter(ResourceChunk.resource_id == r.id).delete()
    
    segments = parse_transcript_vtt_srt(transcript_text)
    if segments:
        for idx, seg in enumerate(segments):
            rc = ResourceChunk(
                resource_id=r.id,
                chunk_index=idx,
                timestamp_secs=seg["timestamp_secs"],
                text_content=seg["text"]
            )
            db.add(rc)
    else:
        # plain text fallback chunks
        chunks = chunk_text(transcript_text)
        for idx, ch in enumerate(chunks):
            rc = ResourceChunk(
                resource_id=r.id,
                chunk_index=idx,
                text_content=ch["text"]
            )
            db.add(rc)
            
    r.extracted_text = transcript_text
    r.is_indexed = True
    r.indexing_status = "indexed"
    db.commit()
    db.refresh(r)
    return resource_to_dict(r)
