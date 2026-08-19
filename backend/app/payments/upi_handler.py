import os
import uuid
from typing import Tuple
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "screenshots")
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/pjpeg", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB limit

def save_payment_screenshot(file: UploadFile) -> Tuple[bool, str]:
    """
    Validates extension, MIME type, and size of uploaded payment screenshot.
    Saves file with a random UUID filename in secure uploads directory.
    Returns (success, filepath_or_error_message).
    """
    if not file or not file.filename:
        return False, "No file provided"

    ext = os.path.splitext(file.filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file extension '{ext}'. Allowed extensions: PNG, JPG, JPEG, WEBP."

    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        return False, f"Invalid file type '{file.content_type}'. Allowed types: image/png, image/jpeg, image/webp."

    # Read content to check file size
    try:
        content = file.file.read()
        if len(content) > MAX_FILE_SIZE:
            return False, f"File size exceeds limit of 5 MB (size: {len(content) / (1024*1024):.2f} MB)."

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"pay_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(content)

        return True, filename
    except Exception as e:
        return False, f"Failed to save uploaded file: {str(e)}"
