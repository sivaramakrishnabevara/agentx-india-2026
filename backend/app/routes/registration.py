from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Registration, Participant, Track, EventSettings
from app.schemas.schemas import TeamRegistrationCreate, TeamRegistrationResponse

router = APIRouter(prefix="/api/registration", tags=["Registration"])

@router.post("/create", response_model=TeamRegistrationResponse)
def create_team_registration(data: TeamRegistrationCreate, db: Session = Depends(get_db)):
    # 1. Enforce Max 100 confirmed teams limit
    settings = db.query(EventSettings).first()
    max_teams = settings.max_teams if settings else 100

    confirmed_teams_count = db.query(Registration).filter(
        Registration.status == "CONFIRMED"
    ).count()

    if confirmed_teams_count >= max_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="REGISTRATION CLOSED: All 100 teams have already registered and been confirmed."
        )

    # 2. Check Track existence
    track_code = (data.challenge_track.strip() if data.challenge_track else "").lower()
    
    track = None
    if track_code:
        track = db.query(Track).filter(
            (Track.code == track_code) | (Track.title.ilike(track_code))
        ).filter(Track.is_active == True).first()

    if not track and data.track_id:
        track = db.query(Track).filter(Track.id == data.track_id, Track.is_active == True).first()

    if not track and track_code:
        track_map = {
            "agentic_ai": 1,
            "ai_education": 2,
            "ai_healthcare": 3,
            "ai_finance": 4,
            "ai_cybersecurity": 5,
            "smart_automation": 6
        }
        mapped_id = track_map.get(track_code)
        if mapped_id:
            track = db.query(Track).filter(Track.id == mapped_id).first()

    # Fallback to default track 1 if no track match found in DB
    if not track:
        track = db.query(Track).filter(Track.is_active == True).first()

    if not track:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a valid challenge track."
        )

    selected_track_code = track.code or track_code or "agentic_ai"

    # 3. Check Team Name uniqueness
    existing_team = db.query(Registration).filter(
        Registration.team_name.ilike(data.team_name.strip())
    ).first()
    if existing_team:
        if existing_team.status == "CONFIRMED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team name '{data.team_name}' is already registered by a confirmed team. Please choose another team name."
            )

    # 4. Create Participant 1
    p1 = Participant(
        full_name=data.member1.full_name.strip(),
        email=data.member1.email.strip().lower(),
        phone=data.member1.phone.strip(),
        college=data.member1.college.strip(),
        github=data.member1.github,
        linkedin=data.member1.linkedin,
        portfolio=data.member1.portfolio,
        skills=data.member1.skills
    )
    db.add(p1)
    db.flush()

    # 5. Create Participant 2
    p2 = Participant(
        full_name=data.member2.full_name.strip(),
        email=data.member2.email.strip().lower(),
        phone=data.member2.phone.strip(),
        college=data.member2.college.strip(),
        github=data.member2.github,
        linkedin=data.member2.linkedin,
        portfolio=data.member2.portfolio,
        skills=data.member2.skills
    )
    db.add(p2)
    db.flush()

    # 6. Create Registration record (PAYMENT_PENDING state)
    registration = Registration(
        team_name=data.team_name.strip(),
        college=data.college.strip(),
        city=data.city.strip(),
        state=data.state.strip(),
        track_id=track.id,
        challenge_track=selected_track_code,
        member1_id=p1.id,
        member2_id=p2.id,
        status="PAYMENT_PENDING",
        payment_status="PENDING"
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)

    return {
        "id": registration.id,
        "team_id": registration.team_id,
        "team_name": registration.team_name,
        "college": registration.college,
        "city": registration.city,
        "state": registration.state,
        "challenge_track": registration.challenge_track or selected_track_code,
        "track_id": registration.track_id,
        "track_title": track.title,
        "member1": p1,
        "member2": p2,
        "status": registration.status,
        "payment_status": registration.payment_status,
        "created_at": registration.created_at
    }

@router.get("/{registration_id}")
def get_registration_details(registration_id: int, db: Session = Depends(get_db)):
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration record not found.")

    return {
        "id": reg.id,
        "team_id": reg.team_id,
        "team_name": reg.team_name,
        "college": reg.college,
        "city": reg.city,
        "state": reg.state,
        "challenge_track": reg.challenge_track,
        "track_id": reg.track_id,
        "track_title": reg.track.title if reg.track else None,
        "status": reg.status,
        "payment_status": reg.payment_status,
        "member1": reg.member1,
        "member2": reg.member2,
        "created_at": reg.created_at
    }
