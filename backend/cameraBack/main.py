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
    nr_puncte: int


class UserPointsUpdate(BaseModel):
    puncte_adaugate: int


# ---------------------------------------------------------------------------
# Prompts & Dicționare de Căutare
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Ești un asistent expert în identificarea deșeurilor și
reciclare. Analizezi imagini și identifici cu precizie tipul de deșeu
(sticlă, plastic, baterii, deșeuri electronice, hârtie/carton, metal,
deșeuri organice, deșeuri periculoase etc.), explicând clar cum trebuie
aruncat sau reciclat corect.

IMPORTANT: Răspunzi EXCLUSIV în format JSON valid, fără text suplimentar,
fără backtick-uri markdown. Structura JSON obligatorie:

{
  "item_name": "Numele obiectului identificat (în română, ex: 'Sticlă de plastic PET')",
  "waste_category": "O categorie STRICT dintre: 'sticla', 'plastic', 'baterii', 'electronice', 'hartie_carton', 'metal', 'organic', 'periculos', 'altele'",
  "description": "Descriere scurtă a obiectului și de ce intră în această categorie (1-3 propoziții)",
  "is_recyclable": true,
  "disposal_instructions": [
    "Pasul 1: ...",
    "Pasul 2: ...",
    "..."
  ],
  "warnings": [
    "Avertisment sau precauție importantă (ex: bateriile NU se aruncă la gunoi menajer)...",
    "..."
  ]
}

Dacă imaginea nu conține un deșeu identificabil, răspunde cu:
{
  "item_name": "Obiect neidentificat",
  "waste_category": "altele",
  "description": "Nu am putut identifica un tip de deșeu în această imagine. Vă rugăm să fotografiați obiectul mai clar.",
  "is_recyclable": false,
  "disposal_instructions": [],
  "warnings": ["Asigurați-vă că obiectul este vizibil și bine iluminat în fotografie."]
}

Răspunde mereu în limba română. Fii precis, concis și prietenos."""

USER_PROMPT = """Analizează această imagine și identifică tipul de deșeu
(sticlă, plastic, baterie, deșeu electronic, hârtie, metal, etc.).
Oferă instrucțiuni clare despre cum trebuie aruncat/reciclat corect și
orice avertismente importante. Răspunde DOAR cu JSON, fără alt text."""

CATEGORY_SEARCH_QUERY = {
    "sticla": "centru de colectare sticla reciclare",
    "plastic": "punct de colectare reciclare plastic",
    "baterii": "punct de colectare baterii uzate reciclare",
    "electronice": "centru de colectare deseuri electronice electrocasnice",
    "hartie_carton": "punct de colectare hartie carton reciclare",
    "metal": "centru de colectare deseuri metalice reciclare fier vechi",
    "organic": "centru de compostare deseuri organice",
    "periculos": "centru de colectare deseuri periculoase",
    "altele": "punct de colectare deseuri reciclabile",
}

GEMINI_TO_LOCAL_BIN_MAP = {
    "plastic": "plastic",
    "sticla": "sticla",
    "hartie_carton": "hartie",
    "electronice": "electronic",
    "baterii": "electronic",
    "metal": "general",
    "organic": "general",
    "periculos": "general",
    "altele": "general"
}


# ---------------------------------------------------------------------------
# Configurare Bază de Date (SQLite)
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect("trash_bins.db")
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
                     id
                     TEXT
                     PRIMARY
                     KEY,
                     username
                     TEXT
                     UNIQUE
                     NOT
                     NULL,
                     nume
                     TEXT
                     NOT
                     NULL,
                     email
                     TEXT
                     UNIQUE
                     NOT
                     NULL,
                     parola
                     TEXT
                     NOT
                     NULL,
                     nr_puncte
                     INTEGER
                     DEFAULT
                     0,
                     created_at
                     TEXT
                     DEFAULT (
                     datetime
                 (
                     'now'
                 ))
                     )
                 """)

    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Gestionare Lifespan Aplicație
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY lipsește din variabilele de mediu. "
            "Creați un fișier .env cu: GOOGLE_API_KEY=AIza..."
        )
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
            "INSERT INTO users (id, username, nume, email, parola, nr_puncte) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, user.username, user.nume, user.email, user.parola, 0)
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


# ---------------------------------------------------------------------------
# Execuție Aplicație
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)