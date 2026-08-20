import os
import csv
import io
import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response, File, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Admin, EventSettings, Track, Registration, Participant, Payment, Certificate, AuditLog
from app.schemas.schemas import AdminLogin, Token, EventSettingsUpdate, TrackCreate, AdminDashboardMetrics, AdminVerifyPaymentRequest, AdminRejectPaymentRequest
from app.auth.security import verify_password, create_access_token, get_current_admin, get_password_hash
from app.routes.payments import generate_next_team_id
from app.email.mailer import send_confirmation_email, send_team_confirmation_emails, get_safe_error_message
from app.payments.upi_handler import UPLOAD_DIR, save_payment_screenshot

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

def log_admin_action(db: Session, admin_username: str, action: str, details: str = None):
    log = AuditLog(
        admin_username=admin_username,
        action=action,
        details=details
    )
    db.add(log)
    db.commit()


@router.post("/login", response_model=Token)
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == data.username.strip()).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin username or password."
        )

    access_token = create_access_token(data={"sub": admin.username})
    log_admin_action(db, admin.username, "ADMIN_LOGIN", "Successful admin authentication")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": admin.username
    }

@router.get("/metrics", response_model=AdminDashboardMetrics)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    settings = db.query(EventSettings).first()
    max_teams = settings.max_teams if settings else 100

    total_teams = db.query(Registration).count()
    confirmed_teams = db.query(Registration).filter(Registration.status == "CONFIRMED").count()
    pending_payments = db.query(Payment).filter(Payment.status == "PENDING").count()
    verified_payments = db.query(Payment).filter(Payment.status == "VERIFIED").count()
    rejected_payments = db.query(Payment).filter(Payment.status == "REJECTED").count()
    
    total_verified_revenue = verified_payments * 199.0
    participants_count = db.query(Participant).count()
    certificates_count = db.query(Certificate).count()
    teams_remaining = max(0, max_teams - confirmed_teams)

    return {
        "total_teams": total_teams,
        "confirmed_teams": confirmed_teams,
        "pending_payments": pending_payments,
        "verified_payments": verified_payments,
        "rejected_payments": rejected_payments,
        "teams_remaining": teams_remaining,
        "total_verified_revenue": total_verified_revenue,
        "participants_count": participants_count,
        "certificates_count": certificates_count,
        "max_teams": max_teams
    }

@router.get("/teams")
def get_teams_list(
    query: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    track_id: Optional[int] = Query(None),
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    q = db.query(Registration)

    if status_filter:
        q = q.filter(Registration.status == status_filter.upper())
    
    if track_id:
        q = q.filter(Registration.track_id == track_id)

    if query:
        search_term = f"%{query.strip()}%"
        q = q.filter(
            (Registration.team_name.ilike(search_term)) |
            (Registration.team_id.ilike(search_term)) |
            (Registration.college.ilike(search_term)) |
            (Registration.city.ilike(search_term))
        )

    total = q.count()
    teams = q.order_by(Registration.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    result = []
    for team in teams:
        payment = db.query(Payment).filter(Payment.registration_id == team.id).first()
        result.append({
            "id": team.id,
            "team_id": team.team_id or "N/A",
            "team_name": team.team_name,
            "college": team.college,
            "city": team.city,
            "state": team.state,
            "track_title": team.track.title if team.track else "N/A",
            "status": team.status,
            "payment_status": team.payment_status,
            "utr": payment.utr if payment else "N/A",
            "payment_id": payment.id if payment else None,
            "has_screenshot": bool(payment and payment.payment_screenshot),
            "created_at": team.created_at,
            "member1": {
                "name": team.member1.full_name,
                "email": team.member1.email,
                "phone": team.member1.phone,
                "college": team.member1.college,
                "github": team.member1.github,
                "linkedin": team.member1.linkedin
            } if team.member1 else None,
            "member2": {
                "name": team.member2.full_name,
                "email": team.member2.email,
                "phone": team.member2.phone,
                "college": team.member2.college,
                "github": team.member2.github,
                "linkedin": team.member2.linkedin
            } if team.member2 else None
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "teams": result
    }

@router.get("/teams/export-csv")
def export_teams_csv(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    teams = db.query(Registration).order_by(Registration.created_at.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    writer.writerow([
        "Reg ID", "Team ID", "Team Name", "College", "City", "State", "Track",
        "Status", "Payment Status", "UTR", "Member 1 Name", "Member 1 Email", "Member 1 Phone",
        "Member 1 College", "Member 1 GitHub", "Member 1 LinkedIn",
        "Member 2 Name", "Member 2 Email", "Member 2 Phone",
        "Member 2 College", "Member 2 GitHub", "Member 2 LinkedIn", "Registration Date"
    ])

    for t in teams:
        m1 = t.member1
        m2 = t.member2
        payment = db.query(Payment).filter(Payment.registration_id == t.id).first()
        writer.writerow([
            t.id, t.team_id or "N/A", t.team_name, t.college, t.city, t.state,
            t.track.title if t.track else "N/A", t.status, t.payment_status,
            payment.utr if payment else "N/A",
            m1.full_name if m1 else "", m1.email if m1 else "", m1.phone if m1 else "",
            m1.college if m1 else "", m1.github if m1 else "", m1.linkedin if m1 else "",
            m2.full_name if m2 else "", m2.email if m2 else "", m2.phone if m2 else "",
            m2.college if m2 else "", m2.github if m2 else "", m2.linkedin if m2 else "",
            t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    log_admin_action(db, current_admin.username, "EXPORT_CSV", "Exported team registration list to CSV")

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=AGENTX_2026_Teams_Export.csv"}
    )

@router.put("/teams/{registration_id}/status")
def update_team_status(
    registration_id: int,
    new_status: str = Query(...), # CONFIRMED, DISQUALIFIED, PAYMENT_PENDING
    track_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    team = db.query(Registration).filter(Registration.id == registration_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    old_status = team.status
    team.status = new_status.upper()
    if new_status.upper() == "CONFIRMED" or new_status.upper() == "PAID":
        team.status = "CONFIRMED"
        team.payment_status = "VERIFIED"
        if not team.team_id:
            team.team_id = generate_next_team_id(db)

    if track_id:
        team.track_id = track_id

    db.commit()
    log_admin_action(
        db,
        current_admin.username,
        "UPDATE_TEAM_STATUS",
        f"Updated Team #{team.id} ({team.team_name}) status from {old_status} to {team.status}"
    )

    return {"success": True, "team_id": team.team_id, "status": team.status}

@router.get("/payments")
def get_payments_list(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    payments = db.query(Payment).order_by(Payment.submitted_at.desc()).all()
    results = []
    for p in payments:
        reg = p.registration
        m1 = reg.member1 if reg else None
        m2 = reg.member2 if reg else None
        results.append({
            "id": p.id,
            "registration_id": p.registration_id,
            "team_id": reg.team_id if reg else "N/A",
            "team_name": reg.team_name if reg else "N/A",
            "member1_name": m1.full_name if m1 else "N/A",
            "member2_name": m2.full_name if m2 else "N/A",
            "amount": p.amount,
            "payment_method": p.payment_method or "UPI",
            "utr": p.utr or "N/A",
            "has_screenshot": bool(p.payment_screenshot),
            "status": p.status,
            "submitted_at": p.submitted_at,
            "verified_at": p.verified_at,
            "verified_by": p.verified_by,
            "rejection_reason": p.rejection_reason,
            "admin_note": p.admin_note
        })
    return results

@router.post("/payments/{payment_id}/verify")
def verify_payment_admin(
    payment_id: int,
    body: Optional[AdminVerifyPaymentRequest] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    registration = payment.registration
    if not registration:
        raise HTTPException(status_code=404, detail="Associated registration not found.")

    # Server-side 100 confirmed teams cap check
    settings = db.query(EventSettings).first()
    max_teams = settings.max_teams if settings else 100
    confirmed_count = db.query(Registration).filter(Registration.status == "CONFIRMED").count()

    if registration.status != "CONFIRMED" and confirmed_count >= max_teams:
        raise HTTPException(
            status_code=400,
            detail="REGISTRATION CLOSED: Maximum 100 teams have already been confirmed."
        )

    # 1. Update Payment
    payment.status = "VERIFIED"
    payment.verified_at = datetime.datetime.utcnow()
    payment.verified_by = current_admin.username
    if body and body.admin_note:
        payment.admin_note = body.admin_note

    # 2. Update Registration & Generate Team ID
    if not registration.team_id:
        registration.team_id = generate_next_team_id(db)

    registration.status = "CONFIRMED"
    registration.payment_status = "VERIFIED"
    db.commit()

    # 3. Trigger Confirmation Emails for both team members independently
    track_title = registration.track.title if registration.track else "General Agentic AI"
    m1 = registration.member1
    m2 = registration.member2

    m1_name = m1.full_name if m1 else ""
    m1_email = m1.email if m1 else ""
    m2_name = m2.full_name if m2 else ""
    m2_email = m2.email if m2 else ""

    email_delivery_results = {}
    try:
        email_delivery_results = send_team_confirmation_emails(
            registration_id=registration.id,
            team_id=registration.team_id,
            team_name=registration.team_name,
            track_title=track_title,
            member1_name=m1_name,
            member1_email=m1_email,
            member2_name=m2_name,
            member2_email=m2_email
        )
    except Exception as e:
        safe_err = get_safe_error_message(e)
        print(f"[Email Delivery Unexpected Error]: {safe_err}")

    # Format email delivery summary for audit log
    email_summary = []
    for email_addr, status_info in email_delivery_results.items():
        sent_str = "SUCCESS" if status_info.get("success") else "FAILED"
        attempts = status_info.get("attempts", 0)
        err = status_info.get("error")
        err_str = f" ({err})" if err else ""
        email_summary.append(f"{email_addr}: {sent_str} [Attempts: {attempts}]{err_str}")

    email_log_str = "; ".join(email_summary) if email_summary else "No emails sent"

    # 4. Create Audit Log
    log_admin_action(
        db,
        current_admin.username,
        "VERIFY_PAYMENT",
        f"Verified UPI payment of ₹{payment.amount} for Team {registration.team_name} (UTR: {payment.utr}). Assigned Team ID: {registration.team_id}. Email Delivery: {email_log_str}"
    )

    return {
        "success": True,
        "message": "Payment verified and registration confirmed successfully.",
        "team_id": registration.team_id,
        "payment_id": payment.id,
        "status": "VERIFIED",
        "email_delivery": email_delivery_results
    }

@router.post("/payments/{payment_id}/reject")
def reject_payment_admin(
    payment_id: int,
    data: AdminRejectPaymentRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    registration = payment.registration
    if not registration:
        raise HTTPException(status_code=404, detail="Associated registration not found.")

    payment.status = "REJECTED"
    payment.rejection_reason = data.rejection_reason.strip()
    if data.admin_note:
        payment.admin_note = data.admin_note

    registration.status = "PAYMENT_PENDING"
    registration.payment_status = "REJECTED"
    db.commit()

    log_admin_action(
        db,
        current_admin.username,
        "REJECT_PAYMENT",
        f"Rejected UPI payment for Team {registration.team_name} (UTR: {payment.utr}). Reason: {data.rejection_reason}"
    )

    return {
        "success": True,
        "message": "Payment rejected.",
        "payment_id": payment.id,
        "status": "REJECTED"
    }

@router.get("/payments/{payment_id}/screenshot")
def get_payment_screenshot(
    payment_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or not payment.payment_screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found for this payment.")

    filepath = os.path.join(UPLOAD_DIR, payment.payment_screenshot)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Screenshot file does not exist on disk.")

    ext = os.path.splitext(filepath)[1].lower()
    media_type = "image/png"
    if ext in [".jpg", ".jpeg"]:
        media_type = "image/jpeg"
    elif ext == ".webp":
        media_type = "image/webp"

    return FileResponse(filepath, media_type=media_type)

@router.get("/certificates/list")
def get_certificates_list(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    certs = db.query(Certificate).order_by(Certificate.generated_at.desc()).all()
    return certs

@router.post("/certificates/generate-bulk")
def generate_bulk_certificates(
    certificate_type: str = Query("PARTICIPATION"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    confirmed_teams = db.query(Registration).filter(Registration.status == "CONFIRMED").all()
    generated_count = 0

    for team in confirmed_teams:
        track_title = team.track.title if team.track else "Agentic AI"
        for member in [team.member1, team.member2]:
            if member:
                existing = db.query(Certificate).filter(
                    Certificate.participant_id == member.id,
                    Certificate.registration_id == team.id,
                    Certificate.certificate_type == certificate_type
                ).first()

                if not existing:
                    cert_id = f"AX2026-{team.team_id or 'P'}-{member.id:04d}"
                    token = str(uuid.uuid4())

                    cert = Certificate(
                        certificate_id=cert_id,
                        participant_id=member.id,
                        registration_id=team.id,
                        team_id=team.team_id or "N/A",
                        participant_name=member.full_name,
                        team_name=team.team_name,
                        track_title=track_title,
                        certificate_type=certificate_type,
                        verification_token=token,
                        status="GENERATED"
                    )
                    db.add(cert)
                    generated_count += 1

    db.commit()
    log_admin_action(
        db,
        current_admin.username,
        "GENERATE_BULK_CERTIFICATES",
        f"Bulk generated {generated_count} '{certificate_type}' certificates"
    )

    return {
        "success": True,
        "generated_count": generated_count,
        "message": f"Successfully generated {generated_count} certificates."
    }

@router.put("/settings")
def update_event_settings(
    data: EventSettingsUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    settings = db.query(EventSettings).first()
    if not settings:
        settings = EventSettings()
        db.add(settings)

    for field, val in data.dict(exclude_unset=True).items():
        if val is not None:
            setattr(settings, field, val)

    db.commit()
    log_admin_action(db, current_admin.username, "UPDATE_SETTINGS", "Updated global event settings")
    return settings

@router.post("/settings/qr-upload")
async def upload_payment_qr(
    qr_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    saved_ok, save_res = save_payment_screenshot(qr_file)
    if not saved_ok:
        raise HTTPException(status_code=400, detail=save_res)

    settings = db.query(EventSettings).first()
    if not settings:
        settings = EventSettings()
        db.add(settings)

    settings.payment_qr_image = f"/uploads/screenshots/{save_res}"
    db.commit()

    log_admin_action(db, current_admin.username, "UPLOAD_QR", "Uploaded custom payment QR image")
    return {"success": True, "qr_url": settings.payment_qr_image}

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs
