import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_sequoia_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Modern Executive Theme Colors
    BG_DARK = RGBColor(10, 17, 40)       # #0A1128 Deep Slate Navy
    CARD_BG = RGBColor(19, 31, 55)       # #131F37 Rich Dark Container
    CARD_BORDER = RGBColor(42, 59, 92)   # #2A3B5C Muted Border
    HEADER_FILL = RGBColor(27, 42, 74)   # #1B2A4A Table / Badge Fill
    
    C_BLUE = RGBColor(0, 180, 216)       # #00B4D8 Electric Sky
    C_EMERALD = RGBColor(16, 185, 129)   # #10B981 Vivid Emerald
    C_CORAL = RGBColor(255, 90, 95)      # #FF5A5F Vibrant Coral
    C_AMBER = RGBColor(245, 158, 11)     # #F59E0B Golden Amber
    C_PURPLE = RGBColor(168, 85, 247)    # #A855F7 Purple Accent
    C_WHITE = RGBColor(255, 255, 255)
    C_MUTED = RGBColor(148, 163, 184)    # #94A3B8 Cool Grey

    FONT = "Segoe UI"

    def apply_slide_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.color.rgb = BG_DARK
        return bg

    def add_header(slide, title, slide_num, framework_title):
        apply_slide_bg(slide)

        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = f"SEQUOIA FRAMEWORK  •  SLIDE {slide_num}: {framework_title.upper()}"
        p0.font.name = FONT
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = C_BLUE

        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.name = FONT
        p1.font.size = Pt(22)
        p1.font.bold = True
        p1.font.color.rgb = C_WHITE
        p1.space_before = Pt(4)

    # =========================================================================
    # SLIDE 1: 01. COMPANY PURPOSE (One sentence. What do you do and for whom?)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(s1)

    c1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = C_BLUE
    c1.line.width = Pt(2)

    tf = c1.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.6)
    tf.margin_top = Inches(0.6)
    tf.margin_right = Inches(0.6)

    p = tf.paragraphs[0]
    p.text = "01. COMPANY PURPOSE"
    p.font.name = FONT
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    p = tf.add_paragraph()
    p.text = "Skip-Q"
    p.font.name = FONT
    p.font.size = Pt(56)
    p.font.bold = True
    p.font.color.rgb = C_BLUE
    p.space_before = Pt(8)

    # The One-Sentence Purpose
    p = tf.add_paragraph()
    p.text = '"Skip-Q is a live in-room consultation radar that eliminates hospital waiting room chaos for patients and clinics in Tier-2 and Tier-3 Bharat."'
    p.font.name = FONT
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(12)

    p = tf.add_paragraph()
    p.text = "What we do: Real-time token tracking on mobile + 10-second digital pass + 1-click hospital caller.\nFor whom: Outpatients traveling from rural mandals and small-to-mid healthcare clinics."
    p.font.name = FONT
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = C_MUTED
    p.space_before = Pt(8)

    p = tf.add_paragraph()
    p.text = "JNTUH TBI IDEATHON 2026   •   Founder: Sameer Shaik\nLive Production Platform: https://skipq-user.vercel.app"
    p.font.name = FONT
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_before = Pt(20)

    # =========================================================================
    # SLIDE 2: 02. PROBLEM (Make the pain real and specific)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "The Agony of Hospital OPDs: Real & Specific Pain", "02", "Problem")

    problems = [
        ("2 to 4 Hours Wasted", "A villager from a rural mandal travels 35 km with an elderly parent to Mahabubabad town, only to sit on a crowded wooden bench for 3 hours with zero visibility into when the doctor will call them.", C_CORAL),
        ("70% Bharat Neglected", "Metro platforms like Practo cater only to high-income scheduled appointments in corporate hospitals, completely ignoring the 4.5 Billion walk-in OPD consultations in Tier-2/3 district towns.", C_AMBER),
        ("Chaos, Noise & Cross-Infection", "Overcrowded waiting rooms lead to airborne disease transmission, receptionists getting asked 'When is my turn?' 200 times a day, and doctors facing severe lobby noise and fatigue.", C_CORAL)
    ]

    for i, (title, desc, col) in enumerate(problems):
        x = Inches(0.8 + i * 4.04)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.35)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = f"PAIN 0{i+1}"
        p.font.name = FONT
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.space_before = Pt(8)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(12)

    # =========================================================================
    # SLIDE 3: 03. SOLUTION (Show your product, don't just describe it)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Live In-Room Consultation Radar (Skip-Q)", "03", "Solution")

    solutions = [
        ("📡 Live In-Room Radar", "Patients see the exact live token inside the doctor's room on mobile ('Now Serving: #14 | Your Token: #18 | Est: 15 Mins'). Zero blind waiting."),
        ("🎟️ 10-Second Digital Pass", "Instant booking via verified mobile/email OTP. Patient receives live SMS countdown notifications and leaves home only when 2 tokens away."),
        ("💻 Zero Hardware CapEx", "No expensive ₹1.5L kiosk machines. Clinics run the entire caller desk on existing receptionist laptops, mobile phones, or tablets."),
        ("📍 Hyperlocal Geofencing", "Sub-100ms OpenStreetMap location detection tailored specifically for district headquarters (e.g. Mahabubabad town boundary).")
    ]

    for i, (title, desc) in enumerate(solutions):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + col * 5.96)
        y = Inches(1.65 + row * 2.65)

        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.77), Inches(2.4))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = C_BLUE
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.35)
        tf.margin_top = Inches(0.3)
        tf.margin_right = Inches(0.35)

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_BLUE

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(12.5)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 4: 04. WHY NOW? (Market timing and window of opportunity)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "The Convergence of 3 Megatrends in Bharat", "04", "Why Now?")

    why_now = [
        ("1. 5G & Smartphone Penetration", "Over 85% of rural families in Tier-2/3 towns now carry 4G/5G smartphones with instant UPI and browser access. They expect digital convenience for healthcare just like UPI.", C_BLUE),
        ("2. Post-Pandemic Infection Awareness", "Patients and doctors actively refuse to sit in packed 100-person waiting halls. De-congesting hospital lobbies has become a critical health priority.", C_EMERALD),
        ("3. ABDM & Digital Health Mission", "Government of India's Ayushman Bharat Digital Mission (ABDM) is mandating digital health records and digital queue management across Indian hospitals.", C_PURPLE)
    ]

    for i, (title, desc, col) in enumerate(why_now):
        x = Inches(0.8 + i * 4.04)
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.35)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = f"TREND 0{i+1}"
        p.font.name = FONT
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.space_before = Pt(8)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(12)

    # =========================================================================
    # SLIDE 5: 05. MARKET SIZE (TAM, SAM, SOM — be realistic, not fantasy)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Realistic Ground Market Sizing (TAM / SAM / SOM)", "05", "Market Size")

    mkt_cards = [
        ("TAM (Total Addressable Market)", "₹1.8 Lakh Cr", "4.5 Billion annual outpatient OPD consultations across 70,000+ hospitals & clinics in India.", C_BLUE),
        ("SAM (Serviceable Addressable)", "₹850 Crore", "25,000+ private nursing homes and polyclinics across Tier-2 & Tier-3 towns in Telangana & AP.", C_BLUE),
        ("SOM (Serviceable Obtainable)", "₹4.2 Cr ARR", "350 target clinics across 5 launch districts (Mahabubabad, Warangal, Khammam, Suryapet, Karimnagar).", C_EMERALD)
    ]

    for i, (title, val, desc, col) in enumerate(mkt_cards):
        x = Inches(0.8 + i * 4.04)
        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.4)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_BLUE

        p = tf.add_paragraph()
        p.text = val
        p.font.name = FONT
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_before = Pt(14)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(14)

    # =========================================================================
    # SLIDE 6: 06. COMPETITION (Know your landscape. Show your edge.)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Competitive Landscape: Why Skip-Q Wins", "06", "Competition")

    comp_table_shape = s6.shapes.add_table(6, 4, Inches(0.8), Inches(1.65), Inches(11.733), Inches(5.15))
    ct = comp_table_shape.table
    ct.columns[0].width = Inches(2.8)
    ct.columns[1].width = Inches(3.0)
    ct.columns[2].width = Inches(3.0)
    ct.columns[3].width = Inches(2.933)

    comp_headers = ["Key Parameter", "Practo / Apollo 24/7", "Traditional Kiosks (Qmatic)", "Skip-Q (Our Edge)"]
    for i, h in enumerate(comp_headers):
        cell = ct.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = HEADER_FILL
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_EMERALD if i == 3 else C_BLUE
        p.font.name = FONT

    comp_rows = [
        ("Core Functionality", "Static Calendar Slot (10:30 AM)", "Physical TV Screen in Lobby", "Live In-Room Token Radar"),
        ("Waiting Room Reality", "❌ Still 1–3 hrs wait on doctor delay", "⚠️ Must sit in lobby to see TV", "✅ Zero waiting — track from home"),
        ("Clinic Software Cost", "❌ ₹12,000 – ₹36,000 / year", "❌ ₹1.5 Lakh+ per kiosk", "✅ ₹499 – ₹999 / month flat"),
        ("Commission on Doctor Fee", "❌ 15% to 25% cut per patient", "None (High CapEx)", "✅ 0% Commission (Doctor keeps 100%)"),
        ("Patient App Dependency", "❌ Mandatory 80MB app download", "Physical paper token", "✅ Zero App Install (Instant Web QR)")
    ]

    for r_idx, row in enumerate(comp_rows, start=1):
        for c_idx, val in enumerate(row):
            cell = ct.cell(r_idx, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_EMERALD if c_idx == 3 else (C_WHITE if c_idx == 0 else C_MUTED)
            p.font.bold = (c_idx == 0 or c_idx == 3)
            p.font.name = FONT

    # =========================================================================
    # SLIDE 7: 07. PRODUCT (Screenshots, demos, how it actually works)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "The 3-Portal Unified Product Architecture", "07", "Product")

    portals = [
        ("📱 1. Patient Web App", "https://skipq-user.vercel.app", C_BLUE, [
            "Hyperlocal clinic discovery & location radar",
            "Real-time countdown token tracker",
            "Instant OTP verification & digital token pass",
            "Automated SMS alerts before patient turn"
        ]),
        ("🏢 2. Hospital Desk Portal", "https://skipq-hospital.vercel.app", C_EMERALD, [
            "1-Click 'Call Next Patient' desk controller",
            "Doctor OPD schedule & session manager",
            "Emergency token priority override & recall",
            "Daily patient traffic & throughput analytics"
        ]),
        ("👑 3. Super Admin Hub", "https://skipq-admin.vercel.app", C_PURPLE, [
            "District hospital onboarding in <5 mins",
            "Doctor credential & bio verification",
            "Live multi-hospital queue monitoring",
            "Supabase PostgreSQL security governance"
        ])
    ]

    for i, (p_title, p_url, p_col, p_features) in enumerate(portals):
        x = Inches(0.8 + i * 4.04)
        c = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = p_col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.35)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = p_title
        p.font.name = FONT
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

        p = tf.add_paragraph()
        p.text = p_url
        p.font.name = FONT
        p.font.size = Pt(11)
        p.font.italic = True
        p.font.color.rgb = p_col
        p.space_before = Pt(2)

        for feat in p_features:
            p = tf.add_paragraph()
            p.text = f"✔ {feat}"
            p.font.name = FONT
            p.font.size = Pt(12)
            p.font.color.rgb = C_MUTED
            p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 8: 08. BUSINESS MODEL (How do you make money? Be explicit.)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Explicit Business Model & Unit Economics", "08", "Business Model")

    bm_table_shape = s8.shapes.add_table(5, 3, Inches(0.8), Inches(1.65), Inches(11.733), Inches(5.15))
    bmt = bm_table_shape.table
    bmt.columns[0].width = Inches(3.4)
    bmt.columns[1].width = Inches(5.5)
    bmt.columns[2].width = Inches(2.833)

    bm_headers = ["Revenue Stream", "Pricing Formula & Volume (40 Clinics Pilot)", "Monthly Revenue (₹)"]
    for i, h in enumerate(bm_headers):
        cell = bmt.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = HEADER_FILL
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_EMERALD if i == 2 else C_BLUE
        p.font.name = FONT

    bm_rows = [
        ("1. Hospital SaaS Subscriptions", "• 25 Solo Clinics @ ₹499/mo (₹12,475)\n• 10 Polyclinics @ ₹1,499/mo (₹14,990)\n• 5 Multi-Doctor Hospitals @ ₹3,499/mo (₹17,495)", "₹44,960 / month"),
        ("2. Per-Token Digital Convenience Fee", "25,000 advance digital bookings × ₹5.00 convenience fee", "₹1,25,000 / month"),
        ("3. Platform Processing & Handling", "25,000 advance digital bookings × ₹3.50 (₹2 processing + ₹1.5 SMS fee)", "₹87,500 / month"),
        ("4. VIP Passes & Pharmacy Referrals", "500 Fast-Track Priority Passes @ ₹25 + 600 Pharmacy referrals @ ₹15", "₹21,500 / month")
    ]

    for r_idx, (stream, formula, rev) in enumerate(bm_rows, start=1):
        for c_idx, val in enumerate([stream, formula, rev]):
            cell = bmt.cell(r_idx, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_EMERALD if c_idx == 2 else (C_WHITE if c_idx == 0 else C_MUTED)
            p.font.bold = (c_idx == 0 or c_idx == 2)
            p.font.name = FONT

    # =========================================================================
    # SLIDE 9: 09. TEAM (Why are you the right people to build this?)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "The Right Team to Execute: Full-Stack & Ground Execution", "09", "Team")

    team_cards = [
        ("Sameer Shaik", "Founder & Lead Full-Stack Architect", "Built and deployed the entire Next.js 14, Supabase PostgreSQL, Prisma ORM, and WebSocket real-time queue engine currently live in production.", C_BLUE),
        ("Domain & Ground Insight", "Hyperlocal Healthcare Focus", "Deep firsthand understanding of Tier-2/3 OPD dynamics in Telangana (Mahabubabad), with direct doctor networks and pharmacy distribution channels.", C_EMERALD),
        ("Execution Speed", "Proven Rapid Deployment", "Transitioned from concept to 3 fully deployed, live synchronized web platforms in record time with zero external CapEx.", C_PURPLE)
    ]

    for i, (title, role, desc, col) in enumerate(team_cards):
        x = Inches(0.8 + i * 4.04)
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.35)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

        p = tf.add_paragraph()
        p.text = role
        p.font.name = FONT
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_before = Pt(4)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(14)

    # =========================================================================
    # SLIDE 10: 10. THE ASK (How much, what for, and what's the milestone?)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Incubation, Seed Grant & 12-Month Milestones", "10", "The Ask")

    asks = [
        ("🏛️ What We Seek from JNTUH TBI", "• Pre-Incubation Cohort & Clinical Mentorship\n• Facilitation of pilot trial at Telangana Vaidya Vidhana Parishad (TVVP) Area Hospital in Mahabubabad\n• Guidance on ABDM (Ayushman Bharat Digital Mission) compliance."),
        ("💰 Seed Grant: ₹5,00,000", "• Bulk SMS & WhatsApp Gateway Infrastructure: ₹1,50,000\n• Clinic QR Standee Production & Distribution (100 Clinics): ₹1,00,000\n• Server Scaling, DB & Security Auditing: ₹1,00,000\n• Field Ambassador Operations & Pilot Rollout: ₹1,50,000"),
        ("🎯 12-Month Target Milestones", "• Month 1–3: Complete 40-clinic pilot in Mahabubabad Town (72,000 monthly patient tokens served).\n• Month 4–8: Expand to Warangal & Khammam (150 clinics, ₹1.5L MRR).\n• Month 9–12: 500+ clinics across 5 Telangana districts, reaching ₹5 Lakhs MRR.")
    ]

    for i, (title, desc) in enumerate(asks):
        y = Inches(1.65 + i * 1.75)
        c = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.733), Inches(1.55))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = C_BLUE if i == 0 else (C_EMERALD if i == 1 else C_PURPLE)
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.4)
        tf.margin_top = Inches(0.2)
        tf.margin_right = Inches(0.4)

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_BLUE if i == 0 else (C_EMERALD if i == 1 else C_PURPLE)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(12)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(4)

    # Save presentation
    out_file = "C:/OnlineConsultation/Skip_Q_Sequoia_Pitch_Deck.pptx"
    prs.save(out_file)
    print(f"Sequoia 10-Slide Pitch Deck saved at: {out_file}")

if __name__ == "__main__":
    build_sequoia_deck()
