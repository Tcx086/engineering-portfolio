"""Generate concise and full public resumes from the shared, selected v4.4 facts."""
from hashlib import sha256
from html import escape
import json
import re
from pathlib import Path

from pypdf import PdfReader
from pypdf.generic import ContentStream, DictionaryObject, IndirectObject
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "src/lib/resume.json"
resume = json.loads(source.read_text(encoding="utf-8"))
concise_projects = [item for item in resume["projects"] if item["concise"]]
pdf_path = ROOT / "static/tom-chen-resume.pdf"
txt_path = ROOT / "static/tom-chen-resume.txt"
lines = [resume["name"], resume["headline"], resume["email"], resume["github"], resume["website"], "", "PROFILE", resume["profile"], "", "TECHNICAL SKILLS", *resume["skills"], ""]
story = []
body = ParagraphStyle("Body", fontName="Helvetica", fontSize=9.4, leading=12.3, textColor=colors.HexColor("#222222"), alignment=TA_LEFT, spaceAfter=3)
section_style = ParagraphStyle("Section", parent=body, fontName="Helvetica-Bold", fontSize=10, leading=13, spaceBefore=9, spaceAfter=4)
entry_style = ParagraphStyle("Entry", parent=body, fontName="Helvetica-Bold", fontSize=9.8, leading=13, spaceBefore=4)
role_style = ParagraphStyle("Role", parent=body, fontSize=9, leading=11.5, textColor=colors.HexColor("#444444"))
bullet_style = ParagraphStyle("Bullet", parent=body, leftIndent=9, firstLineIndent=-7, spaceAfter=2)

def paragraph(text, style=None):
    story.append(Paragraph(escape(text), style or body))

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
for title, items in [("ENGINEERING EXPERIENCE", resume["experience"]), ("INDEPENDENT PROJECTS", concise_projects), ("VOLUNTEER EXPERIENCE", [resume["volunteer"]])]:
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
txt_path.write_text("\n".join(lines), encoding="utf-8", newline="\n")
document = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=30, bottomMargin=30, title="Tom Chen - Engineering Resume", author="Tom Chen", invariant=1)
document.build(story)

reader = PdfReader(pdf_path)
assert len(reader.pages) == 1, "Public resume must fit on one page"
extracted = " ".join((reader.pages[0].extract_text() or "").split())
facts = [resume["name"], resume["headline"], resume["profile"], resume["email"], resume["hobby"], *resume["skills"], resume["education"]["school"], resume["education"]["credential"]]
for item in [*resume["experience"], *concise_projects, resume["volunteer"]]:
    facts.extend([item["name"], item["role"], item["dates"], *item["bullets"]])
for fact in facts:
    assert " ".join(fact.split()) in extracted, f"PDF missing fact: {fact}"
assert all(term not in extracted for term in ["CCC Motors", "Hull Chrysler", "Boba Green", "linkedin.com"])
assert all(ord(char) < 128 for char in "\n".join(lines)), "Keep the ATS resume text ASCII"

full_path = ROOT / "static/tom-chen-master-resume-public.pdf"
story = []
body = ParagraphStyle("FullBody", fontName="Helvetica", fontSize=10, leading=12.6, textColor=colors.HexColor("#222222"), spaceAfter=3, allowOrphans=0, allowWidows=0)
section_style = ParagraphStyle("FullSection", parent=body, fontName="Helvetica-Bold", fontSize=10.5, leading=13, textColor=colors.HexColor("#245b55"), spaceBefore=8, spaceAfter=4, keepWithNext=True)
entry_style = ParagraphStyle("FullEntry", parent=body, fontName="Helvetica-Bold", fontSize=10.2, leading=13, spaceBefore=5, keepWithNext=True)
role_style = ParagraphStyle("FullRole", parent=body, fontSize=9.6, leading=12, textColor=colors.HexColor("#444444"), keepWithNext=True)
bullet_style = ParagraphStyle("FullBullet", parent=body, leftIndent=9, firstLineIndent=-7, spaceAfter=3)
group_style = ParagraphStyle("ProjectGroup", parent=section_style, fontSize=10, spaceBefore=5)
full_facts = [resume["name"], resume["headline"], resume["location"], resume["email"], resume["fullProfile"], *resume["fullSkills"], *resume["education"].values(), resume["languages"], resume["hobby"]]

def full_entry(item, project=False):
    paragraph(item["name"] + " | " + item["dates"], entry_style)
    role = item["role"]
    if project and item["name"] == "Microstructure Discovery Factory":
        role = "Independent Project | " + role
    paragraph(role, role_style)
    bullets = item.get("fullBullets", item["bullets"])
    for text in bullets:
        paragraph("- " + text, bullet_style)
    full_facts.extend([item["name"], role, item["dates"], *bullets])

paragraph(resume["name"], ParagraphStyle("FullName", parent=body, fontName="Helvetica-Bold", fontSize=23, leading=27, spaceAfter=3))
paragraph(resume["headline"], body)
paragraph(resume["location"], body)
links = [("mailto:" + resume["email"], resume["email"]), (resume["github"], "github.com/Tcx086"), (resume["website"] + "/", "portfolio.tcx086.com/")]
story.append(Paragraph(" | ".join(f'<link href="{escape(url, quote=True)}" color="#245b55">{escape(label)}</link>' for url, label in links), body))
section("PROFESSIONAL PROFILE")
paragraph(resume["fullProfile"])
section("CORE SKILLS")
for skill in resume["fullSkills"]:
    paragraph(skill)
section("WORK EXPERIENCE")
for item in resume["experience"]:
    full_entry(item)
story.append(PageBreak())
section("PROJECTS")
for group in ["Quantitative Projects", "Analytical Projects"]:
    if group == "Analytical Projects":
        story.append(PageBreak())
        section("PROJECTS (CONTINUED)")
    paragraph(group.upper(), group_style)
    for item in resume["projects"]:
        if item["group"] == group:
            full_entry(item, project=True)
section("VOLUNTEER EXPERIENCE")
full_entry(resume["volunteer"])
section("EDUCATION")
paragraph(resume["education"]["school"] + " | " + resume["education"]["attendance"], entry_style)
paragraph(resume["education"]["credential"])
paragraph(resume["education"]["areas"])
section("LANGUAGES")
paragraph(resume["languages"])
section("HOBBY")
paragraph(resume["hobby"])

def footer(canvas, document):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#555555"))
    canvas.drawString(36, 22, "Tom Chen | Full Resume | Public derivative of Master v4.4")
    canvas.drawRightString(letter[0] - 36, 22, str(document.page))
    canvas.restoreState()

class FullResumeDocument(SimpleDocTemplate):
    def afterPage(self):
        footer(self.canv, self)

FullResumeDocument(str(full_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=30, bottomMargin=36, title="Tom Chen - Full Public Resume", author="Tom Chen", subject="Public derivative of Master Resume v4.4", invariant=1).build(story)
full_reader = PdfReader(full_path)
full_text = " ".join(" ".join(page.extract_text() or "" for page in full_reader.pages).split())
assert len(full_reader.pages) == 3, "Review pagination if the full resume changes length"
for heading in ["PROFESSIONAL PROFILE", "CORE SKILLS", "WORK EXPERIENCE", "QUANTITATIVE PROJECTS", "ANALYTICAL PROJECTS", "VOLUNTEER EXPERIENCE", "EDUCATION", "LANGUAGES", "HOBBY"]:
    assert heading in full_text, f"Full PDF missing section: {heading}"
for fact in full_facts:
    assert " ".join(fact.split()) in full_text, f"Full PDF missing fact: {fact}"
assert all(ord(char) < 128 for char in full_text), "Keep PDF text ASCII"

def verify_public_pdf(path):
    pdf = PdfReader(path)
    assert not pdf.attachments and not pdf.get_fields(), "No attachments or form fields in public PDFs"
    prohibited = {"/EmbeddedFiles", "/Filespec", "/JavaScript", "/JS", "/AcroForm", "/XFA", "/OCProperties", "/Metadata", "/RichMedia", "/AA", "/OpenAction"}
    for generation, objects in pdf.xref.items():
        for number in objects:
            if number == 0:
                continue
            obj = pdf.get_object(IndirectObject(number, generation, pdf))
            if isinstance(obj, DictionaryObject):
                assert not prohibited.intersection(obj), "Unexpected embedded or active PDF content"
    allowed_links = {url for url, _ in links}
    for page in pdf.pages:
        for reference in page.get("/Annots", []):
            annotation = reference.get_object()
            assert annotation["/Subtype"] == "/Link"
            assert annotation["/A"]["/S"] == "/URI" and annotation["/A"]["/URI"] in allowed_links
        for operands, operator in ContentStream(page["/Contents"], pdf).operations:
            assert operator != b"Do", "No embedded graphics or objects"
            assert operator != b"Tr" or operands == [0], "No invisible text modes"
    text = "\n".join(page.extract_text() or "" for page in pdf.pages) + str(pdf.metadata)
    assert not re.search(r"CCC Motors|Hull Chrysler|Boba Green|linkedin\.com|Xiangyun|work permit|passport|immigration|visa|2\.5K|\b\d{3}[-. ]\d{3}[-. ]\d{4}\b|\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b|\b[A-Z]:[\\/]", text, re.I), "Private or excluded PDF content"
    assert set(re.findall(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text)) == {resume["email"]}
    return {"pages": len(pdf.pages), "annotations": sum(len(page.get("/Annots", [])) for page in pdf.pages), "attachments": 0, "metadata": dict(pdf.metadata)}

privacy = {"concise": verify_public_pdf(pdf_path), "full": verify_public_pdf(full_path)}
manifest = {"source": sha256(source.read_text(encoding="utf-8").encode("utf-8")).hexdigest(), "pdf": sha256(pdf_path.read_bytes()).hexdigest(), "txt": sha256(txt_path.read_bytes()).hexdigest(), "fullPdf": sha256(full_path.read_bytes()).hexdigest(), "fullPages": len(full_reader.pages)}
(ROOT / "src/lib/resume-artifacts.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"conciseFacts": len(facts), "fullFacts": len(full_facts), "privacy": privacy}, indent=2))
