from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Form
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import uuid
import jwt
import bcrypt
import requests
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# ---------------- DB ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tchak")

# ---------------- Storage ----------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "tchak"
storage_key = None

def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------- Auth helpers ----------------
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Ou pa konekte")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="ItilizatÃ¨ pa jwenn")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesyon an fini")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token pa valab")

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ---------------- Models ----------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: str
    location: str = "Port-au-Prince"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class VoteIn(BaseModel):
    participation_id: str

def public_user(u: dict, include_email: bool = False) -> dict:
    data = {
        "id": u["id"], "name": u.get("name"), "username": u.get("username"),
        "location": u.get("location"), "avatar": u.get("avatar"),
        "bio": u.get("bio", ""), "wins": u.get("wins", 0),
        "total_votes": u.get("total_votes", 0), "participations_count": u.get("participations_count", 0),
    }
    if include_email:
        data["email"] = u.get("email")
    return data

# ---------------- Auth endpoints ----------------
DEFAULT_AVATARS = [
    "https://images.unsplash.com/photo-1590862133252-c6991ebadef9?w=400",
    "https://images.unsplash.com/photo-1536896407451-6e3dd976edd1?w=400",
    "https://images.unsplash.com/photo-1623193904313-4372c49db04c?w=400",
    "https://images.unsplash.com/photo-1616268164880-673b3ba611bb?w=400",
]

@api_router.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Imel sa a deja itilize")
    if await db.users.find_one({"username": body.username.lower()}):
        raise HTTPException(status_code=400, detail="Non itilizatÃ¨ sa a deja pran")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid, "email": email, "password_hash": hash_password(body.password),
        "name": body.name, "username": body.username.lower(), "location": body.location,
        "avatar": DEFAULT_AVATARS[len(email) % len(DEFAULT_AVATARS)], "bio": "",
        "wins": 0, "total_votes": 0, "participations_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(uid, email)
    return {"token": token, "user": public_user(doc, True)}

@api_router.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Imel oswa modpas pa kÃ²rÃ¨k")
    token = create_access_token(user["id"], email)
    return {"token": token, "user": public_user(user, True)}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user, True)

# ---------------- Categories ----------------
CATEGORIES = [
    {"key": "culture", "emoji": "ð­ð¹", "ht": "Kilti Ayiti", "fr": "Culture HaÃ¯ti", "en": "Haiti Culture"},
    {"key": "music", "emoji": "ðµ", "ht": "Mizik", "fr": "Musique", "en": "Music"},
    {"key": "fashion", "emoji": "ð", "ht": "MÃ²d", "fr": "Mode", "en": "Fashion"},
    {"key": "humor", "emoji": "ð", "ht": "Blag", "fr": "Humour", "en": "Humor"},
    {"key": "sports", "emoji": "â½", "ht": "EspÃ²", "fr": "Sport", "en": "Sports"},
    {"key": "gaming", "emoji": "ð®", "ht": "Gaming", "fr": "Gaming", "en": "Gaming"},
    {"key": "dance", "emoji": "ð", "ht": "Dans", "fr": "Danse", "en": "Dance"},
    {"key": "talent", "emoji": "ð¤", "ht": "Talan", "fr": "Talent", "en": "Talent"},
    {"key": "knowledge", "emoji": "ð", "ht": "Konesans", "fr": "Savoir", "en": "Knowledge"},
    {"key": "opinions", "emoji": "â¤ï¸", "ht": "Opinyon", "fr": "Opinions", "en": "Opinions"},
    {"key": "trending", "emoji": "ð¥", "ht": "K ap fÃ¨ bri", "fr": "Tendances", "en": "Trending"},
]

@api_router.get("/categories")
async def get_categories():
    return CATEGORIES

# ---------------- Challenges ----------------
async def participation_counts(challenge_ids: List[str]) -> dict:
    """Single aggregation query instead of one count_documents() per challenge (avoids N+1)."""
    if not challenge_ids:
        return {}
    cursor = db.participations.aggregate([
        {"$match": {"challenge_id": {"$in": challenge_ids}}},
        {"$group": {"_id": "$challenge_id", "count": {"$sum": 1}}},
    ])
    return {doc["_id"]: doc["count"] async for doc in cursor}

async def enrich_challenge(ch: dict, counts: Optional[dict] = None) -> dict:
    ch.pop("_id", None)
    if counts is not None:
        ch["participations_count"] = counts.get(ch["id"], 0)
    else:
        ch["participations_count"] = await db.participations.count_documents({"challenge_id": ch["id"]})
    return ch

@api_router.get("/challenges")
async def list_challenges(category: Optional[str] = None, sort: str = "trending",
                          user: dict = Depends(get_optional_user)):
    q = {}
    if category and category != "all":
        q["category"] = category
    challenges = await db.challenges.find(q, {"_id": 0}).to_list(200)
    counts = await participation_counts([c["id"] for c in challenges])
    for ch in challenges:
        await enrich_challenge(ch, counts)
    if sort == "today":
        challenges.sort(key=lambda c: (not c.get("is_today", False), -c.get("trending_score", 0)))
    else:
        challenges.sort(key=lambda c: -c.get("trending_score", 0))
    return challenges

@api_router.get("/challenges/featured")
async def featured_challenge(user: dict = Depends(get_optional_user)):
    ch = await db.challenges.find_one({"is_featured": True}, {"_id": 0})
    if not ch:
        ch = await db.challenges.find_one({}, {"_id": 0})
    if ch:
        await enrich_challenge(ch)
    return ch

@api_router.get("/challenges/{challenge_id}")
async def get_challenge(challenge_id: str, user: dict = Depends(get_optional_user)):
    ch = await db.challenges.find_one({"id": challenge_id}, {"_id": 0})
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge pa jwenn")
    await enrich_challenge(ch)
    return ch

# ---------------- Participations ----------------
async def enrich_participation(p: dict, user):
    p.pop("_id", None)
    if user:
        p["has_voted"] = await db.votes.find_one({"user_id": user["id"], "participation_id": p["id"]}) is not None
    else:
        p["has_voted"] = False
    return p

@api_router.get("/challenges/{challenge_id}/participations")
async def challenge_participations(challenge_id: str, user: dict = Depends(get_optional_user)):
    parts = await db.participations.find({"challenge_id": challenge_id}, {"_id": 0}).to_list(500)
    parts.sort(key=lambda p: -p.get("votes", 0))
    for i, p in enumerate(parts):
        p["rank"] = i + 1
        await enrich_participation(p, user)
    return parts

@api_router.get("/participations/feed")
async def feed(user: dict = Depends(get_optional_user)):
    parts = await db.participations.find({}, {"_id": 0}).to_list(500)
    parts.sort(key=lambda p: -p.get("created_at_ts", 0))
    for p in parts:
        await enrich_participation(p, user)
    return parts

@api_router.get("/leaderboard")
async def leaderboard(user: dict = Depends(get_optional_user)):
    parts = await db.participations.find({}, {"_id": 0}).to_list(500)
    parts.sort(key=lambda p: -p.get("votes", 0))
    top_parts = parts[:10]
    for i, p in enumerate(top_parts):
        p["rank"] = i + 1
        await enrich_participation(p, user)
    creators = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    creators.sort(key=lambda u: -u.get("total_votes", 0))
    top_creators = [public_user(u) for u in creators[:10]]
    for i, c in enumerate(top_creators):
        c["rank"] = i + 1
    return {"participations": top_parts, "creators": top_creators}

@api_router.post("/participations")
async def create_participation(
    challenge_id: str = Form(...),
    caption: str = Form(""),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    ch = await db.challenges.find_one({"id": challenge_id})
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge pa jwenn")
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    is_video = (file.content_type or "").startswith("video") or ext in ("mp4", "mov", "webm")
    fid = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{user['id']}/{fid}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    await db.files.insert_one({
        "id": fid, "storage_path": result["path"], "content_type": file.content_type,
        "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat(),
    })
    now = datetime.now(timezone.utc)
    pid = str(uuid.uuid4())
    doc = {
        "id": pid, "challenge_id": challenge_id, "challenge_title": ch["title"],
        "category": ch["category"], "user_id": user["id"], "username": user["username"],
        "name": user["name"], "avatar": user.get("avatar"), "location": user.get("location"),
        "caption": caption, "media_url": f"/api/media/{fid}", "media_type": "video" if is_video else "image",
        "votes": 0, "created_at": now.isoformat(), "created_at_ts": now.timestamp(),
    }
    await db.participations.insert_one(doc)
    await db.users.update_one({"id": user["id"]}, {"$inc": {"participations_count": 1}})
    doc.pop("_id", None)
    doc["has_voted"] = False
    return doc

@api_router.post("/votes")
async def toggle_vote(body: VoteIn, user: dict = Depends(get_current_user)):
    p = await db.participations.find_one({"id": body.participation_id})
    if not p:
        raise HTTPException(status_code=404, detail="Patisipasyon pa jwenn")
    existing = await db.votes.find_one({"user_id": user["id"], "participation_id": body.participation_id})
    if existing:
        await db.votes.delete_one({"_id": existing["_id"]})
        await db.participations.update_one({"id": body.participation_id}, {"$inc": {"votes": -1}})
        await db.users.update_one({"id": p["user_id"]}, {"$inc": {"total_votes": -1}})
        voted = False
    else:
        await db.votes.insert_one({"user_id": user["id"], "participation_id": body.participation_id,
                                   "created_at": datetime.now(timezone.utc).isoformat()})
        await db.participations.update_one({"id": body.participation_id}, {"$inc": {"votes": 1}})
        await db.users.update_one({"id": p["user_id"]}, {"$inc": {"total_votes": 1}})
        voted = True
    updated = await db.participations.find_one({"id": body.participation_id}, {"_id": 0})
    return {"has_voted": voted, "votes": updated["votes"]}

@api_router.get("/users/{username}")
async def get_profile(username: str, user: dict = Depends(get_optional_user)):
    u = await db.users.find_one({"username": username.lower()}, {"_id": 0, "password_hash": 0})
    if not u:
        raise HTTPException(status_code=404, detail="ItilizatÃ¨ pa jwenn")
    parts = await db.participations.find({"user_id": u["id"]}, {"_id": 0}).to_list(500)
    parts.sort(key=lambda p: -p.get("votes", 0))
    for p in parts:
        await enrich_participation(p, user)
    return {"user": public_user(u), "participations": parts}

# ---------------- Media ----------------
@api_router.get("/media/{file_id}")
async def media(file_id: str):
    record = await db.files.find_one({"id": file_id, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, ct = get_object(record["storage_path"])
    return Response(
        content=data,
        media_type=record.get("content_type") or ct,
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )

@api_router.get("/")
async def root():
    return {"app": "TCHAK", "status": "ok"}

app.include_router(api_router)

_cors_origins = [o.strip() for o in os.environ.get('CORS_ORIGINS', '*').split(',') if o.strip()]
# Auth uses a Bearer token (localStorage), not cookies, so credentials aren't needed.
# Browsers also reject the combination of "*" origins with allow_credentials=True.
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    from seed import seed_data
    await seed_data(db)

@app.on_event("shutdown")
async def shutdown():
    client.close()

