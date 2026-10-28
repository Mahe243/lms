import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

def extract_pdf_pages(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text per page from a PDF file.
    Returns list of {"page_number": int, "text": str}.
    """
    pages = []
    if not PYPDF_AVAILABLE or not os.path.exists(file_path):
        return pages
    
    try:
        reader = PdfReader(file_path)
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            pages.append({
                "page_number": idx + 1,
                "text": text
            })
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return pages

def extract_text_file(file_path: str) -> str:
    """Extract plain text or markdown from file."""
    if not os.path.exists(file_path):
        return ""
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception as e:
        print(f"Error reading text file {file_path}: {e}")
        return ""

def parse_transcript_vtt_srt(content: str) -> List[Dict[str, Any]]:
    """
    Parses VTT or SRT formatted transcript into timestamped segments.
    Returns list of {"timestamp_secs": float, "text": str}.
    """
    segments = []
    # Regex for timestamp formats: 00:01:23.456 or 01:23,456 or 01:23
    timestamp_pattern = re.compile(r'(\d{1,2}:)?(\d{2}):(\d{2})[,\.]?(\d{0,3})')
    
    lines = content.splitlines()
    current_time_secs = 0.0
    current_text = []

    for line in lines:
        line_str = line.strip()
        if not line_str or line_str.startswith("WEBVTT") or line_str.isdigit():
            continue
        
        # Check if line contains a timestamp arrow "-->"
        if "-->" in line_str:
            times = line_str.split("-->")
            start_time_str = times[0].strip()
            # Parse start time into seconds
            match = timestamp_pattern.match(start_time_str)
            if match:
                hrs = int(match.group(1).replace(":", "")) if match.group(1) else 0
                mins = int(match.group(2))
                secs = int(match.group(3))
                current_time_secs = hrs * 3600 + mins * 60 + secs
        else:
            clean_line = re.sub(r'<[^>]+>', '', line_str) # remove html tags
            if clean_line:
                segments.append({
                    "timestamp_secs": current_time_secs,
                    "text": clean_line
                })
    return segments

def chunk_text(
    text: str,
    page_number: Optional[int] = None,
    timestamp_secs: Optional[float] = None,
    chunk_size: int = 500,
    overlap: int = 100
) -> List[Dict[str, Any]]:
    """
    Splits text into overlapping chunks of approx chunk_size characters.
    """
    chunks = []
    if not text:
        return chunks

    paragraphs = re.split(r'\n\s*\n', text)
    current_chunk = ""
    
    for para in paragraphs:
        para_clean = para.strip()
        if not para_clean:
            continue
        
        if len(current_chunk) + len(para_clean) < chunk_size:
            current_chunk = (current_chunk + "\n\n" + para_clean).strip()
        else:
            if current_chunk:
                chunks.append({
                    "text": current_chunk,
                    "page_number": page_number,
                    "timestamp_secs": timestamp_secs
                })
            # Start new chunk
            current_chunk = para_clean

    if current_chunk:
        chunks.append({
            "text": current_chunk,
            "page_number": page_number,
            "timestamp_secs": timestamp_secs
        })
    return chunks
