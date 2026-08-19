from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

# Participant Schemas
class ParticipantCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    college: str = Field(..., min_length=2, max_length=150)
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    skills: Optional[str] = None

class ParticipantResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    college: str
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    skills: Optional[str] = None

    class Config:
        from_attributes = True

# Team Registration Schemas
class TeamRegistrationCreate(BaseModel):
    team_name: str = Field(..., min_length=3, max_length=100)
    college: str = Field(..., min_length=2, max_length=150)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    challenge_track: Optional[str] = Field(None, min_length=1, max_length=100)
    track_id: Optional[int] = None
    member1: ParticipantCreate
    member2: ParticipantCreate

    @validator('member2')
    def validate_unique_emails(cls, member2, values):
        member1 = values.get('member1')
        if member1:
            if member1.email.lower() == member2.email.lower():
                raise ValueError("Member 1 and Member 2 must have distinct email addresses.")
            if member1.phone.strip() == member2.phone.strip():
                raise ValueError("Member 1 and Member 2 must have distinct phone numbers.")
        return member2

class TeamRegistrationResponse(BaseModel):
    id: int
    team_id: Optional[str] = None
    team_name: str
    college: str
    city: str
    state: str
    challenge_track: Optional[str] = None
    track_id: int
    track_title: Optional[str] = None
    member1: ParticipantResponse
    member2: ParticipantResponse
    status: str
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Payment Schemas
class SubmitUTRRequest(BaseModel):
    registration_id: int
    utr: str = Field(..., min_length=4, max_length=100)

class SubmitUTRResponse(BaseModel):
    success: bool
    message: str
    payment_id: int
    registration_id: int
    team_name: str
    status: str
    amount: float = 199.0

class AdminVerifyPaymentRequest(BaseModel):
    payment_id: int
    admin_note: Optional[str] = None

class AdminRejectPaymentRequest(BaseModel):
    payment_id: int
    rejection_reason: str = Field(..., min_length=2, max_length=255)
    admin_note: Optional[str] = None

# Admin & Auth Schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class TrackCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: str
    icon: str = "bot"
    is_active: bool = True

class TrackResponse(TrackCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EventSettingsUpdate(BaseModel):
    event_name: Optional[str] = None
    tagline: Optional[str] = None
    subtitle: Optional[str] = None
    event_date: Optional[str] = None
    duration: Optional[str] = None
    max_teams: Optional[int] = None
    team_size: Optional[int] = None
    fee_per_team: Optional[float] = None
    upi_id: Optional[str] = None
    upi_display_name: Optional[str] = None
    payment_qr_image: Optional[str] = None
    official_email: Optional[str] = None
    official_phone: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    discord_url: Optional[str] = None
    organizer_name: Optional[str] = None
    refund_policy: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    privacy_policy: Optional[str] = None

class CertificateGenerateRequest(BaseModel):
    registration_id: int
    participant_id: int
    certificate_type: str = "PARTICIPATION" # PARTICIPATION, WINNER, RUNNER_UP, FINALIST, etc.

class CertificateVerifyResponse(BaseModel):
    valid: bool
    certificate_id: Optional[str] = None
    participant_name: Optional[str] = None
    team_name: Optional[str] = None
    team_id: Optional[str] = None
    track_title: Optional[str] = None
    certificate_type: Optional[str] = None
    event_date: Optional[str] = None
    generated_at: Optional[datetime] = None
    message: Optional[str] = None

class AdminDashboardMetrics(BaseModel):
    total_teams: int
    confirmed_teams: int
    pending_payments: int
    verified_payments: int
    rejected_payments: int
    teams_remaining: int
    total_verified_revenue: float
    participants_count: int
    certificates_count: int
    max_teams: int

