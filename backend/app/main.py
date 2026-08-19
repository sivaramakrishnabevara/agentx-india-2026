import os
from dotenv import load_dotenv

# Load .env file from project root or current working directory
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine, Base, SessionLocal
from app.models.models import Admin, EventSettings, Track
from app.auth.security import get_password_hash
from sqlalchemy import text
from app.routes import public, registration, payments, certificates, admin

# Create database tables
Base.metadata.create_all(bind=engine)

def auto_migrate_sqlite():
    try:
        with engine.connect() as conn:
            # 1. EventSettings table columns
            res = conn.execute(text("PRAGMA table_info(event_settings);")).fetchall()
            cols = [r[1] for r in res]
            if cols:
                if "upi_id" not in cols:
                    conn.execute(text("ALTER TABLE event_settings ADD COLUMN upi_id VARCHAR DEFAULT '9618164396-3@ybl';"))
                if "upi_display_name" not in cols:
                    conn.execute(text("ALTER TABLE event_settings ADD COLUMN upi_display_name VARCHAR DEFAULT 'agentx2026';"))
                if "payment_qr_image" not in cols:
                    conn.execute(text("ALTER TABLE event_settings ADD COLUMN payment_qr_image VARCHAR;"))

            # 2. Payments table columns
            res_p = conn.execute(text("PRAGMA table_info(payments);")).fetchall()
            cols_p = [r[1] for r in res_p]
            if cols_p:
                if "payment_method" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN payment_method VARCHAR DEFAULT 'UPI';"))
                if "upi_id" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN upi_id VARCHAR;"))
                if "utr" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN utr VARCHAR;"))
                if "payment_screenshot" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN payment_screenshot VARCHAR;"))
                if "submitted_at" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN submitted_at DATETIME;"))
                if "verified_at" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN verified_at DATETIME;"))
                if "verified_by" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN verified_by VARCHAR;"))
                if "admin_note" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN admin_note VARCHAR;"))
                if "rejection_reason" not in cols_p:
                    conn.execute(text("ALTER TABLE payments ADD COLUMN rejection_reason VARCHAR;"))

            # 3. Tracks table columns
            res_t = conn.execute(text("PRAGMA table_info(tracks);")).fetchall()
            cols_t = [r[1] for r in res_t]
            if cols_t and "code" not in cols_t:
                conn.execute(text("ALTER TABLE tracks ADD COLUMN code VARCHAR;"))

            # 4. Registrations table columns
            res_r = conn.execute(text("PRAGMA table_info(registrations);")).fetchall()
            cols_r = [r[1] for r in res_r]
            if cols_r and "challenge_track" not in cols_r:
                conn.execute(text("ALTER TABLE registrations ADD COLUMN challenge_track VARCHAR;"))

            conn.commit()
    except Exception as e:
        print(f"[Auto Migrate Notice]: {e}")

auto_migrate_sqlite()

app = FastAPI(
    title="AGENTX INDIA 2026 Hackathon Management Platform API",
    description="Official API for AGENTX INDIA 2026 — 24-Hour AI Agent Hackathon",
    version="1.0.0"
)

# Enable CORS for Frontend React app
raw_cors = os.getenv("CORS_ORIGINS", "")
custom_origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
frontend_env = os.getenv("FRONTEND_URL", "").strip()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://agentxindia2026.netlify.app"
]
if frontend_env and frontend_env not in origins:
    origins.append(frontend_env)
for o in custom_origins:
    if o not in origins:
        origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(public.router)
app.include_router(registration.router)
app.include_router(payments.router)
app.include_router(certificates.router)
app.include_router(admin.router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        # 1. Initialize Event Settings if empty or update old pricing / UPI settings
        upi_id_env = os.getenv("UPI_ID", "9618164396-3@ybl")
        upi_display_name_env = os.getenv("UPI_DISPLAY_NAME", "agentx2026")
        official_email_env = os.getenv("OFFICIAL_EMAIL", "sivaramakrishna54599@gmail.com")
        fee_env = float(os.getenv("FEE_PER_TEAM", 199.0))

        settings = db.query(EventSettings).first()
        if not settings:
            settings = EventSettings(
                event_name="AGENTX INDIA 2026",
                tagline="Build. Automate. Impact.",
                subtitle="The 24-Hour AI Agent Hackathon",
                event_date="30 August 2026",
                duration="24 Hours",
                max_teams=100,
                team_size=2,
                fee_per_team=fee_env,
                upi_id=upi_id_env,
                upi_display_name=upi_display_name_env,
                official_email=official_email_env,
                official_phone="+91 98765 43210"
            )
            db.add(settings)
            db.commit()
        else:
            db.query(EventSettings).filter(EventSettings.id == settings.id).update({
                "upi_id": upi_id_env,
                "upi_display_name": upi_display_name_env,
                "official_email": official_email_env,
                "fee_per_team": fee_env
            })
            db.commit()

        # 2. Initialize Default Admin if empty
        admin_username = os.getenv("ADMIN_INITIAL_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_INITIAL_PASSWORD", "admin@agentx2026")
        admin_user = db.query(Admin).filter(Admin.username == admin_username).first()
        if not admin_user:
            admin_user = Admin(
                username=admin_username,
                password_hash=get_password_hash(admin_password)
            )
            db.add(admin_user)

        # 3. Seed/Sync 6 Default Challenge Tracks
        expected_tracks = [
            {
                "id": 1,
                "code": "agentic_ai",
                "title": "Agentic AI & Autonomous Agents",
                "subtitle": "Autonomous Workflows & Multi-Agent Systems",
                "description": "Build autonomous AI agents and multi-agent workflows that plan, reason, execute tasks, and collaborate to solve complex problems.",
                "icon": "bot"
            },
            {
                "id": 2,
                "code": "ai_education",
                "title": "AI for Education",
                "subtitle": "Personalized Learning & Academic Assistance",
                "description": "Build AI agents for personalized learning, AI tutoring, study planning, skill-gap analysis, and automated academic assistance.",
                "icon": "book-open"
            },
            {
                "id": 3,
                "code": "ai_healthcare",
                "title": "AI for Healthcare",
                "subtitle": "Medical Diagnostics & Health Assistants",
                "description": "Build AI agents for health monitoring, diagnostic assistance, medical research synthesis, and patient care workflows.",
                "icon": "activity"
            },
            {
                "id": 4,
                "code": "ai_finance",
                "title": "AI for Finance",
                "subtitle": "Fintech, Trading & Fraud Detection",
                "description": "Build AI agents for automated financial analysis, fraud detection, smart budgeting, trading insights, and risk assessment.",
                "icon": "dollar-sign"
            },
            {
                "id": 5,
                "code": "ai_cybersecurity",
                "title": "AI for Cybersecurity",
                "subtitle": "Threat Analysis & Security Automation",
                "description": "Build agents for phishing detection, threat awareness, vulnerability scanning, automated security analysis, and defense.",
                "icon": "shield-check"
            },
            {
                "id": 6,
                "code": "smart_automation",
                "title": "AI for Smart Automation",
                "subtitle": "Industrial, Enterprise & Process Automation",
                "description": "Build AI agents for workflow automation, smart campus/city resource management, inventory control, and enterprise operations.",
                "icon": "cpu"
            }
        ]

        for tr_data in expected_tracks:
            existing = db.query(Track).filter((Track.id == tr_data["id"]) | (Track.code == tr_data["code"])).first()
            if not existing:
                t = Track(
                    id=tr_data["id"],
                    code=tr_data["code"],
                    title=tr_data["title"],
                    subtitle=tr_data["subtitle"],
                    description=tr_data["description"],
                    icon=tr_data["icon"]
                )
                db.add(t)
            else:
                existing.code = tr_data["code"]
                existing.title = tr_data["title"]
                existing.subtitle = tr_data["subtitle"]
                existing.description = tr_data["description"]
                existing.icon = tr_data["icon"]

        db.commit()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "event": "AGENTX INDIA 2026",
        "tagline": "Build. Automate. Impact.",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "healthy": True,
        "event": "AGENTX INDIA 2026"
    }
