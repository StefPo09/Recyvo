import os
import base64
import json
import math
import shutil
import uuid
import sqlite3
from contextlib import asynccontextmanager
from typing import Optional, List, Dict

import httpx
from google import genai
from google.genai import types
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Absolute path to the SQLite DB file (located next to this file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "trash_bins.db")

# ---------------------------------------------------------------------------
# Configurare Foldere și Mediu
# ---------------------------------------------------------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Modele Pydantic
# ---------------------------------------------------------------------------

class ImageRequest(BaseModel):
    image: str
    mime_type: str = "image/jpeg"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RecyclingPoint(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    distance_km: Optional[float] = None
    maps_url: str
    open_now: Optional[bool] = None
    rating: Optional[float] = None


class WasteResult(BaseModel):
    item_name: str
    waste_category: str
    description: str
    disposal_instructions: List[str]
    warnings: List[str]
    is_recyclable: bool
    recycling_points: List[RecyclingPoint] = []
    local_bins: List[Dict] = []


class NearestRequest(BaseModel):
    user_lat: float
    user_lng: float
    bin_type: str
    max_results: int = 5


# Modele noi pentru Utilizatori
class UserCreate(BaseModel):
    username: str
    nume: str
    email: str
    parola: str


class UserResponse(BaseModel):
    id: str
    username: str
    nume: str
    email: str
    profile_image: Optional[str] = None
    nr_puncte: int


class UserLogin(BaseModel):
    username_or_email: str
    parola: str


class UserPointsUpdate(BaseModel):
    puncte_adaugate: int


class UserUpdate(BaseModel):
    username: Optional[str] = None
    nume: Optional[str] = None
    email: Optional[str] = None
    parola: Optional[str] = None


# ---------------------------------------------------------------------------
# Prompts & Dicționare de Căutare
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are an expert assistant in waste identification and recycling. You analyze images and accurately identify the type of waste (glass, plastic, batteries, electronic waste, paper/cardboard, metal, organic waste, hazardous waste, etc.), clearly explaining how it should be properly disposed of or recycled. IMPORTANT: Respond EXCLUSIVELY in valid JSON format, without additional text and without markdown backticks. Required JSON structure: { "item_name": "Name of the identified object (in English, e.g., 'PET Plastic Bottle')", "waste_category": "A category STRICTLY from: 'glass', 'plastic', 'batteries', 'electronics', 'paper_cardboard', 'metal', 'organic', 'hazardous', 'other'", "description": "Short description of the object and why it belongs to this category (1–3 sentences)", "is_recyclable": true, "disposal_instructions": [ "Step 1: ...", "Step 2: ...", "..." ], "warnings": [ "Important warning or precaution (e.g., batteries must NOT be disposed of in household waste)...", "..." ] } If the image does not contain an identifiable waste item, respond with: { "item_name": "Unidentified Object", "waste_category": "other", "description": "I could not identify a type of waste in this image. Please take a clearer photo of the object.", "is_recyclable": false, "disposal_instructions": [], "warnings": ["Make sure the object is visible and well lit in the photo."] } Always respond in English. Be precise, concise, and friendly."""
USER_PROMPT = """Analyze this image and identify the type of waste (glass, plastic, battery, electronic waste, paper, metal, etc.). Provide clear instructions on how it should be properly disposed of/recycled and any important warnings. Respond ONLY with JSON, without any additional text."""
CATEGORY_SEARCH_QUERY = {"glass": "glass recycling collection center", "plastic": "plastic recycling collection point",
                         "batteries": "used battery recycling collection point",
                         "electronics": "electronic waste and appliance collection center",
                         "paper_cardboard": "paper cardboard recycling collection point",
                         "metal": "metal waste recycling center scrap metal",
                         "organic": "organic waste composting center", "hazardous": "hazardous waste collection center",
                         "other": "recyclable waste collection point", }
GEMINI_TO_LOCAL_BIN_MAP = {"plastic": "plastic", "glass": "glass", "paper_cardboard": "paper",
                           "electronics": "electronic", "batteries": "electronic", "metal": "general",
                           "organic": "general", "hazardous": "general", "other": "general"}


# ---------------------------------------------------------------------------
# Configurare Bază de Date (SQLite)
# ---------------------------------------------------------------------------

def get_db():
    # Use the absolute DB path so the app always opens the same database
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    # Tabela pentru coșuri
    conn.execute("""
                 CREATE TABLE IF NOT EXISTS trash_bins
                 (
                     id
                     TEXT
                     PRIMARY
                     KEY,
                     lat
                     REAL
                     NOT
                     NULL,
                     lng
                     REAL
                     NOT
                     NULL,
                     address
                     TEXT,
                     bin_type
                     TEXT
                     NOT
                     NULL,
                     image_url
                     TEXT,
                     added_by
                     TEXT,
                     created_at
                     TEXT
                     DEFAULT (
                     datetime
                 (
                     'now'
                 ))
                     )
                 """)

    # Tabela NOUĂ pentru utilizatori
    conn.execute("""
                 CREATE TABLE IF NOT EXISTS users
                 (
                     id TEXT PRIMARY KEY,
                     username TEXT UNIQUE NOT NULL,
                     nume TEXT NOT NULL,
                     email TEXT UNIQUE NOT NULL,
                     parola TEXT NOT NULL,
                     profile_image TEXT,
                     nr_puncte INTEGER DEFAULT 0,
                     created_at TEXT DEFAULT (datetime('now'))
                 )
                 """)

    conn.commit()
    # If the users table was created previously without profile_image, add the column.
    try:
        cols = [r[1] for r in conn.execute("PRAGMA table_info(users)").fetchall()]
        if "profile_image" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
            conn.commit()
    except Exception:
        # If the users table does not exist yet or PRAGMA fails, ignore — create above will handle it.
        pass

    conn.close()


# ---------------------------------------------------------------------------
# Gestionare Lifespan Aplicație
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # For local development we allow running without a Google API key so
        # features that don't require Gemini/Places (like adding/listing bins)
        # still work. If you need image analysis or places, set GOOGLE_API_KEY
        # in a .env file or the environment.
        print("WARNING: GOOGLE_API_KEY not set. Gemini/Places features will be disabled.")
        app.state.client = None
    else:
        app.state.client = genai.Client(api_key=api_key)

    places_key = os.getenv("GOOGLE_PLACES_API_KEY", api_key)
    app.state.places_api_key = places_key
    app.state.http_client = httpx.AsyncClient(timeout=10.0)

    yield

    await app.state.http_client.aclose()


app = FastAPI(
    title="Simplexo Waste Recycling API",
    description="Detectare deșeuri (Gemini Vision) + Management Coșuri și Utilizatori",
    version="4.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------------------------------------------------------------------------
# Funcții Helper
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, sin, cos, sqrt, atan2
    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return r * 2 * atan2(sqrt(a), sqrt(1 - a))


def format_distance(meters: float) -> str:
    if meters < 1000:
        return f"{int(meters)} m"
    return f"{meters / 1000:.1f} km"


async def find_recycling_points(
        http_client: httpx.AsyncClient,
        api_key: str,
        waste_category: str,
        latitude: float,
        longitude: float,
        max_results: int = 5,
) -> List[RecyclingPoint]:
    query = CATEGORY_SEARCH_QUERY.get(waste_category, CATEGORY_SEARCH_QUERY["altele"])

    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.displayName,places.formattedAddress,places.location,"
            "places.googleMapsUri,places.currentOpeningHours.openNow,"
            "places.rating"
        ),
    }
    payload = {
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": {"latitude": latitude, "longitude": longitude},
                "radius": 15000.0,
            }
        },
        "languageCode": "ro",
        "maxResultCount": max_results,
    }

    try:
        resp = await http_client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"[Places API] Eroare la obținerea datelor: {e}")
        return []

    points: List[RecyclingPoint] = []
    for place in data.get("places", []):
        loc = place.get("location", {})
        p_lat = loc.get("latitude")
        p_lng = loc.get("longitude")

        distance = None
        if p_lat is not None and p_lng is not None:
            distance = round(haversine_km(latitude, longitude, p_lat, p_lng), 2)

        opening_hours = place.get("currentOpeningHours", {})

        points.append(
            RecyclingPoint(
                name=place.get("displayName", {}).get("text", "Punct de reciclare"),
                address=place.get("formattedAddress", "Adresă necunoscută"),
                latitude=p_lat or 0.0,
                longitude=p_lng or 0.0,
                distance_km=distance,
                maps_url=place.get("googleMapsUri", ""),
                open_now=opening_hours.get("openNow"),
                rating=place.get("rating"),
            )
        )

    points.sort(key=lambda p: p.distance_km if p.distance_km is not None else float("inf"))
    return points


@app.get("/places/nearby/", response_model=List[RecyclingPoint])
async def get_recycling_places(waste_category: str, lat: float, lng: float, max_results: int = 5):
    """Return nearby recycling places for a given waste category and location."""
    try:
        places = await find_recycling_points(
            http_client=app.state.http_client,
            api_key=app.state.places_api_key,
            waste_category=waste_category,
            latitude=lat,
            longitude=lng,
            max_results=max_results,
        )
        return places
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching places: {e}")


def get_local_nearest_bins(user_lat: float, user_lng: float, bin_type: str, max_results: int = 5) -> List[dict]:
    conn = get_db()
    bins = conn.execute("SELECT * FROM trash_bins WHERE bin_type = ?", (bin_type,)).fetchall()
    conn.close()

    if not bins:
        return []

    results = []
    for b in bins:
        dist_m = haversine_km(user_lat, user_lng, b["lat"], b["lng"]) * 1000
        results.append({
            **dict(b),
            "distance_m": round(dist_m),
            "distance_label": format_distance(dist_m),
        })

    results.sort(key=lambda x: x["distance_m"])
    return results[:max_results]


# ---------------------------------------------------------------------------
# Rute API: Deșeuri și Coșuri
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "Sistem Unificat Activ",
        "services": ["Gemini Detection", "Google Places", "Local Bins", "User Management"],
        "version": "4.1.0"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=WasteResult)
async def analyze_waste(request: ImageRequest) -> WasteResult:
    if not request.image:
        raise HTTPException(status_code=400, detail="Imaginea este goală.")

    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    mime = request.mime_type.lower()
    if mime not in allowed_types:
        mime = "image/jpeg"

    try:
        image_bytes = base64.b64decode(request.image, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Date base64 invalide.")

    client: genai.Client = app.state.client

    try:
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[USER_PROMPT, image_part],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                max_output_tokens=1024,
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        data = json.loads(raw_text)

        waste_category = data.get("waste_category", "altele")
        if waste_category not in CATEGORY_SEARCH_QUERY:
            waste_category = "altele"

        recycling_points: List[RecyclingPoint] = []
        local_bins: List[dict] = []

        has_location = request.latitude is not None and request.longitude is not None
        item_identified = data.get("item_name", "Obiect neidentificat") != "Obiect neidentificat"

        if has_location and item_identified:
            recycling_points = await find_recycling_points(
                http_client=app.state.http_client,
                api_key=app.state.places_api_key,
                waste_category=waste_category,
                latitude=request.latitude,
                longitude=request.longitude,
            )

            local_bins = get_local_nearest_bins(
                user_lat=request.latitude,
                user_lng=request.longitude,
                bin_type=GEMINI_TO_LOCAL_BIN_MAP.get(waste_category, "general"),
                max_results=5
            )

        return WasteResult(
            item_name=data.get("item_name", "Obiect neidentificat"),
            waste_category=waste_category,
            description=data.get("description", ""),
            disposal_instructions=data.get("disposal_instructions", []),
            warnings=data.get("warnings", []),
            is_recyclable=data.get("is_recyclable", False),
            recycling_points=recycling_points,
            local_bins=local_bins
        )

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Eroare parsare Gemini: {str(e)}")
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg or "authentication" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Cheie API Google invalidă.")
        if "quota" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(status_code=429, detail="Limita API Google depășită.")
        raise HTTPException(status_code=500, detail=f"Eroare internă: {error_msg}")


@app.post("/bins/")
async def add_bin(
        lat: float = Form(...),
        lng: float = Form(...),
        address: str = Form(""),
        bin_type: str = Form(...),
        added_by: str = Form("anonim"),
        image: Optional[UploadFile] = File(None)
):
    valid_types = {"plastic", "sticla", "hartie", "general", "electronic"}
    if bin_type not in valid_types:
        raise HTTPException(400, f"bin_type invalid. Valori: {valid_types}")

    bin_id = str(uuid.uuid4())
    image_url = None

    if image and image.filename:
        ext = image.filename.rsplit(".", 1)[-1].lower()
        filename = f"{bin_id}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_url = f"/uploads/{filename}"

    conn = get_db()
    conn.execute(
        "INSERT INTO trash_bins (id, lat, lng, address, bin_type, image_url, added_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (bin_id, lat, lng, address, bin_type, image_url, added_by)
    )
    conn.commit()
    conn.close()

    return {"success": True, "bin_id": bin_id, "message": "Coș adăugat!", "image_url": image_url}


@app.get("/bins/")
def list_bins(bin_type: Optional[str] = None):
    conn = get_db()
    if bin_type:
        rows = conn.execute("SELECT * FROM trash_bins WHERE bin_type = ?", (bin_type,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM trash_bins").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/bins/nearest/")
def find_nearest(req: NearestRequest):
    conn = get_db()
    bins = conn.execute("SELECT * FROM trash_bins WHERE bin_type = ?", (req.bin_type,)).fetchall()
    conn.close()

    if not bins:
        raise HTTPException(404, "Nu există coșuri înregistrate de acest tip.")

    results = []
    for b in bins:
        dist_m = haversine_km(req.user_lat, req.user_lng, b["lat"], b["lng"]) * 1000
        results.append({
            **dict(b),
            "distance_m": round(dist_m),
            "distance_label": format_distance(dist_m),
        })

    results.sort(key=lambda x: x["distance_m"])
    return {
        "bin_type": req.bin_type,
        "user_location": {"lat": req.user_lat, "lng": req.user_lng},
        "nearest_bins": results[: req.max_results],
        "total_found": len(bins)
    }


@app.get("/bins/nearest-simple/")
def find_nearest_get(lat: float, lng: float, bin_type: str, max_results: int = 3):
    return find_nearest(NearestRequest(user_lat=lat, user_lng=lng, bin_type=bin_type, max_results=max_results))


@app.delete("/bins/{bin_id}")
def delete_bin(bin_id: str):
    conn = get_db()
    result = conn.execute("DELETE FROM trash_bins WHERE id = ?", (bin_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(404, "Coșul nu a fost găsit.")
    return {"success": True, "deleted_id": bin_id}


# ---------------------------------------------------------------------------
# Rute API: Utilizatori
# ---------------------------------------------------------------------------

@app.post("/users/", response_model=UserResponse, summary="Înregistrează un utilizator nou")
def create_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    conn = get_db()

    try:
        conn.execute(
            "INSERT INTO users (id, username, nume, email, parola, profile_image, nr_puncte) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, user.username, user.nume, user.email, user.parola, None, 0)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username-ul sau email-ul există deja.")

    conn.close()

    return {
        "id": user_id,
        "username": user.username,
        "nume": user.nume,
        "email": user.email,
        "profile_image": None,
        "nr_puncte": 0
    }


@app.get("/users/all", response_model=List[UserResponse], summary="Obține toți utilizatorii pentru DataGrid")
def get_all_users():
    conn = get_db()
    rows = conn.execute("SELECT id, username, nume, email, nr_puncte FROM users").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.put("/users/{username}/points", summary="Adaugă puncte unui utilizator")
def add_points(username: str, data: UserPointsUpdate):
    conn = get_db()

    row = conn.execute("SELECT nr_puncte FROM users WHERE username = ?", (username,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")

    nou_total = row["nr_puncte"] + data.puncte_adaugate

    conn.execute("UPDATE users SET nr_puncte = ? WHERE username = ?", (nou_total, username))
    conn.commit()
    conn.close()

    return {"success": True, "username": username, "puncte_totale": nou_total}


@app.post("/users/login")
def login(user: UserLogin):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM users WHERE (username = ? OR email = ?) AND parola = ?",
        (user.username_or_email, user.username_or_email, user.parola)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Autentificare eșuată. Verificați username-ul/emailul și parola.")

    return {
        "id": row["id"],
        "username": row["username"],
        "nume": row["nume"],
        "email": row["email"],
        "nr_puncte": row["nr_puncte"]
    }


@app.get("/users/{user_id}", response_model=UserResponse, summary="Obține un utilizator după id")
def get_user(user_id: str):
    conn = get_db()
    row = conn.execute("SELECT id, username, nume, email, profile_image, nr_puncte FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")
    return dict(row)


@app.put("/users/{user_id}", response_model=UserResponse, summary="Actualizează profilul unui utilizator")
def update_user(user_id: str, data: UserUpdate):
    conn = get_db()

    fields = []
    params: List = []
    if data.username is not None:
        fields.append("username = ?")
        params.append(data.username)
    if data.nume is not None:
        fields.append("nume = ?")
        params.append(data.nume)
    if data.email is not None:
        fields.append("email = ?")
        params.append(data.email)
    if data.parola is not None:
        fields.append("parola = ?")
        params.append(data.parola)

    if fields:
        params.append(user_id)
        try:
            conn.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", tuple(params))
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            raise HTTPException(status_code=400, detail="Username-ul sau email-ul există deja.")

    row = conn.execute("SELECT id, username, nume, email, profile_image, nr_puncte FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")
    return dict(row)


@app.post("/users/{user_id}/profile-image")
def upload_profile_image(user_id: str, image: UploadFile = File(...)):
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="Nu a fost încărcată nicio imagine.")

    ext = image.filename.rsplit('.', 1)[-1].lower()
    filename = f"user_{user_id}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, 'wb') as f:
        shutil.copyfileobj(image.file, f)

    image_url = f"/uploads/{filename}"

    conn = get_db()
    conn.execute("UPDATE users SET profile_image = ? WHERE id = ?", (image_url, user_id))
    conn.commit()
    row = conn.execute("SELECT id, username, nume, email, profile_image, nr_puncte FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")
    return dict(row)


# ---------------------------------------------------------------------------
# Execuție Aplicație
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
