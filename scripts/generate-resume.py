"""Generate the public TXT/PDF from the same facts used by the HTML resume."""
from functools import partial
from hashlib import sha256
from html import escape
import json
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "src/lib/resume.json"
resume = json.loads(source.read_text(encoding="utf-8"))
pdf_path = ROOT / "static/tom-chen-resume.pdf"
txt_path = ROOT / "static/tom-chen-resume.txt"
lines = [resume["name"], resume["headline"], resume["email"], resume["github"], resume["website"], "", "PROFILE", resume["profile"], "", "TECHNICAL SKILLS", *resume["skills"], ""]
story = []
body = ParagraphStyle("Body", fontName="Helvetica", fontSize=9.4, leading=12.3, textColor=colors.HexColor("#222222"), alignment=TA_LEFT, spaceAfter=3)
section_style = ParagraphStyle("Section", parent=body, fontName="Helvetica-Bold", fontSize=10, leading=13, spaceBefore=9, spaceAfter=4)
entry_style = ParagraphStyle("Entry", parent=body, fontName="Helvetica-Bold", fontSize=9.8, leading=13, spaceBefore=4)
role_style = ParagraphStyle("Role", parent=body, fontSize=9, leading=11.5, textColor=colors.HexColor("#444444"))
bullet_style = ParagraphStyle("Bullet", parent=body, leftIndent=9, firstLineIndent=-7, spaceAfter=2)

def paragraph(text, style=body):
    story.append(Paragraph(escape(text), style))

def section(title):
    paragraph(title, section_style)

def entry(item):
    paragraph(item["name"] + " | " + item["dates"], entry_style)
    paragraph(item["role"], role_style)
    for text in item["bullets"]:
        paragraph("- " + text, bullet_style)

def text_entry(item):
    return [item["name"] + " | " + item["dates"], item["role"], *["- " + text for text in item["bullets"]], ""]

paragraph(resume["name"], ParagraphStyle("Name", parent=body, fontName="Helvetica-Bold", fontSize=23, leading=27, spaceAfter=3))
paragraph(resume["headline"], ParagraphStyle("Headline", parent=body, fontSize=10.5, leading=14))
paragraph(resume["email"] + " | github.com/Tcx086 | portfolio.tcx086.com", role_style)
section("PROFILE")
paragraph(resume["profile"])
section("TECHNICAL SKILLS")
for skill in resume["skills"]:
    paragraph(skill)
for title, items in [("ENGINEERING EXPERIENCE", resume["experience"]), ("INDEPENDENT PROJECTS", resume["projects"]), ("VOLUNTEER EXPERIENCE", [resume["volunteer"]])]:
    section(title)
    lines.append(title)
    for item in items:
        entry(item)
        lines.extend(text_entry(item))
section("EDUCATION")
paragraph(resume["education"]["school"], entry_style)
paragraph(resume["education"]["credential"])
section("HOBBY")
paragraph(resume["hobby"])
lines.extend(["EDUCATION", resume["education"]["school"], resume["education"]["credential"], "", "HOBBY", resume["hobby"], ""])
txt_path.write_text("\n".join(lines), encoding="utf-8")
document = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=30, bottomMargin=30, title="Tom Chen - Engineering Resume", author="Tom Chen")
document.build(story, canvasmaker=partial(Canvas, invariant=1))

reader = PdfReader(pdf_path)
assert len(reader.pages) == 1, "Public resume must fit on one page"
extracted = " ".join((reader.pages[0].extract_text() or "").split())
facts = [resume["name"], resume["headline"], resume["profile"], resume["email"], resume["hobby"], *resume["skills"], *resume["education"].values()]
for item in [*resume["experience"], *resume["projects"], resume["volunteer"]]:
    facts.extend([item["name"], item["role"], item["dates"], *item["bullets"]])
for fact in facts:
    assert " ".join(fact.split()) in extracted, f"PDF missing fact: {fact}"
assert all(term not in extracted for term in ["CCC Motors", "Hull Chrysler", "Boba Green", "linkedin.com"])
assert all(ord(char) < 128 for char in "\n".join(lines)), "Keep the ATS resume text ASCII"
manifest = {"source": sha256(source.read_bytes()).hexdigest(), "pdf": sha256(pdf_path.read_bytes()).hexdigest(), "txt": sha256(txt_path.read_bytes()).hexdigest()}
(ROOT / "src/lib/resume-artifacts.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"pages": 1, "verifiedFacts": len(facts), "pdfBytes": pdf_path.stat().st_size, "source": "one public-safe JSON source"}))
