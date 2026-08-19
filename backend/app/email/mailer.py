import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "notifications@agentxindia.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "AGENTX INDIA 2026 Team")
BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")

def send_confirmation_email(
    to_email: str,
    participant_name: str,
    team_id: str,
    team_name: str,
    member1_name: str,
    member2_name: str,
    track_title: str
) -> bool:
    """
    Sends registration confirmation email to participant.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD or SMTP_PASSWORD == "your_smtp_app_password":
        print(f"[Email Notification Simulation] To: {to_email} | Team ID: {team_id} | Team: {team_name}")
        return True

    subject = f"AGENTX INDIA 2026 — Registration Confirmed ({team_id})"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 30px; }}
            .header {{ text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }}
            .title {{ font-size: 24px; font-weight: bold; color: #06b6d4; margin: 0; }}
            .subtitle {{ color: #94a3b8; font-size: 14px; margin-top: 5px; }}
            .badge {{ display: inline-block; background: rgba(6, 182, 212, 0.15); color: #38bdf8; border: 1px solid #0284c7; padding: 6px 16px; border-radius: 20px; font-size: 18px; font-weight: bold; margin: 20px 0; }}
            .card {{ background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; }}
            .row {{ display: flex; justify-space-between; margin-bottom: 10px; font-size: 14px; }}
            .label {{ color: #94a3b8; }}
            .value {{ font-weight: bold; color: #f8fafc; }}
            .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; }}
            .btn {{ display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">AGENTX INDIA 2026</h1>
                <p class="subtitle">Build. Automate. Impact. — 24-Hour AI Agent Hackathon</p>
            </div>
            
            <p>Dear {participant_name},</p>
            <p>Congratulations! Your team registration for <strong>AGENTX INDIA 2026</strong> has been officially confirmed and verified.</p>
            
            <div style="text-align: center;">
                <div class="badge">Team ID: {team_id}</div>
            </div>

            <div class="card">
                <p class="row"><span class="label">Team Name:</span> <span class="value">{team_name}</span></p>
                <p class="row"><span class="label">Challenge Track:</span> <span class="value">{track_title}</span></p>
                <p class="row"><span class="label">Member 1:</span> <span class="value">{member1_name}</span></p>
                <p class="row"><span class="label">Member 2:</span> <span class="value">{member2_name}</span></p>
                <p class="row"><span class="label">Registration Fee:</span> <span class="value">₹199 — VERIFIED ✓</span></p>
                <p class="row"><span class="label">Event Date:</span> <span class="value">30 August 2026</span></p>
                <p class="row"><span class="label">Duration:</span> <span class="value">24 Hours</span></p>
            </div>

            <p style="text-align: center;">
                <a href="{BASE_URL}" class="btn">Go to Hackathon Platform</a>
            </p>

            <div class="footer">
                <p>AGENTX INDIA 2026 | National AI Agent Hackathon</p>
                <p>Need assistance? Contact support at {SMTP_FROM_EMAIL}</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM_EMAIL, [to_email], msg.as_string())
        server.quit()
        print(f"[Email Sent] Successfully sent confirmation email to {to_email}")
        return True
    except Exception as e:
        print(f"[Email Error] Failed to send email to {to_email}: {e}")
        return False
