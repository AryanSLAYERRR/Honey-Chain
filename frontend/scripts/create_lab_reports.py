from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

OUT = Path(__file__).resolve().parents[1] / "public" / "reports"
OUT.mkdir(parents=True, exist_ok=True)

INK = HexColor("#1c2b22")
MOSS = HexColor("#3f5840")
AMBER = HexColor("#a76608")
PAPER = HexColor("#fffdf8")
LINE = HexColor("#ded9cc")


def report(path: Path, title: str, certificate: str, stage: str, values: list[tuple[str, str, str]], conclusion: str):
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm, topMargin=20 * mm, bottomMargin=18 * mm)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=MOSS, spaceAfter=8))
    styles.add(ParagraphStyle(name="ReportTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=29, textColor=INK, spaceAfter=7))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=10, leading=15, textColor=INK))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=11, textColor=MOSS))
    story = [
        Paragraph("PUNJAB STATE FOOD TESTING LABORATORY", styles["Kicker"]),
        Paragraph(title, styles["ReportTitle"]),
        Paragraph(f"Certificate {certificate} | Sample: PB-00481 | {stage}", styles["Body"]),
        Spacer(1, 11 * mm),
    ]
    table = Table([["Test", "Observed value", "Method / limit"]] + values, colWidths=[64 * mm, 38 * mm, 56 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), PAPER),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEADING", (0, 0), (-1, -1), 13), ("GRID", (0, 0), (-1, -1), .5, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), PAPER), ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [table, Spacer(1, 12 * mm), Paragraph("Laboratory conclusion", styles["Kicker"]), Paragraph(conclusion, styles["Body"]), Spacer(1, 22 * mm)]
    signature = Table([["Authorised analyst", "Digitally issued for HoneyChain proof-of-concept"], ["Dr. Meera Sethi", "No independent commercial resale use"]], colWidths=[79 * mm, 79 * mm])
    signature.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), .7, INK), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica"), ("TEXTCOLOR", (0, 1), (-1, 1), MOSS),
        ("FONTSIZE", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(signature)
    doc.build(story)


report(OUT / "LAB-PRE-00481-original.pdf", "Pre-processing honey assay", "LAB-PRE-00481", "Raw honey intake", [
    ("Purity", "98.6%", "Internal honey profile"), ("Moisture", "18.2%", "Limit: max 20.0%"),
    ("HMF", "9.1 mg/kg", "Limit: max 40 mg/kg"), ("Sucrose", "2.1%", "Limit: max 5.0%"),
], "The submitted raw honey sample meets the recorded quality thresholds before processing." )
report(OUT / "LAB-POST-00481-original.pdf", "Post-processing honey assay", "LAB-POST-00481", "Finished bottle lot", [
    ("Purity", "99.2%", "Internal honey profile"), ("Moisture", "17.8%", "Limit: max 20.0%"),
    ("HMF", "11.4 mg/kg", "Limit: max 40 mg/kg"), ("Sucrose", "1.9%", "Limit: max 5.0%"),
], "The finished lot is consistent with the pre-processing sample and meets the documented bottling thresholds." )
