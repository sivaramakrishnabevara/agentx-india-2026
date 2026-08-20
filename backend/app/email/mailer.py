import os
import re
import time
import smtplib
import requests
from abc import ABC, abstractmethod
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

def is_valid_email(email: str) -> bool:
    """
    Validates recipient email address syntax.
    """
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def get_email_config():
    """
    Retrieves email configuration from environment variables.
    Supports RESEND_API_KEY, EMAIL_FROM (or SMTP_FROM_EMAIL), EMAIL_FROM_NAME (or SMTP_FROM_NAME).
    """
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    
    from_email = os.getenv("EMAIL_FROM", "").strip() or os.getenv("SMTP_FROM_EMAIL", "notifications@agentxindia.com").strip()
    from_name = os.getenv("EMAIL_FROM_NAME", "").strip() or os.getenv("SMTP_FROM_NAME", "AGENTX INDIA 2026 Team").strip()
    base_url = os.getenv("BASE_URL", "http://localhost:5173").strip()

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except (ValueError, TypeError):
        smtp_port = 587
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    return {
        "resend_api_key": resend_api_key,
        "from_email": from_email,
        "from_name": from_name,
        "base_url": base_url,
        "smtp_host": smtp_host,
        "smtp_port": smtp_port,
        "smtp_username": smtp_username,
        "smtp_password": smtp_password,
    }

def get_safe_error_message(err: Exception | str) -> str:
    """
    Returns sanitized error string ensuring RESEND_API_KEY and SMTP_PASSWORD are never leaked.
    """
    msg = str(err)
    config = get_email_config()
    resend_key = config["resend_api_key"]
    smtp_pwd = config["smtp_password"]

    if resend_key and len(resend_key) > 4 and resend_key in msg:
        msg = msg.replace(resend_key, "re_******")
    if smtp_pwd and len(smtp_pwd) > 2 and smtp_pwd in msg:
        msg = msg.replace(smtp_pwd, "******")
    return msg

def generate_confirmation_html(
    participant_name: str,
    team_id: str,
    team_name: str,
    member1_name: str,
    member2_name: str,
    track_title: str,
    base_url: str,
    from_email: str
) -> str:
    """
    Generates standardized HTML body for confirmation emails.
    """
    return f"""
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
                <a href="{base_url}" class="btn">Go to Hackathon Platform</a>
            </p>

            <div class="footer">
                <p>AGENTX INDIA 2026 | National AI Agent Hackathon</p>
                <p>Need assistance? Contact support at {from_email}</p>
            </div>
        </div>
    </body>
    </html>
    """

class BaseEmailProvider(ABC):
    @abstractmethod
    def send_confirmation_email(
        self,
        to_email: str,
        participant_name: str,
        team_id: str,
        team_name: str,
        member1_name: str,
        member2_name: str,
        track_title: str,
        max_attempts: int = 3,
        retry_delay: float = 1.0
    ) -> dict:
        pass

class ResendEmailProvider(BaseEmailProvider):
    """
    Production Email Provider using Resend HTTP API (https://api.resend.com/emails).
    Uses standard HTTPS outbound connection on port 443.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    def send_confirmation_email(
        self,
        to_email: str,
        participant_name: str,
        team_id: str,
        team_name: str,
        member1_name: str,
        member2_name: str,
        track_title: str,
        max_attempts: int = 3,
        retry_delay: float = 1.0
    ) -> dict:
        config = get_email_config()
        from_email = config["from_email"]
        from_name = config["from_name"]
        base_url = config["base_url"]

        subject = f"AGENTX INDIA 2026 — Registration Confirmed ({team_id})"
        html_body = generate_confirmation_html(
            participant_name=participant_name,
            team_id=team_id,
            team_name=team_name,
            member1_name=member1_name,
            member2_name=member2_name,
            track_title=track_title,
            base_url=base_url,
            from_email=from_email
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        from_header = f"{from_name} <{from_email}>" if from_name else from_email

        payload = {
            "from": from_header,
            "to": [to_email],
            "subject": subject,
            "html": html_body
        }

        url = "https://api.resend.com/emails"
        last_error = None
        last_status = None

        for attempt in range(1, max_attempts + 1):
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=15)
                last_status = resp.status_code

                if 200 <= resp.status_code < 300:
                    data = resp.json() if resp.text else {}
                    resend_id = data.get("id", "N/A")
                    print(f"[Email Sent] Attempt {attempt}/{max_attempts} to {to_email} via Resend HTTPS API: Status {resp.status_code} | Resend ID: {resend_id}")
                    return {
                        "to_email": to_email,
                        "success": True,
                        "attempts": attempt,
                        "http_status": resp.status_code,
                        "resend_id": resend_id,
                        "provider": "resend",
                        "error": None
                    }
                else:
                    err_msg = get_safe_error_message(resp.text)
                    last_error = f"Resend API Error (HTTP {resp.status_code}): {err_msg}"
                    print(f"[Email Error] Attempt {attempt}/{max_attempts} to {to_email} via Resend: {last_error}")

                    if 400 <= resp.status_code < 500 and resp.status_code != 429:
                        return {
                            "to_email": to_email,
                            "success": False,
                            "attempts": attempt,
                            "http_status": resp.status_code,
                            "provider": "resend",
                            "error": last_error
                        }

                    if attempt < max_attempts and retry_delay > 0:
                        time.sleep(retry_delay)

            except Exception as e:
                safe_err = get_safe_error_message(e)
                last_error = f"Resend HTTP Request Exception: {safe_err}"
                print(f"[Email Error] Attempt {attempt}/{max_attempts} to {to_email} via Resend: {last_error}")
                if attempt < max_attempts and retry_delay > 0:
                    time.sleep(retry_delay)

        return {
            "to_email": to_email,
            "success": False,
            "attempts": max_attempts,
            "http_status": last_status,
            "provider": "resend",
            "error": last_error or "Maximum retry attempts exceeded"
        }

class SMTPEmailProvider(BaseEmailProvider):
    """
    Optional Local Development Fallback Provider using Gmail SMTP.
    """

    def send_confirmation_email(
        self,
        to_email: str,
        participant_name: str,
        team_id: str,
        team_name: str,
        member1_name: str,
        member2_name: str,
        track_title: str,
        max_attempts: int = 3,
        retry_delay: float = 1.0
    ) -> dict:
        config = get_email_config()
        host = config["smtp_host"]
        port = config["smtp_port"]
        username = config["smtp_username"]
        password = config["smtp_password"]
        from_email = config["from_email"]
        from_name = config["from_name"]
        base_url = config["base_url"]

        subject = f"AGENTX INDIA 2026 — Registration Confirmed ({team_id})"
        html_body = generate_confirmation_html(
            participant_name=participant_name,
            team_id=team_id,
            team_name=team_name,
            member1_name=member1_name,
            member2_name=member2_name,
            track_title=track_title,
            base_url=base_url,
            from_email=from_email
        )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        last_error = None
        for attempt in range(1, max_attempts + 1):
            try:
                server = smtplib.SMTP(host, port, timeout=15)
                server.starttls()
                server.login(username, password)
                server.sendmail(from_email, [to_email], msg.as_string())
                server.quit()
                print(f"[Email Sent] Attempt {attempt}/{max_attempts} to {to_email} via SMTP: Successfully sent confirmation email")
                return {
                    "to_email": to_email,
                    "success": True,
                    "attempts": attempt,
                    "provider": "smtp",
                    "error": None
                }
            except Exception as e:
                safe_err = get_safe_error_message(e)
                last_error = safe_err
                print(f"[Email Error] Attempt {attempt}/{max_attempts} to {to_email} via SMTP: {safe_err}")
                if attempt < max_attempts and retry_delay > 0:
                    time.sleep(retry_delay)

        return {
            "to_email": to_email,
            "success": False,
            "attempts": max_attempts,
            "provider": "smtp",
            "error": last_error or "Maximum retry attempts exceeded"
        }

class SimulationEmailProvider(BaseEmailProvider):
    """
    Simulation Fallback Provider when no email service keys/passwords are provided.
    """

    def send_confirmation_email(
        self,
        to_email: str,
        participant_name: str,
        team_id: str,
        team_name: str,
        member1_name: str,
        member2_name: str,
        track_title: str,
        max_attempts: int = 3,
        retry_delay: float = 1.0
    ) -> dict:
        print(f"[Email Notification Simulation] Attempt 1/1 to {to_email} | Team ID: {team_id} | Team: {team_name}")
        return {
            "to_email": to_email,
            "success": True,
            "attempts": 1,
            "provider": "simulation",
            "error": None
        }

def get_email_provider() -> BaseEmailProvider:
    """
    Factory function selecting current active Email Provider based on environment configuration.
    """
    config = get_email_config()
    resend_key = config["resend_api_key"]
    smtp_user = config["smtp_username"]
    smtp_pwd = config["smtp_password"]

    if resend_key:
        return ResendEmailProvider(api_key=resend_key)
    elif smtp_user and smtp_pwd and smtp_pwd != "your_smtp_app_password":
        return SMTPEmailProvider()
    else:
        return SimulationEmailProvider()

def send_confirmation_email(
    to_email: str,
    participant_name: str,
    team_id: str,
    team_name: str,
    member1_name: str,
    member2_name: str,
    track_title: str,
    max_attempts: int = 3,
    retry_delay: float = 1.0,
    provider: BaseEmailProvider = None
) -> dict:
    """
    Sends registration confirmation email to a single participant using the active email provider.
    """
    to_email = (to_email or "").strip()

    if not is_valid_email(to_email):
        print(f"[Email Error] Attempt 1/{max_attempts} to {to_email}: Invalid email address format")
        return {
            "to_email": to_email,
            "success": False,
            "attempts": 0,
            "error": "Invalid email address format"
        }

    if provider is None:
        provider = get_email_provider()

    return provider.send_confirmation_email(
        to_email=to_email,
        participant_name=participant_name,
        team_id=team_id,
        team_name=team_name,
        member1_name=member1_name,
        member2_name=member2_name,
        track_title=track_title,
        max_attempts=max_attempts,
        retry_delay=retry_delay
    )

def send_team_confirmation_emails(
    registration_id: int,
    team_id: str,
    team_name: str,
    track_title: str,
    member1_name: str,
    member1_email: str,
    member2_name: str = None,
    member2_email: str = None,
    max_attempts: int = 3,
    retry_delay: float = 1.0,
    provider: BaseEmailProvider = None
) -> dict:
    """
    Sends confirmation emails to BOTH team members independently.
    Prevents duplicate emails if members share the same email address.
    Does not fail if one member's email fails.
    Returns dictionary mapping recipient email -> delivery status.
    """
    delivery_results = {}
    processed_emails = set()

    recipients = []
    if member1_email and member1_email.strip():
        recipients.append((member1_name or "Participant 1", member1_email.strip()))
    if member2_email and member2_email.strip():
        recipients.append((member2_name or "Participant 2", member2_email.strip()))

    m1_display = member1_name or ""
    m2_display = member2_name or ""

    if provider is None:
        provider = get_email_provider()

    for name, email in recipients:
        norm_email = email.lower()
        if norm_email in processed_emails:
            print(f"[Email Skipped] Duplicate recipient email in same team dispatch: {email}")
            continue
        processed_emails.add(norm_email)

        try:
            res = send_confirmation_email(
                to_email=email,
                participant_name=name,
                team_id=team_id,
                team_name=team_name,
                member1_name=m1_display,
                member2_name=m2_display,
                track_title=track_title,
                max_attempts=max_attempts,
                retry_delay=retry_delay,
                provider=provider
            )
            delivery_results[email] = res
        except Exception as e:
            safe_err = get_safe_error_message(e)
            print(f"[Email Error] Unexpected exception sending to {email}: {safe_err}")
            delivery_results[email] = {
                "to_email": email,
                "success": False,
                "attempts": 1,
                "error": safe_err
            }

    return delivery_results


