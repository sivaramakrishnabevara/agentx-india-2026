import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

def get(path, headers=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers or {})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post(path, data=None, headers=None):
    headers = headers or {}
    headers["Content-Type"] = "application/json"
    body = json.dumps(data).encode() if data is not None else b""
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post_form(path, fields, headers=None):
    headers = headers or {}
    encoded_data = urllib.parse.urlencode(fields).encode()
    headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(f"{BASE_URL}{path}", data=encoded_data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def run_tests():
    print("--- 1. Testing Event Info ---")
    info = get("/api/public/event-info")
    print("Event Name:", info.get("event_name"))
    print("Fee Per Team:", info.get("fee_per_team"))
    assert info.get("event_name") == "AGENTX INDIA 2026"
    assert info.get("fee_per_team") == 199.0

    print("\n--- 2. Testing Stats Counter ---")
    stats = get("/api/public/stats")
    print("Live Stats:", stats)

    print("\n--- 3. Testing Tracks ---")
    tracks = get("/api/public/tracks")
    print(f"Loaded {len(tracks)} tracks.")
    assert len(tracks) >= 5

    print("\n--- 4. Testing Team Registration Creation ---")
    ts = int(urllib.request.time.time())
    reg_payload = {
        "team_name": f"TestTeam_{ts}",
        "college": "IIT Delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "track_id": 1,
        "member1": {
            "full_name": "Siddharth Verma",
            "email": f"siddharth_{ts}@test.com",
            "phone": f"981{ts % 10000000:07d}",
            "college": "IIT Delhi"
        },
        "member2": {
            "full_name": "Ridhi Kapoor",
            "email": f"ridhi_{ts}@test.com",
            "phone": f"982{ts % 10000000:07d}",
            "college": "IIT Delhi"
        }
    }
    reg_res = post("/api/registration/create", reg_payload)
    print("Registration Created ID:", reg_res.get("id"))
    reg_id = reg_res.get("id")

    print("\n--- 5. Testing UPI UTR Submission ---")
    utr_val = f"UTR{ts}"
    utr_res = post_form("/api/payments/submit-utr", {"registration_id": reg_id, "utr": utr_val})
    print("UTR Submission Result:", utr_res)
    assert utr_res["success"] == True
    payment_id = utr_res["payment_id"]

    print("\n--- 6. Testing Admin Login ---")
    admin_login = post("/api/admin/login", {"username": "admin", "password": "admin@agentx2026"})
    print("Admin Token Received:", admin_login["access_token"][:20] + "...")
    token = admin_login["access_token"]
    admin_headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 7. Testing Admin View Details API Endpoint ---")
    team_details = get(f"/api/admin/teams/{reg_id}", headers=admin_headers)
    print("Fetched Team Details for Reg ID:", team_details.get("id"))
    assert team_details["team_name"] == f"TestTeam_{ts}"
    assert team_details["member1"]["email"] == f"siddharth_{ts}@test.com"
    assert team_details["member2"]["email"] == f"ridhi_{ts}@test.com"
    assert team_details["payment"]["utr"] == utr_val

    print("\n--- 8. Testing Admin Manual Payment Verification ---")
    verify_res = post(f"/api/admin/payments/{payment_id}/verify", {"payment_id": payment_id, "admin_note": "Bank statement matched"}, headers=admin_headers)
    print("Admin Verification Result:", verify_res)
    assert verify_res["success"] == True
    print("Assigned Sequential Team ID:", verify_res["team_id"])

    print("\n--- 9. Testing Admin Bulk Certificate Generation ---")
    gen_res = post("/api/admin/certificates/generate-bulk?certificate_type=PARTICIPATION", headers=admin_headers)
    print("Bulk Cert Generation Result:", gen_res)

    print("\n--- 10. Testing Public Certificate Verification Portal ---")
    certs = get("/api/admin/certificates/list", headers=admin_headers)
    assert len(certs) > 0
    sample_cert_id = certs[0]["certificate_id"]
    print("Sample Certificate ID:", sample_cert_id)

    cert_res = get(f"/api/certificates/verify/{sample_cert_id}")
    print("Public Certificate Verification Result - Valid:", cert_res.get("valid"))
    assert cert_res["valid"] == True

    print("\n--- 11. Testing Admin Dashboard Metrics ---")
    metrics = get("/api/admin/metrics", headers=admin_headers)
    print("Admin Metrics:", metrics)
    assert metrics["confirmed_teams"] > 0

    print("\n=== ALL UPI QR + UTR + ADMIN VERIFICATION TESTS PASSED PERFECTLY ===")

if __name__ == "__main__":
    import time
    urllib.request.time = time
    run_tests()
