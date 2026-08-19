import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Float
from sqlalchemy.orm import relationship
from app.database.session import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EventSettings(Base):
    __tablename__ = "event_settings"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), default="AGENTX INDIA 2026")
    tagline = Column(String(255), default="Build. Automate. Impact.")
    subtitle = Column(String(255), default="The 24-Hour AI Agent Hackathon")
    event_date = Column(String(100), default="30 August 2026")
    duration = Column(String(50), default="24 Hours")
    max_teams = Column(Integer, default=100)
    team_size = Column(Integer, default=2)
    fee_per_team = Column(Float, default=199.0)
    upi_id = Column(String(100), default="9618164396-3@ybl")
    upi_display_name = Column(String(100), default="agentx2026")
    payment_qr_image = Column(Text, nullable=True)
    official_email = Column(String(100), default="sivaramakrishna54599@gmail.com")
    official_phone = Column(String(50), default="+91 98765 43210")
    website_url = Column(String(255), default="https://agentxindia.com")
    linkedin_url = Column(String(255), default="https://linkedin.com/company/agentx-india")
    github_url = Column(String(255), default="https://github.com/agentx-india")
    discord_url = Column(String(255), default="https://discord.gg/agentxindia")
    organizer_name = Column(String(100), default="AGENTX INDIA Organizing Team")
    organizer_logo = Column(Text, nullable=True)
    certificate_logo = Column(Text, nullable=True)
    refund_policy = Column(Text, default="Registration fee of ₹199 per team is non-refundable except in case of hackathon cancellation by organizers.")
    terms_and_conditions = Column(Text, default="Participants must adhere to code of conduct and hackathon rules.")
    privacy_policy = Column(Text, default="We protect your data and do not sell information to third parties.")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=True, index=True)
    title = Column(String(100), nullable=False)
    subtitle = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    icon = Column(String(50), default="bot")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    registrations = relationship("Registration", back_populates="track")

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    college = Column(String(150), nullable=False)
    github = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    portfolio = Column(String(255), nullable=True)
    skills = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String(20), unique=True, nullable=True, index=True) # AX001, AX002, etc. (Assigned ONLY after Admin payment verification)
    team_name = Column(String(100), unique=True, nullable=False, index=True)
    college = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    challenge_track = Column(String(50), nullable=True)

    member1_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    member2_id = Column(Integer, ForeignKey("participants.id"), nullable=False)

    # Registration Status: DRAFT, PAYMENT_PENDING, PAYMENT_VERIFICATION, CONFIRMED, REJECTED, DISQUALIFIED
    status = Column(String(30), default="PAYMENT_PENDING", index=True)
    # Payment Status: UNPAID, PENDING, VERIFIED, REJECTED, REFUNDED
    payment_status = Column(String(20), default="PENDING")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    track = relationship("Track", back_populates="registrations")
    member1 = relationship("Participant", foreign_keys=[member1_id])
    member2 = relationship("Participant", foreign_keys=[member2_id])
    payments = relationship("Payment", back_populates="registration")
    certificates = relationship("Certificate", back_populates="registration")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=False)
    team_id = Column(String(20), nullable=True)
    
    amount = Column(Float, nullable=False, default=199.0) # In Rupees (₹199)
    amount_in_paise = Column(Integer, nullable=True, default=19900)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(20), default="UPI")
    upi_id = Column(String(100), nullable=True)
    utr = Column(String(100), index=True, nullable=True)
    payment_screenshot = Column(String(255), nullable=True)
    
    # Legacy Razorpay fields (optional for backward compatibility)
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    razorpay_payment_id = Column(String(100), nullable=True, index=True)
    razorpay_signature = Column(String(255), nullable=True)
    
    # Payment Status: PENDING, VERIFIED, REJECTED, REFUND_PENDING, REFUNDED
    status = Column(String(30), default="PENDING", index=True)
    admin_note = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    registration = relationship("Registration", back_populates="payments")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=False)
    processed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String(50), unique=True, nullable=False, index=True) # e.g. AX2026-P-1001
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=False)
    team_id = Column(String(20), nullable=False)
    participant_name = Column(String(100), nullable=False)
    team_name = Column(String(100), nullable=False)
    track_title = Column(String(100), nullable=False)
    
    # Types: PARTICIPATION, WINNER, RUNNER_UP, FINALIST, MENTOR, JUDGE, VOLUNTEER, ORGANIZER
    certificate_type = Column(String(30), default="PARTICIPATION", index=True)
    verification_token = Column(String(100), unique=True, nullable=False)
    
    # Eligibility & Issue status: DRAFT, GENERATED, SENT, REVOKED
    status = Column(String(20), default="GENERATED")
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    download_count = Column(Integer, default=0)

    participant = relationship("Participant")
    registration = relationship("Registration", back_populates="certificates")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
