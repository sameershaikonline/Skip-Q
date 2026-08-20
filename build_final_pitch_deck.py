"""
Skip-Q | Sequoia Capital 10-Slide Pitch Deck
Styled to match the Gush sample deck: white/light background, clean cards,
bold black headings, teal/green accents, professional startup aesthetic.
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt
import copy

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]

# ── PALETTE (matches sample: light bg, bold black headings, teal accents) ──
BG_WHITE      = RGBColor(248, 249, 252)   # near-white slide background
BG_DARK_NAVY  = RGBColor(13, 17, 45)      # for title/dark header slides
CARD_WHITE    = RGBColor(255, 255, 255)   # card background
CARD_BORDER   = RGBColor(220, 225, 235)   # subtle card border
SECTION_BG    = RGBColor(237, 242, 255)   # section tint
GRADIENT_TEAL = RGBColor(0, 200, 180)     # teal accent (like gush logo colour)
GRADIENT_BLUE = RGBColor(99, 102, 241)    # indigo/purple accent
ACCENT_GREEN  = RGBColor(16, 185, 129)    # emerald green
ACCENT_CORAL  = RGBColor(239, 68, 68)     # red/coral for pain points
ACCENT_AMBER  = RGBColor(245, 158, 11)    # amber
ACCENT_PURPLE = RGBColor(139, 92, 246)    # purple

TEXT_BLACK    = RGBColor(15, 23, 42)      # near-black heading
TEXT_DARK     = RGBColor(30, 41, 59)      # dark body
TEXT_MED      = RGBColor(71, 85, 105)     # medium grey
TEXT_LIGHT    = RGBColor(148, 163, 184)   # light muted
TEXT_WHITE    = RGBColor(255, 255, 255)

FONT = "Calibri"
FONT_H = "Calibri"

# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def add_bg(slide, color=None):
    """Fill entire slide background."""
    c = color or BG_WHITE
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0,
                                prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = c
    bg.line.fill.background()

def add_rect(slide, x, y, w, h, fill=CARD_WHITE, border=CARD_BORDER,
             border_width=Pt(0.75), radius=True):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    s = slide.shapes.add_shape(shape_type, Inches(x), Inches(y),
                               Inches(w), Inches(h))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if border is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = border
        s.line.width = border_width
    return s

def add_tb(slide, x, y, w, h):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return tf

def para(tf, text, size, bold=False, italic=False,
         color=TEXT_BLACK, align=PP_ALIGN.LEFT, space_before=0, space_after=0):
    p = tf.add_paragraph()
    p.text = text
    p.font.name = FONT_H if bold else FONT
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.italic = italic
    p.font.color.rgb = color
    p.alignment = align
    p.space_before = Pt(space_before)
    p.space_after = Pt(space_after)
    return p

def first_para(tf, text, size, bold=False, italic=False,
               color=TEXT_BLACK, align=PP_ALIGN.LEFT, space_before=0):
    p = tf.paragraphs[0]
    p.text = text
    p.font.name = FONT_H if bold else FONT
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.italic = italic
    p.font.color.rgb = color
    p.alignment = align
    p.space_before = Pt(space_before)
    return p

def add_accent_bar(slide, x, y, w=0.05, h=0.35, color=GRADIENT_TEAL):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                               Inches(x), Inches(y), Inches(w), Inches(h))
    s.fill.solid()
    s.fill.fore_color.rgb = color
    s.line.fill.background()

def add_section_label(slide, text, x=0.45, y=0.28, color=GRADIENT_TEAL):
    tf = add_tb(slide, x, y, 4, 0.35)
    first_para(tf, text, 8.5, bold=True, color=color)

def add_slide_num(slide, num):
    tf = add_tb(slide, 12.5, 7.1, 0.6, 0.3)
    first_para(tf, str(num).zfill(2), 9, color=TEXT_LIGHT, align=PP_ALIGN.RIGHT)

def add_logo_tag(slide, x=0.45, y=7.1):
    tf = add_tb(slide, x, y, 2, 0.3)
    first_para(tf, "⬡  Skip-Q", 9, bold=True, color=TEXT_MED)

def card_with_text(slide, x, y, w, h, label, value, desc,
                   label_color=GRADIENT_TEAL, value_size=26, fill=CARD_WHITE):
    add_rect(slide, x, y, w, h, fill=fill)
    tf = add_tb(slide, x+0.18, y+0.22, w-0.36, h-0.3)
    first_para(tf, label, 9, bold=True, color=label_color)
    para(tf, value, value_size, bold=True, color=TEXT_BLACK, space_before=3)
    para(tf, desc, 10, color=TEXT_MED, space_before=4)

def bullet_card(slide, x, y, w, h, title, title_color, bullets, fill=CARD_WHITE):
    add_rect(slide, x, y, w, h, fill=fill)
    tf = add_tb(slide, x+0.2, y+0.2, w-0.4, h-0.35)
    first_para(tf, title, 12.5, bold=True, color=title_color)
    for b in bullets:
        p = tf.add_paragraph()
        p.text = f"  {b}"
        p.font.name = FONT
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MED
        p.space_before = Pt(4)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 ─ COMPANY PURPOSE
# ══════════════════════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(blank)
add_bg(s1, BG_DARK_NAVY)

# big teal accent bar
a = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.08), Inches(7.5))
a.fill.solid(); a.fill.fore_color.rgb = GRADIENT_TEAL; a.line.fill.background()

# Tag line top
tf = add_tb(s1, 0.55, 0.5, 12.5, 0.4)
first_para(tf, "JNTUH University College of Engineering  •  JNTUH TBI IDEATHON 2026",
           10, color=RGBColor(100, 180, 200))

# Big name
tf = add_tb(s1, 0.55, 1.1, 9, 1.4)
first_para(tf, "Skip-Q", 72, bold=True, color=TEXT_WHITE)

# Divider dot
tf = add_tb(s1, 0.55, 2.45, 10, 0.5)
first_para(tf, "─" * 38, 11, color=GRADIENT_TEAL)

# One-sentence purpose (Sequoia #1 requirement)
tf = add_tb(s1, 0.55, 2.9, 10.5, 1.2)
first_para(tf,
           "Skip-Q eliminates the 2–4 hour waiting room chaos at Tier-2 and Tier-3\n"
           "district hospitals by giving every patient a live real-time token radar\n"
           "on their phone — no app, no hardware, zero CapEx.",
           20, bold=False, color=TEXT_WHITE)

# Sub
tf = add_tb(s1, 0.55, 4.25, 10, 0.5)
first_para(tf, "Smart OPD Queue Management  ·  Live In-Room Consultation Radar  ·  Zero Hardware", 13,
           color=RGBColor(100, 180, 200))

# Live URLs box
add_rect(s1, 0.55, 4.95, 9.8, 1.05, fill=RGBColor(20,28,60), border=GRADIENT_TEAL, border_width=Pt(1))
tf = add_tb(s1, 0.85, 5.1, 9.2, 0.8)
first_para(tf, "🌐  LIVE PRODUCTION PLATFORM:", 9.5, bold=True, color=GRADIENT_TEAL)
para(tf, "Patient App: skipq-user.vercel.app   ·   Hospital Portal: skipq-hospital.vercel.app   ·   Admin Hub: skipq-admin.vercel.app",
     10.5, color=TEXT_WHITE)

# Bottom team strip
tf = add_tb(s1, 0.55, 6.2, 12, 0.4)
first_para(tf,
           "Shaik Sameer (23XX1A0532)   •   M. Thirisha (24XX5A0513)   •   K. Rohith Reddy (23XX1A0516)",
           11, color=TEXT_LIGHT)

add_slide_num(s1, 1)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 ─ PROBLEM
# ══════════════════════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(blank)
add_bg(s2)
add_section_label(s2, "02  ·  THE PROBLEM")
add_accent_bar(s2, 0.45, 0.55)
add_logo_tag(s2); add_slide_num(s2, 2)

tf = add_tb(s2, 0.65, 0.52, 10, 0.75)
first_para(tf, "Make the pain real and specific.", 26, bold=True, color=TEXT_BLACK)

# Stat bar
stats = [("2–4 hrs", "Wasted per OPD visit\nin Tier-2/3 towns"),
         ("4.5 Billion", "Annual walk-in OPD\nconsultations in India"),
         ("0%", "Of Tier-2/3 clinics\nhave a digital queue")]
for i, (val, lbl) in enumerate(stats):
    x = 0.45 + i * 4.16
    add_rect(s2, x, 1.42, 3.8, 1.2, fill=SECTION_BG, border=None)
    tf = add_tb(s2, x+0.22, 1.55, 3.4, 1.0)
    first_para(tf, val, 28, bold=True,
               color=ACCENT_CORAL if i != 2 else ACCENT_GREEN)
    para(tf, lbl, 10.5, color=TEXT_MED, space_before=3)

# 3 pain cards
pains = [
    ("😩  Invisible Wait", ACCENT_CORAL,
     ["Patient travels 35 km, waits 3 hours on a wooden bench",
      "Zero visibility into when doctor will call them",
      "No way to know if doctor has even arrived"]),
    ("🏙️  Metro-Only Platforms", ACCENT_AMBER,
     ["Practo, Apollo 24/7 serve only urban corporate hospitals",
      "₹12,000 – ₹36,000/yr pricing; unaffordable for small clinics",
      "Calendar slot booking — doesn't solve walk-in OPD chaos"]),
    ("🦠  Overcrowded Lobbies", ACCENT_CORAL,
     ["100+ patients packed in small waiting rooms",
      "Airborne disease cross-infection risk is very high",
      "Receptionist asked 'When is my turn?' 200× per day"]),
]
for i, (title, col, bullets) in enumerate(pains):
    x = 0.45 + i * 4.16
    bullet_card(s2, x, 2.82, 3.8, 3.95, title, col, bullets)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 ─ SOLUTION
# ══════════════════════════════════════════════════════════════════════════════
s3 = prs.slides.add_slide(blank)
add_bg(s3)
add_section_label(s3, "03  ·  SOLUTION")
add_accent_bar(s3, 0.45, 0.55, color=ACCENT_GREEN)
add_logo_tag(s3); add_slide_num(s3, 3)

tf = add_tb(s3, 0.65, 0.5, 11, 0.85)
first_para(tf, "Live In-Room Consultation Radar  —  Skip-Q", 26, bold=True, color=TEXT_BLACK)

# Centre hero display box
add_rect(s3, 0.45, 1.45, 12.5, 1.4, fill=RGBColor(236, 253, 245), border=ACCENT_GREEN, border_width=Pt(1.2))
tf = add_tb(s3, 1.2, 1.6, 11, 1.1)
first_para(tf, '📺  "Now Serving Token #14     Your Token: #18     ⏱ Est. Arrival: 15 Minutes"',
           18, bold=True, color=RGBColor(5, 120, 80))
para(tf, "This is what every patient sees live on their phone — real-time, no app download required.", 12, color=TEXT_MED)

# 4 solution feature cards
sols = [
    ("📡  Zero-App Live Radar", ACCENT_GREEN,
     ["Opens in mobile browser via QR scan",
      "Sub-second real-time WebSocket updates",
      "Works on ANY phone with 4G/5G"]),
    ("🎟️  10-Second Digital Pass", GRADIENT_BLUE,
     ["Instant booking with mobile OTP verification",
      "Live SMS alerts when 2–3 tokens away",
      "Patient leaves home only when nearly their turn"]),
    ("💻  Zero CapEx for Clinics", GRADIENT_TEAL,
     ["No kiosk, no server, no wiring installation",
      "Runs on receptionist's existing Chrome browser",
      "QR acrylic standee couriered for ₹120"]),
    ("📍  Hyperlocal Town Radar", ACCENT_AMBER,
     ["OpenStreetMap geofencing for district towns",
      "Auto-detects clinics within town boundary",
      "Built specifically for Tier-2/3 Bharat"]),
]
for i, (title, col, bullets) in enumerate(sols):
    r, c_idx = divmod(i, 2)
    x = 0.45 + c_idx * 6.22
    y = 3.02 + r * 2.28
    bullet_card(s3, x, y, 5.9, 2.05, title, col, bullets)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 ─ WHY NOW?
# ══════════════════════════════════════════════════════════════════════════════
s4 = prs.slides.add_slide(blank)
add_bg(s4)
add_section_label(s4, "04  ·  WHY NOW?")
add_accent_bar(s4, 0.45, 0.55, color=ACCENT_AMBER)
add_logo_tag(s4); add_slide_num(s4, 4)

tf = add_tb(s4, 0.65, 0.5, 11, 0.85)
first_para(tf, "The Convergence Window Is Open Right Now in Bharat", 26, bold=True, color=TEXT_BLACK)

# 3 big trend cards full width stacked
trends = [
    ("📶  5G & Smartphone Explosion in Tier-2/3 Towns", GRADIENT_TEAL,
     "85%+ of rural families in Telangana's district towns carry 4G/5G smartphones with UPI. "
     "They already order food, book tickets, and pay bills digitally — healthcare queue management is the last frontier."),
    ("🦠  Post-COVID Waiting Room De-Congestion Mandate", ACCENT_CORAL,
     "Doctors and patients now actively refuse to sit in packed 100-person lobbies. "
     "Hospital infection prevention has moved from 'nice-to-have' to a non-negotiable government directive."),
    ("🏛️  Ayushman Bharat Digital Mission (ABDM) Push", GRADIENT_BLUE,
     "Government of India is actively mandating digital OPD queue management, health IDs, and "
     "digital records across all public and private hospitals — creating regulatory tailwind for Skip-Q."),
]
for i, (title, col, desc) in enumerate(trends):
    y = 1.55 + i * 1.77
    add_rect(s4, 0.45, y, 12.5, 1.58, fill=CARD_WHITE)
    add_rect(s4, 0.45, y, 0.09, 1.58, fill=col, border=None, radius=False)
    tf = add_tb(s4, 0.72, y+0.2, 11.8, 1.2)
    first_para(tf, title, 14, bold=True, color=col)
    para(tf, desc, 11.5, color=TEXT_MED, space_before=5)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 ─ MARKET SIZE (TAM / SAM / SOM)
# ══════════════════════════════════════════════════════════════════════════════
s5 = prs.slides.add_slide(blank)
add_bg(s5)
add_section_label(s5, "05  ·  MARKET SIZE")
add_accent_bar(s5, 0.45, 0.55, color=GRADIENT_BLUE)
add_logo_tag(s5); add_slide_num(s5, 5)

tf = add_tb(s5, 0.65, 0.5, 10, 0.85)
first_para(tf, "TAM  /  SAM  /  SOM  —  Realistic, Not Fantasy", 26, bold=True, color=TEXT_BLACK)

# 3 nested market circles (visual approximation with rectangles)
mkt = [
    ("TAM", "Total Addressable Market", "₹1.8 Lakh Crore",
     "4.5 Billion annual outpatient OPD consultations across 70,000+ hospitals in India",
     GRADIENT_BLUE),
    ("SAM", "Serviceable Addressable Market", "₹850 Crore",
     "25,000+ private nursing homes, polyclinics, and solo clinics in Tier-2/3 Telangana & Andhra Pradesh",
     GRADIENT_TEAL),
    ("SOM", "Serviceable Obtainable Market  (12-Month Target)", "₹4.2 Crore ARR",
     "350 target clinics across 5 Telangana launch districts: Mahabubabad, Warangal, Khammam, Suryapet, Karimnagar",
     ACCENT_GREEN),
]
for i, (tag, subtitle, value, desc, col) in enumerate(mkt):
    x = 0.45 + i * 4.16
    h = 5.0 - i * 0.55
    y = 1.45 + i * 0.28
    add_rect(s5, x, y, 3.8, h, fill=CARD_WHITE)
    add_rect(s5, x, y, 3.8, 0.09, fill=col, border=None, radius=False)
    tf = add_tb(s5, x+0.2, y+0.22, 3.4, h-0.35)
    first_para(tf, tag, 14, bold=True, color=col)
    para(tf, subtitle, 9.5, color=TEXT_MED, space_before=2)
    para(tf, value, 24, bold=True, color=TEXT_BLACK, space_before=12)
    para(tf, desc, 10.5, color=TEXT_MED, space_before=8)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 ─ COMPETITION  (Know your landscape. Show your edge.)
# ══════════════════════════════════════════════════════════════════════════════
s6 = prs.slides.add_slide(blank)
add_bg(s6)
add_section_label(s6, "06  ·  COMPETITION")
add_accent_bar(s6, 0.45, 0.55, color=ACCENT_CORAL)
add_logo_tag(s6); add_slide_num(s6, 6)

tf = add_tb(s6, 0.65, 0.5, 11, 0.85)
first_para(tf, "Skip-Q's Unfair Advantage vs. Every Alternative", 26, bold=True, color=TEXT_BLACK)

# Header row
headers = ["", "Practo / Apollo 24/7", "Hardware Kiosks\n(Qmatic / Drlogy)", "⬡  Skip-Q"]
col_w = [2.9, 3.15, 3.15, 3.15]
col_x = [0.45, 3.35, 6.5, 9.65]
header_colors = [TEXT_MED, TEXT_MED, TEXT_MED, ACCENT_GREEN]

for i, (h, cx, cw) in enumerate(zip(headers, col_x, col_w)):
    add_rect(s6, cx, 1.5, cw, 0.55,
             fill=RGBColor(236,253,245) if i == 3 else SECTION_BG,
             border=ACCENT_GREEN if i == 3 else CARD_BORDER)
    tf = add_tb(s6, cx+0.12, 1.58, cw-0.2, 0.42)
    first_para(tf, h, 11, bold=True, color=header_colors[i], align=PP_ALIGN.CENTER)

rows = [
    ("Core Functionality",
     "Calendar Slot (10:30 AM)",
     "Physical TV screen in lobby",
     "Live In-Room Token Radar"),
    ("Waiting Room Chaos",
     "❌ Still 1–3 hr wait on delay",
     "⚠️ Must stay in lobby to see TV",
     "✅ Track from home, leave on time"),
    ("Clinic Software Cost",
     "❌ ₹12,000 – ₹36,000 / yr",
     "❌ ₹1.5 Lakh+ per kiosk machine",
     "✅ ₹499 – ₹999 / month flat"),
    ("Doctor's Commission Cut",
     "❌ 15–25% per consultation",
     "None (but high CapEx)",
     "✅ 0% — Doctor keeps 100%"),
    ("Patient App Requirement",
     "❌ 80 MB mandatory app install",
     "Physical paper token",
     "✅ Zero app — Instant Web QR scan"),
]

row_colors = [CARD_WHITE, RGBColor(255,252,252), CARD_WHITE, RGBColor(255,252,252), CARD_WHITE]
for r, (row_data, bg) in enumerate(zip(rows, row_colors)):
    y = 2.12 + r * 1.02
    for ci, (cx, cw) in enumerate(zip(col_x, col_w)):
        fc = RGBColor(236,253,245) if ci == 3 else bg
        bc = ACCENT_GREEN if ci == 3 else CARD_BORDER
        add_rect(s6, cx, y, cw, 0.95, fill=fc, border=bc)
        tf = add_tb(s6, cx+0.12, y+0.1, cw-0.2, 0.78)
        is_skipq = (ci == 3)
        is_label = (ci == 0)
        first_para(tf, row_data[ci], 10.5,
                   bold=(is_skipq or is_label),
                   color=ACCENT_GREEN if is_skipq else (TEXT_BLACK if is_label else TEXT_MED),
                   align=PP_ALIGN.CENTER if ci > 0 else PP_ALIGN.LEFT)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 ─ PRODUCT  (Screenshots, demos, how it actually works)
# ══════════════════════════════════════════════════════════════════════════════
s7 = prs.slides.add_slide(blank)
add_bg(s7)
add_section_label(s7, "07  ·  PRODUCT")
add_accent_bar(s7, 0.45, 0.55, color=GRADIENT_TEAL)
add_logo_tag(s7); add_slide_num(s7, 7)

tf = add_tb(s7, 0.65, 0.5, 11, 0.85)
first_para(tf, "3-Portal Unified Product — Live in Production", 26, bold=True, color=TEXT_BLACK)

# 3 portal cards
portals = [
    ("📱  Patient Web App", GRADIENT_TEAL, "skipq-user.vercel.app",
     ["Hyperlocal town radar detects nearby clinics",
      "Real-time countdown: 'Token #18 | 3 Ahead | 15 Min'",
      "10-second OTP booking → Digital token pass",
      "Automated SMS alert when 2 tokens away",
      "Works on any phone — Zero app install needed"]),
    ("🏢  Hospital Desk Portal", ACCENT_GREEN, "skipq-hospital.vercel.app",
     ["1-Click 'Call Next Patient' desk controller",
      "Doctor session manager & OPD schedule board",
      "Emergency priority token override & patient recall",
      "Daily patient throughput & efficiency analytics",
      "Auto-syncs with patient phones in real-time"]),
    ("👑  Super Admin Hub", GRADIENT_BLUE, "skipq-admin.vercel.app",
     ["District hospital onboarding in under 5 minutes",
      "Doctor credential & profile verification",
      "Live multi-hospital queue monitoring dashboard",
      "Supabase PostgreSQL governance & audit logs",
      "Subscription billing & plan management"]),
]
for i, (title, col, url, feats) in enumerate(portals):
    x = 0.45 + i * 4.27
    add_rect(s7, x, 1.52, 4.0, 5.65, fill=CARD_WHITE)
    add_rect(s7, x, 1.52, 4.0, 0.1, fill=col, border=None, radius=False)
    tf = add_tb(s7, x+0.2, 1.68, 3.6, 5.3)
    first_para(tf, title, 13, bold=True, color=col)
    para(tf, url, 9.5, italic=True, color=TEXT_LIGHT, space_before=2)
    for f in feats:
        p = tf.add_paragraph()
        p.text = f"  ✔  {f}"
        p.font.name = FONT
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MED
        p.space_before = Pt(7)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 ─ BUSINESS MODEL  (How do you make money? Be explicit.)
# ══════════════════════════════════════════════════════════════════════════════
s8 = prs.slides.add_slide(blank)
add_bg(s8)
add_section_label(s8, "08  ·  BUSINESS MODEL")
add_accent_bar(s8, 0.45, 0.55, color=ACCENT_GREEN)
add_logo_tag(s8); add_slide_num(s8, 8)

tf = add_tb(s8, 0.65, 0.5, 11, 0.85)
first_para(tf, "Dual Revenue Engine: B2B SaaS + B2C Per-Token Fees", 26, bold=True, color=TEXT_BLACK)

# Top summary metrics
metrics = [
    ("₹2,78,960 / mo", "Gross Monthly Revenue\n(40-Clinic Pilot)", ACCENT_GREEN),
    ("₹18,000 / mo", "Total Operating Cost\n(₹0.36 / patient token)", ACCENT_CORAL),
    ("~93%", "Gross Margin\n(15-day clinic payback)", GRADIENT_BLUE),
]
for i, (val, lbl, col) in enumerate(metrics):
    x = 0.45 + i * 4.16
    add_rect(s8, x, 1.42, 3.8, 1.5, fill=SECTION_BG)
    tf = add_tb(s8, x+0.2, 1.6, 3.4, 1.25)
    first_para(tf, val, 22, bold=True, color=col)
    para(tf, lbl, 10, color=TEXT_MED, space_before=4)

# Revenue table
rows_bm = [
    ("B2B SaaS Subscriptions",
     "25 Clinics@₹499 + 10 Poly@₹1,499 + 5 Hospitals@₹3,499",
     "₹44,960 / mo"),
    ("Per-Token Convenience Fee",
     "25,000 advance digital bookings × ₹5.00",
     "₹1,25,000 / mo"),
    ("Platform Processing Fee",
     "25,000 advance digital bookings × ₹2.00",
     "₹50,000 / mo"),
    ("Live SMS Handling Charge",
     "25,000 advance digital bookings × ₹1.50",
     "₹37,500 / mo"),
    ("VIP Priority Passes & Pharmacy Referrals",
     "500 Fast-Track@₹25 + 600 Pharmacy Leads@₹15",
     "₹21,500 / mo"),
]
col_bm_x = [0.45, 5.5, 10.15]
col_bm_w = [5.0, 4.6, 2.73]
bm_headers = ["Revenue Stream", "Formula (40 Clinics Pilot)", "Monthly Revenue"]
for ci, (h, cx, cw) in enumerate(zip(bm_headers, col_bm_x, col_bm_w)):
    add_rect(s8, cx, 3.08, cw, 0.5,
             fill=RGBColor(236,253,245) if ci == 2 else SECTION_BG,
             border=ACCENT_GREEN if ci == 2 else CARD_BORDER)
    tf = add_tb(s8, cx+0.12, 3.16, cw-0.2, 0.38)
    first_para(tf, h, 10, bold=True,
               color=ACCENT_GREEN if ci == 2 else TEXT_DARK)

for r, (s, f, rev) in enumerate(rows_bm):
    y = 3.65 + r * 0.73
    for ci, (cx, cw) in enumerate(zip(col_bm_x, col_bm_w)):
        add_rect(s8, cx, y, cw, 0.68, fill=CARD_WHITE,
                 border=ACCENT_GREEN if ci == 2 else CARD_BORDER)
        tf = add_tb(s8, cx+0.12, y+0.1, cw-0.2, 0.55)
        vals = [s, f, rev]
        first_para(tf, vals[ci], 10,
                   bold=(ci == 0 or ci == 2),
                   color=ACCENT_GREEN if ci == 2 else (TEXT_DARK if ci == 0 else TEXT_MED))

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 9 ─ TEAM
# ══════════════════════════════════════════════════════════════════════════════
s9 = prs.slides.add_slide(blank)
add_bg(s9)
add_section_label(s9, "09  ·  TEAM")
add_accent_bar(s9, 0.45, 0.55, color=ACCENT_PURPLE)
add_logo_tag(s9); add_slide_num(s9, 9)

tf = add_tb(s9, 0.65, 0.5, 11, 0.85)
first_para(tf, "Why We Are the Right Team to Build Skip-Q", 26, bold=True, color=TEXT_BLACK)

# Subtitle
tf = add_tb(s9, 0.65, 1.22, 10, 0.4)
first_para(tf, "JNTUH University College of Engineering  •  Computer Science Engineering", 11.5, color=TEXT_MED)

# 3 team member cards
members = [
    ("SS", "Shaik Sameer", "23XX1A0532", "Lead Full-Stack Architect & Founder",
     GRADIENT_TEAL,
     ["Built & deployed all 3 live portals (Next.js 14, Supabase, Prisma, WebSockets)",
      "Designed complete real-time queue engine from scratch",
      "Domain expertise: Tier-2/3 OPD operations in Telangana",
      "Manages end-to-end: architecture, deployment, business model"]),
    ("MT", "M. Thirisha", "24XX5A0513", "Frontend Engineer & UX Designer",
     ACCENT_PURPLE,
     ["Patient Web App UI/UX design and mobile optimization",
      "Responsive design for low-end Tier-2/3 smartphone screens",
      "Geolocation radar interface and real-time token display",
      "Conducted user testing with rural patient cohorts"]),
    ("KR", "K. Rohith Reddy", "23XX1A0516", "Backend Engineer & Data Analyst",
     GRADIENT_BLUE,
     ["Supabase PostgreSQL schema design and optimization",
      "Bulk SMS API integration (MSG91 / Fast2SMS)",
      "Hospital analytics dashboard and reporting engine",
      "Market sizing and unit economics financial modelling"]),
]

for i, (initials, name, roll, role, col, points) in enumerate(members):
    x = 0.45 + i * 4.27
    add_rect(s9, x, 1.72, 4.0, 5.5, fill=CARD_WHITE)

    # Avatar circle (simulated with small square)
    av = s9.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x+1.35), Inches(1.9),
                              Inches(1.3), Inches(1.3))
    av.fill.solid(); av.fill.fore_color.rgb = col
    av.line.fill.background()
    tf_av = add_tb(s9, x+1.35, 1.98, 1.3, 1.1)
    first_para(tf_av, initials, 26, bold=True, color=TEXT_WHITE, align=PP_ALIGN.CENTER)

    tf = add_tb(s9, x+0.2, 3.28, 3.6, 3.8)
    first_para(tf, name, 14, bold=True, color=TEXT_BLACK, align=PP_ALIGN.CENTER)
    para(tf, roll, 9.5, color=TEXT_LIGHT, align=PP_ALIGN.CENTER, space_before=2)
    para(tf, role, 10.5, bold=True, color=col, align=PP_ALIGN.CENTER, space_before=5)
    for pt in points:
        p = tf.add_paragraph()
        p.text = f"  • {pt}"
        p.font.name = FONT
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MED
        p.space_before = Pt(5)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 10 ─ THE ASK
# ══════════════════════════════════════════════════════════════════════════════
s10 = prs.slides.add_slide(blank)
add_bg(s10, BG_DARK_NAVY)

# teal accent bar
a = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.08), Inches(7.5))
a.fill.solid(); a.fill.fore_color.rgb = ACCENT_GREEN; a.line.fill.background()

add_logo_tag(s10, y=0.28); add_slide_num(s10, 10)

tf = add_tb(s10, 0.55, 0.25, 5, 0.4)
first_para(tf, "10  ·  THE ASK", 9, bold=True, color=ACCENT_GREEN)

tf = add_tb(s10, 0.55, 0.62, 11, 1.2)
first_para(tf, "We are raising ₹5,00,000 in pre-seed funding\nto onboard 350 clinics across 5 Telangana districts.", 24, bold=True, color=TEXT_WHITE)

# 3 ask boxes side by side
asks = [
    ("💰  Seed Grant Ask", ACCENT_GREEN,
     "₹5,00,000",
     ["SMS & WhatsApp API Gateway infra: ₹1,50,000",
      "100-clinic QR standee print & courier: ₹1,00,000",
      "Server scaling & security audit: ₹1,00,000",
      "Field pilot rollout operations: ₹1,50,000"]),
    ("🏛️  Incubation Support", GRADIENT_TEAL,
     "JNTUH TBI",
     ["Pre-incubation cohort placement",
      "Facilitation of pilot at TVVP Area Hospital Mahabubabad",
      "ABDM compliance & MoHFW regulatory guidance",
      "Mentorship on GTM & district doctor networks"]),
    ("🎯  12-Month Milestones", GRADIENT_BLUE,
     "₹5 Lakh MRR",
     ["Month 1–3: 40-clinic Mahabubabad pilot (72k tokens/mo)",
      "Month 4–8: 150 clinics in Warangal & Khammam (₹1.5L MRR)",
      "Month 9–12: 500+ clinics, 5 Telangana districts",
      "Year-2: Expand to all 33 Telangana districts"]),
]
for i, (title, col, highlight, bullets) in enumerate(asks):
    x = 0.5 + i * 4.22
    add_rect(s10, x, 2.0, 4.0, 5.15, fill=RGBColor(20,28,60), border=col, border_width=Pt(1.2))
    tf = add_tb(s10, x+0.2, 2.18, 3.6, 4.8)
    first_para(tf, title, 12.5, bold=True, color=col)
    para(tf, highlight, 26, bold=True, color=TEXT_WHITE, space_before=8)
    for b in bullets:
        p = tf.add_paragraph()
        p.text = f"  → {b}"
        p.font.name = FONT
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_LIGHT
        p.space_before = Pt(7)

# Thank you strip
add_rect(s10, 0.5, 7.05, 12.33, 0.38, fill=RGBColor(20,28,60), border=None, radius=False)
tf = add_tb(s10, 1.0, 7.1, 11, 0.3)
first_para(tf,
           "Shaik Sameer (23XX1A0532)   •   M. Thirisha (24XX5A0513)   •   K. Rohith Reddy (23XX1A0516)   •   JNTUH University College of Engineering",
           9.5, color=TEXT_LIGHT, align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════════
OUT = "C:/OnlineConsultation/Skip_Q_Final_Pitch_Deck.pptx"
prs.save(OUT)
print("DONE! Saved: " + OUT)
