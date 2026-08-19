import os
import io
import qrcode
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

CERTIFICATE_VERIFY_BASE_URL = os.getenv("CERTIFICATE_VERIFY_BASE_URL", "http://localhost:5173/verify")

def generate_qr_code(verify_url: str) -> Image.Image:
    """Generates a high-contrast QR code image for certificate verification."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#06b6d4", back_color="#0f172a").convert("RGBA")
    return qr_img

def generate_certificate_png(
    certificate_id: str,
    participant_name: str,
    team_name: str,
    team_id: str,
    track_title: str,
    certificate_type: str = "PARTICIPATION",
    event_date: str = "30 AUGUST 2026"
) -> bytes:
    """
    Generates a high-resolution A4 landscape PNG certificate image (1920x1357px).
    """
    width, height = 1920, 1357
    
    # Create dark navy base canvas
    image = Image.new("RGBA", (width, height), (11, 15, 25, 255))
    draw = ImageDraw.Draw(image)

    # Decorative outer border with cyan gold accents
    margin = 40
    draw.rectangle([margin, margin, width - margin, height - margin], outline=(30, 41, 59, 255), width=4)
    draw.rectangle([margin + 12, margin + 12, width - margin - 12, height - margin - 12], outline=(6, 182, 212, 255), width=2)
    
    # Gold accent corner marks
    corner_len = 60
    # Top-left
    draw.line([(margin, margin), (margin + corner_len, margin)], fill=(245, 158, 11, 255), width=6)
    draw.line([(margin, margin), (margin, margin + corner_len)], fill=(245, 158, 11, 255), width=6)
    # Top-right
    draw.line([(width - margin - corner_len, margin), (width - margin, margin)], fill=(245, 158, 11, 255), width=6)
    draw.line([(width - margin, margin), (width - margin, margin + corner_len)], fill=(245, 158, 11, 255), width=6)
    # Bottom-left
    draw.line([(margin, height - margin), (margin + corner_len, height - margin)], fill=(245, 158, 11, 255), width=6)
    draw.line([(margin, height - margin - corner_len), (margin, height - margin)], fill=(245, 158, 11, 255), width=6)
    # Bottom-right
    draw.line([(width - margin - corner_len, height - margin), (width - margin, height - margin)], fill=(245, 158, 11, 255), width=6)
    draw.line([(width - margin, height - margin - corner_len), (width - margin, height - margin)], fill=(245, 158, 11, 255), width=6)

    # Helper text rendering using PIL default font scaling
    try:
        title_font = ImageFont.truetype("arial.ttf", 64)
        subtitle_font = ImageFont.truetype("arial.ttf", 28)
        header_font = ImageFont.truetype("arial.ttf", 36)
        name_font = ImageFont.truetype("arial.ttf", 68)
        body_font = ImageFont.truetype("arial.ttf", 26)
        detail_font = ImageFont.truetype("arial.ttf", 22)
    except IOError:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        name_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        detail_font = ImageFont.load_default()

    # Event Title
    draw.text((width / 2, 140), "AGENTX INDIA 2026", fill=(6, 182, 212, 255), font=title_font, anchor="mm")
    draw.text((width / 2, 210), "BUILD. AUTOMATE. IMPACT.", fill=(245, 158, 11, 255), font=subtitle_font, anchor="mm")

    # Certificate Header
    type_display = f"CERTIFICATE OF {certificate_type.upper()}"
    draw.text((width / 2, 310), type_display, fill=(255, 255, 255, 255), font=header_font, anchor="mm")

    # Present Text
    draw.text((width / 2, 400), "THIS CERTIFICATE IS PROUDLY PRESENTED TO", fill=(148, 163, 184, 255), font=body_font, anchor="mm")

    # Participant Name (Centered & Highlighted)
    draw.text((width / 2, 490), participant_name.upper(), fill=(56, 189, 248, 255), font=name_font, anchor="mm")
    draw.line([(width / 2 - 350, 545), (width / 2 + 350, 545)], fill=(6, 182, 212, 255), width=3)

    # Description Text
    draw.text((width / 2, 620), f"for participating in AGENTX INDIA 2026 — 24-Hour AI Agent Hackathon", fill=(203, 213, 225, 255), font=body_font, anchor="mm")
    draw.text((width / 2, 670), f"held on {event_date.upper()}", fill=(148, 163, 184, 255), font=body_font, anchor="mm")

    # Team & Track Info Box
    box_y = 750
    draw.rectangle([(width / 2 - 450, box_y), (width / 2 + 450, box_y + 120)], fill=(17, 24, 39, 255), outline=(30, 41, 59, 255), width=2)
    draw.text((width / 2 - 350, box_y + 40), f"Team Name: {team_name}", fill=(248, 250, 252, 255), font=detail_font, anchor="lm")
    draw.text((width / 2 - 350, box_y + 80), f"Team ID: {team_id}", fill=(245, 158, 11, 255), font=detail_font, anchor="lm")
    draw.text((width / 2 + 100, box_y + 40), f"Track: {track_title}", fill=(56, 189, 248, 255), font=detail_font, anchor="lm")
    draw.text((width / 2 + 100, box_y + 80), f"Certificate ID: {certificate_id}", fill=(148, 163, 184, 255), font=detail_font, anchor="lm")

    # Embed QR Code in Bottom Left
    verify_url = f"{CERTIFICATE_VERIFY_BASE_URL}/{certificate_id}"
    qr_img = generate_qr_code(verify_url).resize((160, 160))
    image.paste(qr_img, (120, height - 260), mask=qr_img)
    draw.text((200, height - 85), f"Scan to verify certificate", fill=(148, 163, 184, 255), font=detail_font, anchor="mm")
    draw.text((200, height - 60), f"ID: {certificate_id}", fill=(6, 182, 212, 255), font=detail_font, anchor="mm")

    # Signatures on Bottom Right
    draw.line([(width - 500, height - 160), (width - 150, height - 160)], fill=(148, 163, 184, 255), width=2)
    draw.text((width - 325, height - 130), "Organizing Committee", fill=(248, 250, 252, 255), font=detail_font, anchor="mm")
    draw.text((width - 325, height - 100), "AGENTX INDIA 2026", fill=(6, 182, 212, 255), font=detail_font, anchor="mm")

    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()

def generate_certificate_pdf(
    certificate_id: str,
    participant_name: str,
    team_name: str,
    team_id: str,
    track_title: str,
    certificate_type: str = "PARTICIPATION",
    event_date: str = "30 AUGUST 2026"
) -> bytes:
    """
    Generates a high-resolution A4 landscape vector PDF certificate using ReportLab.
    """
    buffer = io.BytesIO()
    # A4 landscape dimensions: 841.89 x 595.27 points
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    pdf_w, pdf_h = landscape(A4)

    # Dark background canvas
    c.setFillColorRGB(0.04, 0.06, 0.1) # #0b0f19
    c.rect(0, 0, pdf_w, pdf_h, fill=True, stroke=False)

    # Outer slate border
    c.setStrokeColorRGB(0.12, 0.16, 0.23) # #1e293b
    c.setLineWidth(3)
    c.rect(20, 20, pdf_w - 40, pdf_h - 40)

    # Inner cyan border
    c.setStrokeColorRGB(0.02, 0.71, 0.83) # #06b6d4
    c.setLineWidth(1.5)
    c.rect(26, 26, pdf_w - 52, pdf_h - 52)

    # Header Titles
    c.setFont("Helvetica-Bold", 32)
    c.setFillColorRGB(0.02, 0.71, 0.83)
    c.drawCentredString(pdf_w / 2, pdf_h - 80, "AGENTX INDIA 2026")

    c.setFont("Helvetica-Bold", 14)
    c.setFillColorRGB(0.96, 0.62, 0.04) # Gold
    c.drawCentredString(pdf_w / 2, pdf_h - 110, "BUILD. AUTOMATE. IMPACT.")

    c.setFont("Helvetica-Bold", 20)
    c.setFillColorRGB(1, 1, 1)
    c.drawCentredString(pdf_w / 2, pdf_h - 160, f"CERTIFICATE OF {certificate_type.upper()}")

    c.setFont("Helvetica", 14)
    c.setFillColorRGB(0.58, 0.64, 0.72)
    c.drawCentredString(pdf_w / 2, pdf_h - 205, "THIS CERTIFICATE IS PROUDLY PRESENTED TO")

    # Participant Name
    c.setFont("Helvetica-Bold", 30)
    c.setFillColorRGB(0.22, 0.74, 0.97) # Sky cyan
    c.drawCentredString(pdf_w / 2, pdf_h - 260, participant_name.upper())

    c.setStrokeColorRGB(0.02, 0.71, 0.83)
    c.setLineWidth(2)
    c.line(pdf_w / 2 - 180, pdf_h - 275, pdf_w / 2 + 180, pdf_h - 275)

    # Description
    c.setFont("Helvetica", 14)
    c.setFillColorRGB(0.8, 0.84, 0.88)
    c.drawCentredString(pdf_w / 2, pdf_h - 320, "for participating in AGENTX INDIA 2026 — 24-Hour AI Agent Hackathon")
    c.drawCentredString(pdf_w / 2, pdf_h - 345, f"held on {event_date.upper()}")

    # Details Box
    box_w, box_h = 440, 60
    box_x = (pdf_w - box_w) / 2
    box_y = pdf_h - 430

    c.setFillColorRGB(0.07, 0.09, 0.15)
    c.setStrokeColorRGB(0.12, 0.16, 0.23)
    c.rect(box_x, box_y, box_w, box_h, fill=True, stroke=True)

    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.97, 0.98, 0.99)
    c.drawString(box_x + 20, box_y + 36, f"Team Name: {team_name}")
    c.setFillColorRGB(0.96, 0.62, 0.04)
    c.drawString(box_x + 20, box_y + 16, f"Team ID: {team_id}")

    c.setFillColorRGB(0.22, 0.74, 0.97)
    c.drawString(box_x + 230, box_y + 36, f"Track: {track_title}")
    c.setFillColorRGB(0.58, 0.64, 0.72)
    c.drawString(box_x + 230, box_y + 16, f"Certificate ID: {certificate_id}")

    # QR Code embedding
    verify_url = f"{CERTIFICATE_VERIFY_BASE_URL}/{certificate_id}"
    qr_img = generate_qr_code(verify_url)
    qr_temp = io.BytesIO()
    qr_img.save(qr_temp, format="PNG")
    qr_temp.seek(0)

    c.drawImage(reportlab_image_provider(qr_temp), 50, 45, width=80, height=80)
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(0.58, 0.64, 0.72)
    c.drawCentredString(90, 32, "Scan to verify certificate")
    c.setFillColorRGB(0.02, 0.71, 0.83)
    c.drawCentredString(90, 20, f"ID: {certificate_id}")

    # Signatures
    c.setStrokeColorRGB(0.58, 0.64, 0.72)
    c.setLineWidth(1)
    c.line(pdf_w - 200, 75, pdf_w - 60, 75)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.97, 0.98, 0.99)
    c.drawCentredString(pdf_w - 130, 60, "Organizing Committee")
    c.setFillColorRGB(0.02, 0.71, 0.83)
    c.drawCentredString(pdf_w - 130, 45, "AGENTX INDIA 2026")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def reportlab_image_provider(stream_io):
    from reportlab.lib.utils import ImageReader
    return ImageReader(stream_io)
