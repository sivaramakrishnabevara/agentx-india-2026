import os
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Registration, Payment, EventSettings, Participant
from app.payments.upi_handler import save_payment_screenshot

router = APIRouter(prefix="/api/payments", tags=["Payments"])

def generate_next_team_id(db: Session) -> str:
    """
    Generates sequential Team IDs: AX001, AX002, AX003 ... AX100.
    Finds the current maximum numerical suffix among ALL teams to prevent duplicate IDs.
    """
    teams_with_ids = db.query(Registration).filter(
        Registration.team_id.isnot(None)
    ).all()
    
    max_num = 0
    for team in teams_with_ids:
        if team.team_id and team.team_id.startswith("AX"):
            try:
                num = int(team.team_id[2:])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass

    next_num = max_num + 1
    while db.query(Registration).filter(Registration.team_id == f"AX{next_num:03d}").first() is not None:
        next_num += 1

    return f"AX{next_num:03d}"

@router.post("/submit-utr")
async def submit_payment_utr(
    registration_id: int = Form(...),
    utr: str = Form(...),
    screenshot: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    cleaned_utr = utr.strip()
    if not cleaned_utr or len(cleaned_utr) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid UTR / Transaction ID (at least 4 characters) is required."
        )

    # 1. Fetch Registration
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration record not found.")

    if registration.status == "CONFIRMED" and registration.team_id:
        return {
            "success": True,
            "message": "Payment is already verified and registration is confirmed.",
            "team_id": registration.team_id,
            "team_name": registration.team_name,
            "status": "CONFIRMED",
            "payment_status": "VERIFIED"
        }

    # 2. Check 100 max confirmed team cap
    settings = db.query(EventSettings).first()
    max_teams = settings.max_teams if settings else 100

    confirmed_count = db.query(Registration).filter(
        Registration.status == "CONFIRMED"
    ).count()

    if confirmed_count >= max_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="REGISTRATION CLOSED: All 100 team slots have been confirmed."
        )

    # 3. Duplicate UTR Protection across other teams
    existing_utr = db.query(Payment).filter(
        Payment.utr == cleaned_utr,
        Payment.status.in_(["VERIFIED", "PENDING"]),
        Payment.registration_id != registration_id
    ).first()

    if existing_utr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This UTR has already been submitted."
        )

    # 4. Handle Screenshot Upload if provided
    screenshot_filename = None
    if screenshot and screenshot.filename:
        saved_ok, save_res = save_payment_screenshot(screenshot)
        if not saved_ok:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=save_res)
        screenshot_filename = save_res

    # 5. Create or Update Payment Record
    amount = settings.fee_per_team if settings else 199.0
    upi_id = settings.upi_id if settings else "9618164396-3@ybl"

    payment = db.query(Payment).filter(Payment.registration_id == registration_id).first()
    if not payment:
        payment = Payment(
            registration_id=registration_id,
            amount=amount,
            amount_in_paise=int(amount * 100),
            currency="INR",
            payment_method="UPI",
            upi_id=upi_id,
            utr=cleaned_utr,
            payment_screenshot=screenshot_filename,
            razorpay_order_id=f"UPI_{cleaned_utr}",
            razorpay_payment_id=f"PAY_{cleaned_utr}",
            status="PENDING",
            submitted_at=datetime.datetime.utcnow()
        )
        db.add(payment)
    else:
        payment.amount = amount
        payment.currency = "INR"
        payment.payment_method = "UPI"
        payment.upi_id = upi_id
        payment.utr = cleaned_utr
        if screenshot_filename:
            payment.payment_screenshot = screenshot_filename
        payment.status = "PENDING"
        payment.submitted_at = datetime.datetime.utcnow()
        payment.rejection_reason = None

    registration.status = "PAYMENT_VERIFICATION"
    registration.payment_status = "PENDING"

    db.commit()
    db.refresh(payment)

    return {
        "success": True,
        "message": "Your payment has been submitted and is waiting for organizer verification.",
        "payment_id": payment.id,
        "registration_id": registration.id,
        "team_name": registration.team_name,
        "utr": payment.utr,
        "status": "PENDING VERIFICATION",
        "amount": payment.amount
    }

@router.get("/status/{registration_id}")
def get_payment_status(registration_id: int, db: Session = Depends(get_db)):
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration record not found.")

    payment = db.query(Payment).filter(Payment.registration_id == registration_id).first()
    
    return {
        "registration_id": registration.id,
        "team_id": registration.team_id,
        "team_name": registration.team_name,
        "registration_status": registration.status,
        "payment_status": registration.payment_status,
        "payment": {
            "id": payment.id if payment else None,
            "utr": payment.utr if payment else None,
            "status": payment.status if payment else "UNPAID",
            "amount": payment.amount if payment else 199.0,
            "rejection_reason": payment.rejection_reason if payment else None,
            "submitted_at": payment.submitted_at if payment else None,
            "verified_at": payment.verified_at if payment else None
        } if payment else None
    }
