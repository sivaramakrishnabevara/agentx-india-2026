from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Certificate, Participant, Registration, EventSettings
from app.schemas.schemas import CertificateVerifyResponse
from app.certificates.generator import generate_certificate_png, generate_certificate_pdf

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])

@router.get("/verify/{certificate_id}", response_model=CertificateVerifyResponse)
def verify_certificate(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.certificate_id == certificate_id.strip()).first()
    if not cert:
        return {
            "valid": False,
            "message": "Certificate ID not found. Please verify the ID entered."
        }

    settings = db.query(EventSettings).first()
    event_date = settings.event_date if settings else "30 August 2026"

    return {
        "valid": True,
        "certificate_id": cert.certificate_id,
        "participant_name": cert.participant_name,
        "team_name": cert.team_name,
        "team_id": cert.team_id,
        "track_title": cert.track_title,
        "certificate_type": cert.certificate_type,
        "event_date": event_date,
        "generated_at": cert.generated_at,
        "message": "CERTIFICATE VALID ✓"
    }

@router.get("/download/{certificate_id}/png")
def download_certificate_png(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.certificate_id == certificate_id.strip()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    settings = db.query(EventSettings).first()
    event_date = settings.event_date if settings else "30 AUGUST 2026"

    # Increment download count
    cert.download_count = (cert.download_count or 0) + 1
    db.commit()

    png_bytes = generate_certificate_png(
        certificate_id=cert.certificate_id,
        participant_name=cert.participant_name,
        team_name=cert.team_name,
        team_id=cert.team_id,
        track_title=cert.track_title,
        certificate_type=cert.certificate_type,
        event_date=event_date
    )

    filename = f"AGENTX_2026_Certificate_{cert.certificate_id}.png"
    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/download/{certificate_id}/pdf")
def download_certificate_pdf(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.certificate_id == certificate_id.strip()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    settings = db.query(EventSettings).first()
    event_date = settings.event_date if settings else "30 AUGUST 2026"

    # Increment download count
    cert.download_count = (cert.download_count or 0) + 1
    db.commit()

    pdf_bytes = generate_certificate_pdf(
        certificate_id=cert.certificate_id,
        participant_name=cert.participant_name,
        team_name=cert.team_name,
        team_id=cert.team_id,
        track_title=cert.track_title,
        certificate_type=cert.certificate_type,
        event_date=event_date
    )

    filename = f"AGENTX_2026_Certificate_{cert.certificate_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
