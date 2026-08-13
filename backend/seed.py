import uuid
import bcrypt
from datetime import datetime, timezone, timedelta

def _hash(pw):
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

AVATARS = [
    "https://images.unsplash.com/photo-1590862133252-c6991ebadef9?w=400",
    "https://images.unsplash.com/photo-1536896407451-6e3dd976edd1?w=400",
    "https://images.unsplash.com/photo-1623193904313-4372c49db04c?w=400",
    "https://images.unsplash.com/photo-1616268164880-673b3ba611bb?w=400",
    "https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?w=400",
    "https://images.unsplash.com/photo-1576775068668-c147f14c36f7?w=400",
]

FEED = {
    "dance": [
        "https://images.unsplash.com/photo-1512264815082-9999c2d4894d?w=800",
        "https://images.unsplash.com/photo-1588671815815-b0cd3b2a9189?w=800",
    ],
    "music": [
        "https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=800",
        "https://images.pexels.com/photos/2932418/pexels-photo-2932418.jpeg?w=800",
    ],
    "fashion": [
        "https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?w=800",
        "https://images.unsplash.com/photo-1635650804483-2a77a8c9e728?w=800",
        "https://images.pexels.com/photos/33786494/pexels-photo-33786494.jpeg?w=800",
        "https://images.pexels.com/photos/15293706/pexels-photo-15293706.jpeg?w=800",
    ],
    "sports": [
        "https://images.unsplash.com/photo-1635620634588-ab05dd5fbac2?w=800",
        "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?w=800",
        "https://images.unsplash.com/photo-1722962674182-5edc27f7ae30?w=800",
    ],
    "trending": [
        "https://images.unsplash.com/photo-1681641095463-b4d3693a0ee3?w=800",
        "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800",
        "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800",
    ],
    "humor": [
        "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800",
        "https://images.unsplash.com/photo-1681641095463-b4d3693a0ee3?w=800",
    ],
    "culture": [
        "https://images.pexels.com/photos/5956950/pexels-photo-5956950.jpeg?w=800",
        "https://images.pexels.com/photos/2932418/pexels-photo-2932418.jpeg?w=800",
    ],
    "gaming": [
        "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800",
    ],
    "talent": [
        "https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=800",
    ],
}

def cover(cat):
    return FEED.get(cat, FEED["trending"])[0]

USERS = [
    {"name": "Kendy Joseph", "username": "kendy_pap", "location": "Port-au-Prince"},
    {"name": "Woodline Pierre", "username": "woodline_kap", "location": "Cap-Haïtien"},
    {"name": "Steevenson Louis", "username": "steeve_officiel", "location": "Delmas"},
    {"name": "Fabiola Charles", "username": "fabi_jacmel", "location": "Jacmel"},
    {"name": "Djeff Toussaint", "username": "djeff_beatz", "location": "Pétion-Ville"},
    {"name": "Schnaida Michel", "username": "schnaida_x", "location": "Gonaïves"},
    {"name": "Ricardo Célestin", "username": "ricky_lakay", "location": "Les Cayes"},
    {"name": "Naïka Dorléans", "username": "naika_vibes", "location": "Carrefour"},
]

CHALLENGES = [
    {"category": "dance", "emoji": "💃", "title": "Ann Danse Konpa 💃",
     "desc": "Montre pi bèl mouvman konpa ou! Ki moun k ap fè tout moun kanpe gade?",
     "featured": True, "today": True, "score": 980},
    {"category": "music", "emoji": "🎵", "title": "Cover Mizik Rasin 🎵",
     "desc": "Chante yon mòso mizik rasin oswa rap kreyòl. Voye vwa w ban nou!",
     "today": True, "score": 870},
    {"category": "fashion", "emoji": "👕", "title": "Drip Lakay 👕",
     "desc": "Ki pi bèl estil? Sneakers, chemiz, tout drip la — montre l!",
     "today": True, "score": 910},
    {"category": "humor", "emoji": "😂", "title": "Fè Nou Ri 😂",
     "desc": "Blag, sketch, moman komik — si w fè nou ri, ou genyen!",
     "score": 760},
    {"category": "sports", "emoji": "⚽", "title": "Freestyle Foutbòl ⚽",
     "desc": "Montre skill ou ak boul la. Freestyle, penalty, tout bagay konte.",
     "score": 690},
    {"category": "gaming", "emoji": "🎮", "title": "Best Play Gaming 🎮",
     "desc": "Voye clip pi bèl play ou nan FIFA, Free Fire oswa lòt jwèt.",
     "score": 540},
    {"category": "talent", "emoji": "🎤", "title": "Montre Talan W 🎤",
     "desc": "Chante, jwe enstriman, poezi... tout talan byenvini!",
     "score": 620},
    {"category": "culture", "emoji": "🇭🇹", "title": "Manje Peyi Nou 🇭🇹",
     "desc": "Montre pi bon plat ayisyen ou konn fè. Diri kole? Griyo? Ann wè!",
     "score": 800},
    {"category": "knowledge", "emoji": "📚", "title": "Kiyès Ki Konnen? 📚",
     "desc": "Reponn kesyon sou istwa ak kilti Ayiti. Montre sa w konnen!",
     "score": 430},
    {"category": "opinions", "emoji": "❤️", "title": "Ki Sa W Panse? ❤️",
     "desc": "Bay opinyon w sou sijè cho yo. Debat la ouvè!",
     "score": 510},
    {"category": "trending", "emoji": "🔥", "title": "Challenge Rasanble 🔥",
     "desc": "Challenge k ap fè bri kounye a! Antre epi montre sa ou kapab.",
     "today": True, "score": 1000},
]

CAPTIONS = [
    "Men sa m gen pou nou 🔥", "Nou pa ka rate sa a 👀", "Lakay se lakay ❤️🇭🇹",
    "Vote pou mwen fanmi! 🙏", "Sa se vibe la 💯", "Ann ale! 🚀",
    "Se pa jwèt non 😎", "Tout moun ap pale de sa 🔥", "Fè m wè nou renmen l ❤️",
    "Kèk mouvman pou nou 💃", "Represent 🇭🇹", "Nou la nou la! 👑",
]

async def seed_data(db):
    if await db.challenges.count_documents({}) > 0:
        return

    now = datetime.now(timezone.utc)

    # demo users
    user_ids = []
    for i, u in enumerate(USERS):
        uid = str(uuid.uuid4())
        user_ids.append(uid)
        await db.users.insert_one({
            "id": uid, "email": f"{u['username']}@tchak.ht",
            "password_hash": _hash("tchak123"), "name": u["name"], "username": u["username"],
            "location": u["location"], "avatar": AVATARS[i % len(AVATARS)],
            "bio": "Jèn ayisyen kreyatif 🇭🇹", "wins": 0, "total_votes": 0,
            "participations_count": 0, "created_at": now.isoformat(),
        })

    # test user
    test_uid = str(uuid.uuid4())
    await db.users.insert_one({
        "id": test_uid, "email": "test@tchak.ht", "password_hash": _hash("test123"),
        "name": "Test User", "username": "testuser", "location": "Port-au-Prince",
        "avatar": AVATARS[0], "bio": "Kont pou teste 🧪", "wins": 0, "total_votes": 0,
        "participations_count": 0, "created_at": now.isoformat(),
    })

    # challenges + participations
    for ch in CHALLENGES:
        cid = str(uuid.uuid4())
        await db.challenges.insert_one({
            "id": cid, "title": ch["title"], "category": ch["category"], "emoji": ch["emoji"],
            "description": ch["desc"], "cover_image": cover(ch["category"]),
            "is_featured": ch.get("featured", False), "is_today": ch.get("today", False),
            "trending_score": ch["score"],
            "ends_at": (now + timedelta(days=3)).isoformat(),
            "created_at": now.isoformat(),
        })

        media_pool = FEED.get(ch["category"], FEED["trending"])
        n = min(6, max(3, len(media_pool) * 2))
        for j in range(n):
            uidx = (j * 3 + hash(ch["category"]) ) % len(user_ids)
            uid = user_ids[uidx]
            user = await db.users.find_one({"id": uid})
            votes = ((j * 37 + ch["score"]) % 480) + 15
            created = now - timedelta(hours=j * 5 + 1)
            pid = str(uuid.uuid4())
            await db.participations.insert_one({
                "id": pid, "challenge_id": cid, "challenge_title": ch["title"],
                "category": ch["category"], "user_id": uid, "username": user["username"],
                "name": user["name"], "avatar": user["avatar"], "location": user["location"],
                "caption": CAPTIONS[(j + ch["score"]) % len(CAPTIONS)],
                "media_url": media_pool[j % len(media_pool)], "media_type": "image",
                "votes": votes, "created_at": created.isoformat(),
                "created_at_ts": created.timestamp(),
            })
            await db.users.update_one({"id": uid}, {"$inc": {"participations_count": 1, "total_votes": votes}})

    # compute simple wins (top creator per challenge)
    challenges = await db.challenges.find({}).to_list(200)
    for ch in challenges:
        parts = await db.participations.find({"challenge_id": ch["id"]}).sort("votes", -1).to_list(1)
        if parts:
            await db.users.update_one({"id": parts[0]["user_id"]}, {"$inc": {"wins": 1}})
