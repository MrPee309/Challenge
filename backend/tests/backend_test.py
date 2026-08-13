"""TCHAK backend API tests"""
import os, io, uuid, pytest, requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://defi-jeje.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

TEST_EMAIL = "test@tchak.ht"
TEST_PASS = "test123"


@pytest.fixture(scope="session")
def sess():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def test_token(sess):
    r = sess.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
    assert r.status_code == 200, f"login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def new_user(sess):
    # Register a fresh user
    uniq = uuid.uuid4().hex[:8]
    payload = {
        "email": f"TEST_{uniq}@tchak.ht",
        "password": "pass1234",
        "name": f"Test {uniq}",
        "username": f"test_{uniq}",
        "location": "Port-au-Prince",
    }
    r = sess.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == payload["email"].lower()
    return {"payload": payload, "token": data["token"], "user": data["user"]}


class TestAuth:
    def test_register_returns_token_user(self, new_user):
        assert new_user["token"]
        assert new_user["user"]["username"] == new_user["payload"]["username"]

    def test_login_test_user(self, test_token):
        assert test_token

    def test_login_invalid(self, sess):
        r = sess.post(f"{API}/auth/login", json={"email": "nope@tchak.ht", "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, sess, test_token):
        r = sess.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {test_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == TEST_EMAIL

    def test_me_no_token(self, sess):
        r = sess.get(f"{API}/auth/me", headers={"Authorization": ""})
        assert r.status_code == 401


class TestCategoriesChallenges:
    def test_categories(self, sess):
        r = sess.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 11
        assert all("key" in c and "ht" in c for c in cats)

    def test_challenges_list(self, sess):
        r = sess.get(f"{API}/challenges")
        assert r.status_code == 200
        ch = r.json()
        assert len(ch) == 11
        assert all("participations_count" in c for c in ch)

    def test_featured(self, sess):
        r = sess.get(f"{API}/challenges/featured")
        assert r.status_code == 200
        assert r.json().get("id")

    def test_challenge_detail_and_participations(self, sess):
        ch = sess.get(f"{API}/challenges").json()[0]
        cid = ch["id"]
        r = sess.get(f"{API}/challenges/{cid}")
        assert r.status_code == 200
        r2 = sess.get(f"{API}/challenges/{cid}/participations")
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)


class TestVoteLeaderboard:
    def test_leaderboard(self, sess):
        r = sess.get(f"{API}/leaderboard")
        assert r.status_code == 200
        d = r.json()
        assert "participations" in d and "creators" in d

    def test_vote_toggle(self, sess, test_token):
        # find a participation
        ch = sess.get(f"{API}/challenges").json()
        pid = None
        for c in ch:
            parts = sess.get(f"{API}/challenges/{c['id']}/participations").json()
            if parts:
                pid = parts[0]["id"]
                initial_votes = parts[0]["votes"]
                break
        assert pid, "No participation found to vote"

        headers = {"Authorization": f"Bearer {test_token}"}
        r1 = sess.post(f"{API}/votes", json={"participation_id": pid}, headers=headers)
        assert r1.status_code == 200
        v1 = r1.json()
        r2 = sess.post(f"{API}/votes", json={"participation_id": pid}, headers=headers)
        assert r2.status_code == 200
        v2 = r2.json()
        # Toggled twice => same as initial
        assert v1["has_voted"] != v2["has_voted"]

    def test_vote_requires_auth(self, sess):
        r = sess.post(f"{API}/votes", json={"participation_id": "xxx"})
        assert r.status_code == 401


class TestParticipationUpload:
    def test_upload_participation(self, test_token):
        ch = requests.get(f"{API}/challenges").json()[0]
        # 1x1 PNG
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
            "890000000d49444154789c6360000000000200015e" "f34f000000"
            "0049454e44ae426082"
        )
        files = {"file": ("t.png", io.BytesIO(png), "image/png")}
        data = {"challenge_id": ch["id"], "caption": "TEST_upload"}
        r = requests.post(f"{API}/participations", data=data, files=files,
                          headers={"Authorization": f"Bearer {test_token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["challenge_id"] == ch["id"]
        assert body["media_url"].startswith("/api/media/")
        # Fetch media
        fid = body["media_url"].split("/")[-1]
        m = requests.get(f"{API}/media/{fid}")
        assert m.status_code == 200
        assert len(m.content) > 0


class TestUserProfile:
    def test_get_user_by_username(self, sess):
        r = sess.get(f"{API}/users/testuser")
        assert r.status_code == 200
        d = r.json()
        assert "user" in d and "participations" in d
        assert d["user"]["username"] == "testuser"
