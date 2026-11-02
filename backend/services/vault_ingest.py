import os
import re
import json
import zipfile
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.config import settings, BASE_DIR
from backend.models import Course, Module, Topic, Resource, ResourceChunk, Note
from backend.services.text_processor import chunk_text

SEED_ZIP_PATH = BASE_DIR / "backend" / "seed_data" / "pmii_vault.zip"
FALLBACK_ZIP_PATH = Path(r"C:\Users\reddy\.gemini\antigravity\brain\fd4ffb58-b368-471c-83e2-c4e2203ec16a\.user_uploaded\media_1793652667561_b6e9116c.zip")

def get_vault_zip(zip_path: Optional[Path] = None) -> Optional[Path]:
    if zip_path and zip_path.exists():
        return zip_path
    if SEED_ZIP_PATH.exists():
        return SEED_ZIP_PATH
    if FALLBACK_ZIP_PATH.exists():
        return FALLBACK_ZIP_PATH
    return None

def clean_title(title: str) -> str:
    """Removes quotes and normalizes dashes."""
    cleaned = title.strip().strip('"\'')
    cleaned = cleaned.replace('\ufffd', '—').replace('', '—')
    cleaned = re.sub(r'\s*—\s*', ' — ', cleaned)
    return cleaned

def parse_markdown_with_frontmatter(content: str) -> Dict[str, Any]:
    """Extracts frontmatter and body from markdown content."""
    meta: Dict[str, Any] = {}
    body = content

    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
    if fm_match:
        fm_text = fm_match.group(1)
        body = fm_match.group(2).strip()

        # Simple YAML parser for key-values and lists
        current_list_key = None
        for line in fm_text.splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            if line_str.startswith("- ") and current_list_key:
                val = line_str[2:].strip().strip('"\'')
                meta.setdefault(current_list_key, []).append(val)
            elif ":" in line_str:
                parts = line_str.split(":", 1)
                key = parts[0].strip()
                val = parts[1].strip()
                if not val:
                    current_list_key = key
                    meta[key] = []
                else:
                    current_list_key = None
                    meta[key] = val.strip('"\'')
    
    # Extract title from meta or from first heading
    title = meta.get("title")
    if not title:
        heading_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
        if heading_match:
            title = heading_match.group(1).strip()
        else:
            title = "Untitled Resource"
    
    title = clean_title(title)
    
    # Extract summary: First paragraph or blockquote under title
    summary = ""
    quote_match = re.search(r">\s*\*\*Core Question:\*\*\s*(.+)", body)
    if quote_match:
        summary = quote_match.group(1).split("#")[0].strip()
    else:
        # First paragraph with text
        paras = [p.strip() for p in body.split("\n\n") if p.strip() and not p.strip().startswith("#")]
        if paras:
            summary = paras[0][:280] + ("..." if len(paras[0]) > 280 else "")

    if not summary:
        summary = f"In-depth technical and product management notes on {title}."

    return {
        "title": title,
        "meta": meta,
        "summary": summary,
        "body": body
    }

def ingest_pmii_vault(db: Session, zip_path: Optional[Path] = None) -> Dict[str, int]:
    """
    Ingests all markdown resources from PMII Vault into the database and uploads directory.
    """
    target_zip = get_vault_zip(zip_path)
    if not target_zip or not target_zip.exists():
        print("Vault zip not found (checked seed_data and fallback)")
        return {"resources": 0, "notes": 0}

    # Destination directory for vault files
    vault_dest_dir = settings.UPLOAD_DIR / "vault" / "PMII_Vault"
    vault_dest_dir.mkdir(parents=True, exist_ok=True)

    # 1. Ensure PM Tech Fluency Course exists
    course = db.query(Course).filter(Course.name.ilike("%PM Tech Fluency%")).first()
    if not course:
        course = Course(
            name="PM Tech Fluency & System Architecture",
            description="Comprehensive technology curriculum for product managers covering Web Fundamentals, APIs, Databases at Scale, Cloud Deployment, Security, ML Foundations, and Architecture Strategy.",
            category="System Design & Architecture",
            instructor="Learnova Knowledge Master",
            priority="high",
            cover_color="#0ea5e9",
            tags=json.dumps(["Product Management", "System Architecture", "Databases", "APIs", "Security", "Machine Learning"]),
            status="active"
        )
        db.add(course)
        db.commit()
        db.refresh(course)

    # 2. Module Mapping definitions
    module_defs = [
        (1, "Web Fundamentals & Client-Server Architecture", "DNS, HTTP/HTTPS, TCP/IP, client-server models, rendering strategies, and state management."),
        (2, "APIs & Integrations", "REST, GraphQL, Webhooks, API lifecycle, rate limiting, and third-party integrations."),
        (3, "Databases & Analytics at Scale", "SQL vs NoSQL, normalization, indexing, replication, sharding, caching, and analytics data pipelines."),
        (4, "Cloud Infrastructure & Going Live", "IaaS, PaaS, Serverless, Docker, CI/CD, auto-scaling, uptime, and deployment pipelines."),
        (5, "Security, Privacy & Compliance", "Authentication, Authorization, OAuth, JWT, DPDP Act, GDPR, SOC 2, and Threat Modeling."),
        (6, "Machine Learning Foundations & Applied AI", "Supervised/Unsupervised ML, feature engineering, model drift, evaluation metrics, and applied AI in products."),
        (7, "Build vs Buy & Technical Debt", "Architectural trade-offs, technical debt management, vendor lock-in, and legacy migration."),
        (8, "Maps of Content & Architectural References", "Master maps of content (MOC) synthesizing databases, security, APIs, cloud, and tech stacks.")
    ]

    module_map = {}
    for idx, mod_title, mod_desc in module_defs:
        mod = db.query(Module).filter(Module.course_id == course.id, Module.order_index == idx).first()
        if not mod:
            mod = Module(
                course_id=course.id,
                title=mod_title,
                description=mod_desc,
                order_index=idx
            )
            db.add(mod)
            db.commit()
            db.refresh(mod)
        module_map[idx] = mod

    # Helper to map session numbers to modules
    def get_module_for_session(session_num: int) -> Module:
        if session_num in [1, 2, 3]: return module_map[1]
        elif session_num in [4, 5]: return module_map[2]
        elif session_num in [6, 7, 8]: return module_map[3]
        elif session_num in [9, 10]: return module_map[4]
        elif session_num in [11, 12]: return module_map[5]
        elif session_num in [13, 14]: return module_map[6]
        elif session_num in [15, 16]: return module_map[7]
        return module_map[8]

    counts = {"resources": 0, "notes": 0, "chunks": 0}

    with zipfile.ZipFile(target_zip, "r") as z:
        for info in z.infolist():
            if not info.filename.endswith(".md"):
                continue
            
            raw_bytes = z.read(info.filename)
            content = raw_bytes.decode("utf-8", errors="replace")
            parsed = parse_markdown_with_frontmatter(content)
            
            rel_path = info.filename.replace("PMII Valut/", "").replace("PMII Vault/", "")
            dest_file = vault_dest_dir / rel_path
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            with open(dest_file, "w", encoding="utf-8") as out_f:
                out_f.write(content)

            # Determine category, module, and topic
            is_session = "Sessions/" in info.filename
            is_moc = "MOC/" in info.filename
            is_concept = "Concepts/" in info.filename

            category = "Lecture Note" if is_session else ("Cheat Sheet" if is_moc else "Research Paper")
            tags = parsed["meta"].get("tags", [])
            if not isinstance(tags, list):
                tags = [str(tags)]
            if is_session: tags.append("Session")
            elif is_moc: tags.append("MOC")
            elif is_concept: tags.append("Concept")

            # Determine module and topic
            target_module = None
            session_num = None
            if is_session:
                sess_match = re.search(r"Session-(\d+)", info.filename)
                if sess_match:
                    session_num = int(sess_match.group(1))
                    target_module = get_module_for_session(session_num)
            elif is_moc:
                target_module = module_map[8]
            else:
                # Concepts categorized by tags
                tag_str = " ".join([t.lower() for t in tags])
                if "database" in tag_str or "sql" in tag_str: target_module = module_map[3]
                elif "api" in tag_str or "http" in tag_str: target_module = module_map[2]
                elif "cloud" in tag_str or "devops" in tag_str: target_module = module_map[4]
                elif "security" in tag_str or "auth" in tag_str or "privacy" in tag_str: target_module = module_map[5]
                elif "ml" in tag_str or "machine-learning" in tag_str: target_module = module_map[6]
                else: target_module = module_map[1]

            # Find or create Topic for Sessions and MOCs
            topic_id = None
            if target_module and (is_session or is_moc):
                topic = db.query(Topic).filter(Topic.module_id == target_module.id, Topic.title == parsed["title"]).first()
                if not topic:
                    topic = Topic(
                        course_id=course.id,
                        module_id=target_module.id,
                        title=parsed["title"],
                        description=parsed["summary"],
                        estimated_minutes=35 if is_session else 15,
                        status="not_started",
                        order_index=session_num or 0
                    )
                    db.add(topic)
                    db.commit()
                    db.refresh(topic)
                topic_id = topic.id

            # Calculate read duration
            word_count = len(parsed["body"].split())
            duration_mins = max(5, round(word_count / 180))

            # Check if resource already exists
            existing_res = db.query(Resource).filter(
                (Resource.file_path == str(dest_file)) | (Resource.title == parsed["title"])
            ).first()

            if not existing_res:
                res = Resource(
                    course_id=course.id,
                    topic_id=topic_id,
                    title=parsed["title"],
                    type="doc",
                    file_path=str(dest_file),
                    url=None,
                    description=parsed["summary"],
                    extracted_text=parsed["body"],
                    author="PM Tech Fluency",
                    tags=json.dumps(tags),
                    estimated_duration_mins=duration_mins,
                    status="saved",
                    personal_rating=5,
                    is_favorite=bool(is_session or is_moc),
                    is_indexed=True,
                    indexing_status="indexed",
                    metadata_info=json.dumps({
                        "vault_path": rel_path,
                        "word_count": word_count,
                        "category": category,
                        "session_number": session_num
                    })
                )
                db.add(res)
                db.commit()
                db.refresh(res)
                counts["resources"] += 1

                # Add chunks for RAG
                chunks = chunk_text(parsed["body"])
                for c_idx, ch in enumerate(chunks[:25]): # index up to 25 primary chunks per document
                    rc = ResourceChunk(
                        resource_id=res.id,
                        chunk_index=c_idx,
                        text_content=ch["text"]
                    )
                    db.add(rc)
                    counts["chunks"] += 1
                db.commit()

                # For Sessions, also create a Note record
                if is_session:
                    existing_note = db.query(Note).filter(Note.title == parsed["title"]).first()
                    if not existing_note:
                        note = Note(
                            course_id=course.id,
                            topic_id=topic_id,
                            title=parsed["title"],
                            content=parsed["body"],
                            summary=parsed["summary"],
                            tags=json.dumps(tags),
                            is_pinned=True,
                            is_favorite=True,
                            template_type="lecture"
                        )
                        db.add(note)
                        counts["notes"] += 1
                        db.commit()

    return counts

if __name__ == "__main__":
    from backend.database import SessionLocal
    db = SessionLocal()
    print("Ingesting PMII Vault into database...")
    res = ingest_pmii_vault(db)
    print("Ingestion results:", res)
    db.close()
