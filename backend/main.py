import os
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_STORAGE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "covers")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="Pride & Prejudice Collection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def verify_admin(authorization: Optional[str] = Header(None)):
    """Verify Supabase JWT by asking Supabase Auth to validate it."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return response.user
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {exc}")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class BookIn(BaseModel):
    title: str
    author: str = "Jane Austen"
    year_published: Optional[int] = None
    description: Optional[str] = None
    edition: Optional[str] = None
    publisher: Optional[str] = None
    condition: Optional[str] = None
    acquisition_date: Optional[str] = None
    acquisition_notes: Optional[str] = None
    acquisition_price: Optional[float] = None
    cover_image_url: Optional[str] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    year_published: Optional[int] = None
    description: Optional[str] = None
    edition: Optional[str] = None
    publisher: Optional[str] = None
    condition: Optional[str] = None
    acquisition_date: Optional[str] = None
    acquisition_notes: Optional[str] = None
    acquisition_price: Optional[float] = None
    cover_image_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

def _storage_path_from_url(url: str) -> Optional[str]:
    """Extract the storage object path from a Supabase public URL."""
    marker = f"/object/public/{SUPABASE_STORAGE_BUCKET}/"
    if marker in url:
        return url.split(marker, 1)[1]
    return None

async def _upload_file(file: UploadFile) -> str:
    """Upload a file to Supabase Storage and return its public URL."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, WebP, or GIF)")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    contents = await file.read()
    supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
        filename, contents, {"content-type": file.content_type}
    )
    return supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(filename)

def _delete_storage_url(url: str):
    """Remove a file from storage. Silently ignores failures."""
    path = _storage_path_from_url(url)
    if path:
        try:
            supabase.storage.from_(SUPABASE_STORAGE_BUCKET).remove([path])
        except Exception:
            pass

def _get_book_images(book_id: str) -> list:
    """Return images for a book ordered by position, primary first."""
    resp = (
        supabase.table("book_images")
        .select("*")
        .eq("book_id", book_id)
        .order("is_primary", desc=True)
        .order("position", desc=False)
        .execute()
    )
    return resp.data or []


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------

@app.get("/books")
def list_books():
    """Return all books ordered by year published (oldest first)."""
    response = (
        supabase.table("books")
        .select("*")
        .order("year_published", desc=False, nullsfirst=False)
        .execute()
    )
    return response.data


@app.get("/books/{book_id}")
def get_book(book_id: str):
    """Return a single book with all its images."""
    response = supabase.table("books").select("*").eq("id", book_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Book not found")
    book = response.data
    book["images"] = _get_book_images(book_id)
    return book


# ---------------------------------------------------------------------------
# Admin routes — books (require JWT)
# ---------------------------------------------------------------------------

@app.post("/books", status_code=201)
def create_book(book: BookIn, _admin=Depends(verify_admin)):
    """Create a new book entry."""
    response = supabase.table("books").insert(book.model_dump(exclude_none=True)).execute()
    return response.data[0]


@app.put("/books/{book_id}")
def update_book(book_id: str, book: BookUpdate, _admin=Depends(verify_admin)):
    """Update an existing book."""
    updates = book.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    response = supabase.table("books").update(updates).eq("id", book_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Book not found")
    return response.data[0]


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: str, _admin=Depends(verify_admin)):
    """Delete a book and all its images from storage."""
    images = _get_book_images(book_id)
    for img in images:
        _delete_storage_url(img["url"])
    supabase.table("books").delete().eq("id", book_id).execute()


# ---------------------------------------------------------------------------
# Admin routes — book images (require JWT)
# ---------------------------------------------------------------------------

@app.get("/books/{book_id}/images")
def list_book_images(book_id: str):
    """Return all images for a book."""
    return _get_book_images(book_id)


@app.post("/books/{book_id}/images", status_code=201)
async def add_book_image(
    book_id: str,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    _admin=Depends(verify_admin),
):
    """Upload and attach an image to a book. The first image auto-becomes primary."""
    public_url = await _upload_file(file)

    existing = _get_book_images(book_id)
    is_primary = len(existing) == 0  # first image becomes primary
    position = len(existing)

    img_resp = supabase.table("book_images").insert({
        "book_id": book_id,
        "url": public_url,
        "caption": caption,
        "position": position,
        "is_primary": is_primary,
    }).execute()
    new_image = img_resp.data[0]

    # Keep cover_image_url in sync when this is the primary
    if is_primary:
        supabase.table("books").update({"cover_image_url": public_url}).eq("id", book_id).execute()

    return new_image


@app.put("/books/{book_id}/images/{image_id}/primary", status_code=200)
def set_primary_image(book_id: str, image_id: str, _admin=Depends(verify_admin)):
    """Set a specific image as the primary (cover) image for a book."""
    # Unset any existing primary
    supabase.table("book_images").update({"is_primary": False}).eq("book_id", book_id).execute()
    # Set the new primary
    resp = supabase.table("book_images").update({"is_primary": True}).eq("id", image_id).eq("book_id", book_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Image not found")
    new_primary_url = resp.data[0]["url"]
    # Sync cover_image_url on book
    supabase.table("books").update({"cover_image_url": new_primary_url}).eq("id", book_id).execute()
    return resp.data[0]


@app.delete("/books/{book_id}/images/{image_id}", status_code=204)
def delete_book_image(book_id: str, image_id: str, _admin=Depends(verify_admin)):
    """Remove an image from a book and delete it from storage."""
    img_resp = supabase.table("book_images").select("*").eq("id", image_id).eq("book_id", book_id).single().execute()
    if not img_resp.data:
        raise HTTPException(status_code=404, detail="Image not found")
    img = img_resp.data
    was_primary = img.get("is_primary", False)

    _delete_storage_url(img["url"])
    supabase.table("book_images").delete().eq("id", image_id).execute()

    # If we removed the primary, promote the next image
    if was_primary:
        remaining = _get_book_images(book_id)
        if remaining:
            next_img = remaining[0]
            supabase.table("book_images").update({"is_primary": True}).eq("id", next_img["id"]).execute()
            supabase.table("books").update({"cover_image_url": next_img["url"]}).eq("id", book_id).execute()
        else:
            supabase.table("books").update({"cover_image_url": None}).eq("id", book_id).execute()


@app.get("/health")
def health():
    return {"status": "ok"}
