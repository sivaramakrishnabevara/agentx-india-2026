"""
Database Seeding Script for AGENTX INDIA 2026.
Creates initial mock data for testing payment flow, registration limits, admin metrics, and certificate verification.
"""

from app.database.session import SessionLocal, engine, Base
from app.models.models import Registration, Participant, Track, Payment, Certificate
import uuid

Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Registration).count() > 0:
            print("Database already contains registrations. Skipping seed.")
            return

        print("Seeding initial mock registrations...")
        
        mock_data = [
            ("CyberKnights", "IIT Bombay", "Mumbai", "Maharashtra", 3, "Aarav Sharma", "aarav@gmail.com", "9876543210", "Ananya Verma", "ananya@gmail.com", "9876543211"),
            ("AgentZero", "BITS Pilani", "Pilani", "Rajasthan", 1, "Rohan Patel", "rohan@gmail.com", "9876543212", "Priya Singh", "priya@gmail.com", "9876543213"),
            ("NeuralHackers", "NIT Trichy", "Trichy", "Tamil Nadu", 2, "Karthik Raja", "karthik@gmail.com", "9876543214", "Deepa Nair", "deepa@gmail.com", "9876543215"),
            ("GreenAI", "DTU Delhi", "Delhi", "Delhi", 4, "Vikram Joshi", "vikram@gmail.com", "9876543216", "Sneha Roy", "sneha@gmail.com", "9876543217"),
            ("CampusFlow", "PES University", "Bengaluru", "Karnataka", 5, "Nikhil Rao", "nikhil@gmail.com", "9876543218", "Kavya Hegde", "kavya@gmail.com", "9876543219"),
        ]

        for idx, (t_name, col, city, state, tr_id, m1_n, m1_e, m1_p, m2_n, m2_e, m2_p) in enumerate(mock_data, start=1):
            p1 = Participant(full_name=m1_n, email=m1_e, phone=m1_p, college=col)
            p2 = Participant(full_name=m2_n, email=m2_e, phone=m2_p, college=col)
            db.add(p1)
            db.add(p2)
            db.flush()

            team_id = f"AX{idx:03d}"
            reg = Registration(
                team_id=team_id,
                team_name=t_name,
                college=col,
                city=city,
                state=state,
                track_id=tr_id,
                member1_id=p1.id,
                member2_id=p2.id,
                status="CONFIRMED",
                payment_status="VERIFIED"
            )
            db.add(reg)
            db.flush()

            pay = Payment(
                registration_id=reg.id,
                amount=199.0,
                payment_method="UPI",
                upi_id="9618164396-3@ybl",
                utr=f"UTR_MOCK_100{idx}",
                status="VERIFIED"
            )
            db.add(pay)

            # Create Certificate for Member 1
            cert_id = f"AX2026-{team_id}-{p1.id:04d}"
            cert = Certificate(
                certificate_id=cert_id,
                participant_id=p1.id,
                registration_id=reg.id,
                team_id=team_id,
                participant_name=p1.full_name,
                team_name=t_name,
                track_title=f"Track {tr_id}",
                certificate_type="PARTICIPATION",
                verification_token=str(uuid.uuid4()),
                status="GENERATED"
            )
            db.add(cert)

        db.commit()
        print("Successfully seeded 5 mock paid teams and certificates!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
