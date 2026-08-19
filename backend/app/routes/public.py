import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import EventSettings, Track, Registration, Payment

router = APIRouter(prefix="/api/public", tags=["Public"])

@router.get("/event-info")
def get_event_info(db: Session = Depends(get_db)):
    settings = db.query(EventSettings).first()
    if not settings:
        return {
            "event_name": "AGENTX INDIA 2026",
            "tagline": "Build. Automate. Impact.",
            "subtitle": "The 24-Hour AI Agent Hackathon",
            "event_date": "30 August 2026",
            "duration": "24 Hours",
            "max_teams": 100,
            "team_size": 2,
            "fee_per_team": float(os.getenv("FEE_PER_TEAM", 199.0)),
            "upi_id": os.getenv("UPI_ID", "9618164396-3@ybl"),
            "upi_display_name": os.getenv("UPI_DISPLAY_NAME", "agentx2026"),
            "official_email": os.getenv("OFFICIAL_EMAIL", "sivaramakrishna54599@gmail.com"),
            "official_phone": "+91 98765 43210"
        }
    
    # Auto-update placeholders in database if present
    updated = False
    if not settings.upi_id or settings.upi_id == "YOUR_UPI_ID":
        settings.upi_id = os.getenv("UPI_ID", "9618164396-3@ybl")
        updated = True
    if not settings.upi_display_name or settings.upi_display_name in ["YOUR_DISPLAY_NAME", "agentx_2026"]:
        settings.upi_display_name = os.getenv("UPI_DISPLAY_NAME", "agentx2026")
        updated = True
    if not settings.official_email or settings.official_email in ["contact@agentxindia.com", "notifications@agentxindia.com"]:
        settings.official_email = os.getenv("OFFICIAL_EMAIL", "sivaramakrishna54599@gmail.com")
        updated = True
    
    if updated:
        db.commit()
        db.refresh(settings)

    return settings

DEFAULT_CHALLENGE_TRACKS = [
    {
        "id": 1,
        "code": "agentic_ai",
        "value": "agentic_ai",
        "title": "Agentic AI & Autonomous Agents",
        "subtitle": "Autonomous Workflows & Multi-Agent Systems",
        "description": "Build autonomous AI agents and multi-agent workflows that plan, reason, execute tasks, and collaborate to solve complex problems.",
        "icon": "bot"
    },
    {
        "id": 2,
        "code": "ai_education",
        "value": "ai_education",
        "title": "AI for Education",
        "subtitle": "Personalized Learning & Academic Assistance",
        "description": "Build AI agents for personalized learning, AI tutoring, study planning, skill-gap analysis, and automated academic assistance.",
        "icon": "book-open"
    },
    {
        "id": 3,
        "code": "ai_healthcare",
        "value": "ai_healthcare",
        "title": "AI for Healthcare",
        "subtitle": "Medical Diagnostics & Health Assistants",
        "description": "Build AI agents for health monitoring, diagnostic assistance, medical research synthesis, and patient care workflows.",
        "icon": "activity"
    },
    {
        "id": 4,
        "code": "ai_finance",
        "value": "ai_finance",
        "title": "AI for Finance",
        "subtitle": "Fintech, Trading & Fraud Detection",
        "description": "Build AI agents for automated financial analysis, fraud detection, smart budgeting, trading insights, and risk assessment.",
        "icon": "dollar-sign"
    },
    {
        "id": 5,
        "code": "ai_cybersecurity",
        "value": "ai_cybersecurity",
        "title": "AI for Cybersecurity",
        "subtitle": "Threat Analysis & Security Automation",
        "description": "Build agents for phishing detection, threat awareness, vulnerability scanning, automated security analysis, and defense.",
        "icon": "shield-check"
    },
    {
        "id": 6,
        "code": "smart_automation",
        "value": "smart_automation",
        "title": "AI for Smart Automation",
        "subtitle": "Industrial, Enterprise & Process Automation",
        "description": "Build AI agents for workflow automation, smart campus/city resource management, inventory control, and enterprise operations.",
        "icon": "cpu"
    }
]

@router.get("/tracks")
def get_tracks(db: Session = Depends(get_db)):
    tracks = db.query(Track).filter(Track.is_active == True).all()
    if not tracks:
        return DEFAULT_CHALLENGE_TRACKS
    return [
        {
            "id": t.id,
            "code": t.code or f"track_{t.id}",
            "value": t.code or f"track_{t.id}",
            "title": t.title,
            "subtitle": t.subtitle,
            "description": t.description,
            "icon": t.icon
        }
        for t in tracks
    ]

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    settings = db.query(EventSettings).first()
    max_teams = settings.max_teams if settings else 100

    # Count only verified confirmed teams
    confirmed_teams = db.query(Registration).filter(
        Registration.status.in_(["CONFIRMED", "PAID"])
    ).count()

    is_registration_open = confirmed_teams < max_teams

    return {
        "paid_teams": confirmed_teams,
        "confirmed_teams": confirmed_teams,
        "max_teams": max_teams,
        "teams_registered_text": f"{confirmed_teams} / {max_teams} Teams Registered",
        "slots_remaining": max(0, max_teams - confirmed_teams),
        "is_registration_open": is_registration_open
    }

@router.get("/faq")
def get_faq():
    return [
        {
            "question": "What is AGENTX INDIA 2026?",
            "answer": "AGENTX INDIA 2026 is a 24-hour national hackathon where two-member teams build autonomous, intelligent AI agents that solve real-world industry and social problems."
        },
        {
            "question": "What is the registration fee?",
            "answer": "The registration fee is ₹199 per team for 2 members."
        },
        {
            "question": "How many members can be in a team?",
            "answer": "Every team must consist of exactly 2 members. Individual or 3+ member registrations are not permitted."
        },
        {
            "question": "Is there a limit on the number of teams?",
            "answer": "Yes. Participation is strictly limited to 100 teams (200 participants) on a first-come, first-served basis. Registration automatically closes once 100 confirmed teams are reached."
        },
        {
            "question": "How does payment & verification work?",
            "answer": "Pay ₹199 using the provided UPI QR code, enter your UTR / Transaction ID, and submit for verification. The organizer manually verifies the payment against the bank transaction, after which your status is marked CONFIRMED and your permanent Team ID (e.g., AX001) is generated."
        },
        {
            "question": "What technologies can we use?",
            "answer": "You can use any programming language, framework, or LLM API (e.g., OpenAI, Gemini, Claude, Llama, LangChain, AutoGen, CrewAI, custom Python agents) to build your agentic workflow."
        },
        {
            "question": "How do certificates and verification work?",
            "answer": "All eligible participating teams receive digital certificates equipped with a unique QR code. Anyone can scan the QR code to publicly verify the authenticity of the certificate on our official portal."
        },
        {
            "question": "What is the refund policy?",
            "answer": "Registration fee of ₹199 per team is non-refundable once paid, except in the event of hackathon cancellation by the organizers."
        }
    ]
