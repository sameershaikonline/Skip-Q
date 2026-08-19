import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Blank slide layout
    blank_layout = prs.slide_layouts[6]

    # Executive Modern Dark Palette
    C_BG = RGBColor(11, 17, 32)       # Slate 950
    C_CARD = RGBColor(15, 23, 42)     # Slate 900
    C_BORDER = RGBColor(30, 41, 59)   # Slate 800
    C_BLUE = RGBColor(37, 99, 235)    # Blue 600
    C_CYAN = RGBColor(56, 189, 248)   # Sky 400
    C_EMERALD = RGBColor(16, 185, 129)# Emerald 500
    C_ROSE = RGBColor(239, 68, 68)    # Rose 500
    C_AMBER = RGBColor(245, 158, 11)  # Amber 500
    C_WHITE = RGBColor(255, 255, 255)
    C_MUTED = RGBColor(148, 163, 184) # Slate 400

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.color.rgb = C_BG

    def add_header(slide, title_text, category_text=""):
        apply_background(slide)

        # Header Container
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.2))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Category / Brand Pill
        p0 = tf.paragraphs[0]
        p0.text = f"SKIP-Q  |  JNTUH TBI IDEATHON 2026   •   {category_text.upper()}"
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = C_CYAN
        p0.font.name = "Segoe UI"

        # Main Title
        p1 = tf.add_paragraph()
        p1.text = title_text
        p1.font.size = Pt(22)
        p1.font.bold = True
        p1.font.color.rgb = C_WHITE
        p1.font.name = "Segoe UI"
        p1.space_before = Pt(4)

    # ----------------------------------------------------
    # SLIDE 1: COVER
    # ----------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    apply_background(slide1)

    card1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(11.733), Inches(5.7))
    card1.fill.solid()
    card1.fill.fore_color.rgb = C_CARD
    card1.line.color.rgb = C_BLUE
    card1.line.width = Pt(2)

    tf1 = card1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = Inches(0.6)
    tf1.margin_top = Inches(0.6)
    tf1.margin_right = Inches(0.6)

    p = tf1.paragraphs[0]
    p.text = "JNTUH TBI IDEATHON 2026  •  STARTUP PITCH"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = "Segoe UI"

    p = tf1.add_paragraph()
    p.text = "Skip-Q"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = "Segoe UI"
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = "Smart OPD Queue Management & Live In-Room Consultation Radar"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.font.name = "Segoe UI"
    p.space_before = Pt(6)

    p = tf1.add_paragraph()
    p.text = "Restoring Time & Dignity to Healthcare Waiting Rooms in Bharat's Tier-2 & Tier-3 Towns"
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = C_MUTED
    p.font.name = "Segoe UI"
    p.space_before = Pt(4)

    p = tf1.add_paragraph()
    p.text = "Founder: Sameer Shaik  •  JNTUH TBI Bootcamp (20–21 August 2026)\nLive Web Platform: https://skipq-user.vercel.app"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.font.name = "Segoe UI"
    p.space_before = Pt(24)

    # ----------------------------------------------------
    # SLIDE 2: THE PROBLEM
    # ----------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "The Agony of Indian Hospital OPDs", "01. The Problem")

    prob_data = [
        ("01", "2 to 4 Hours Wasted", "Patients travel 30+ km from rural mandals and sit blindly on crowded hospital benches without knowing when their doctor will call them.", C_ROSE),
        ("02", "70% Bharat Neglected", "Metro apps like Practo focus only on high-fee scheduled appointments, completely ignoring walk-in OPD queues in district towns like Mahabubabad.", C_AMBER),
        ("03", "Cross-Infection & Chaos", "Overcrowded waiting halls increase airborne viral transmission, noise levels, doctor fatigue, and receptionist exhaustion.", C_ROSE)
    ]

    for i, (num, title, desc, col) in enumerate(prob_data):
        x = Inches(0.8 + i * 4.04)
        c = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(3.65), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.4)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = col
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.font.name = "Segoe UI"
        p.space_before = Pt(10)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.font.name = "Segoe UI"
        p.space_before = Pt(12)

    # ----------------------------------------------------
    # SLIDE 3: THE SOLUTION
    # ----------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Live In-Room Consultation Radar", "02. The Solution")

    sol_data = [
        ("📡 Live In-Room Token Radar", "Patients track the exact ongoing token number live on their mobile (Now Serving: #14 | Your Token: #18) with sub-second WebSocket updates."),
        ("🎟️ 10-Second Digital Token Pass", "Book verified OPD passes in seconds using phone & email OTP, complete with live estimated arrival countdown timers."),
        ("💻 Zero Hardware Capital Cost", "Zero expensive ₹1.5L kiosk machines needed. Clinics run the entire caller desk directly from any smartphone, tablet, or laptop browser."),
        ("📍 Hyperlocal Town Radar", "Sub-100ms OpenStreetMap location detection tailored specifically for district headquarters like Mahabubabad.")
    ]

    for i, (title, desc) in enumerate(sol_data):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + col * 5.96)
        y = Inches(1.8 + row * 2.5)

        c = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.77), Inches(2.25))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD
        c.line.color.rgb = C_BLUE
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.3)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_CYAN
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.font.name = "Segoe UI"
        p.space_before = Pt(8)

    # ----------------------------------------------------
    # SLIDE 4: ARCHITECTURE (3 PILLARS)
    # ----------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Unified 3-Pillar Cloud Infrastructure", "03. Architecture")

    arch_data = [
        ("1. Patient Web App", "skipq-user.vercel.app", C_BLUE, [
            "Live clinic discovery & location radar",
            "Real-time token counter & countdown",
            "Instant OTP verification & token pass",
            "SMS/Email updates before your turn"
        ]),
        ("2. Hospital Desk Portal", "skipq-hospital.vercel.app", C_CYAN, [
            "1-Click 'Call Next Patient' desk",
            "Doctor schedule & OPD session manager",
            "Emergency token priority override",
            "Daily patient throughput analytics"
        ]),
        ("3. Super Admin Hub", "skipq-admin.vercel.app", C_EMERALD, [
            "District-wide hospital onboarding",
            "Doctor credential & bio verification",
            "Live system-wide consultation tracker",
            "Supabase PostgreSQL governance"
        ])
    ]

    for i, (title, url, col, bullets) in enumerate(arch_data):
        x = Inches(0.8 + i * 4.04)
        c = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(3.65), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.35)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = url
        p.font.size = Pt(11)
        p.font.italic = True
        p.font.color.rgb = col
        p.font.name = "Segoe UI"
        p.space_before = Pt(2)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = f"• {b}"
            p.font.size = Pt(12)
            p.font.color.rgb = C_MUTED
            p.font.name = "Segoe UI"
            p.space_before = Pt(8)

    # ----------------------------------------------------
    # SLIDE 5: BUSINESS MODEL CANVAS
    # ----------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Business Model Canvas (BMC)", "04. Business Model")

    # Clean 5x2 Table
    table_shape = slide5.shapes.add_table(3, 5, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.9))
    table = table_shape.table

    for i in range(5):
        table.columns[i].width = Inches(2.346)

    bmc_headers = ["Key Partners", "Key Activities", "Value Propositions", "Customer Relationships", "Customer Segments"]
    for i, h in enumerate(bmc_headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_CYAN
        p.font.name = "Segoe UI"

    bmc_row1 = [
        "• District Hospitals\n• Private Nursing Homes\n• IMA Doctor Chapters\n• Local Pharmacies",
        "• Clinic Onboarding\n• Real-Time Queue Cloud\n• Patient SMS Dispatch\n• ABDM Compliance",
        "• Zero Waiting Chaos\n• 40% Higher Clinic Flow\n• Live Token on Mobile\n• Zero Hardware Cost",
        "• Self-serve QR Portal\n• Dedicated WhatsApp Support\n• Automated SMS Reminders",
        "• Rural & Town Patients\n• Solo & Polyclinic Doctors\n• Private Nursing Homes\n• District Health Dept"
    ]
    for i, val in enumerate(bmc_row1):
        cell = table.cell(1, i)
        cell.text = val
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(10)
        p.font.color.rgb = C_MUTED
        p.font.name = "Segoe UI"

    # Bottom Cost & Revenue Merged Cells
    cell_cost_hdr = table.cell(2, 0)
    cell_cost_hdr.text = "Cost Structure:\n• Cloud Servers (Next.js/Supabase)\n• SMS/WhatsApp API Gateway\n• Field QR Kits & Operations"
    cell_cost_hdr.fill.solid()
    cell_cost_hdr.fill.fore_color.rgb = C_CARD
    p = cell_cost_hdr.text_frame.paragraphs[0]
    p.font.size = Pt(10)
    p.font.color.rgb = C_ROSE
    p.font.bold = True

    cell_rev_hdr = table.cell(2, 2)
    cell_rev_hdr.text = "Revenue Streams:\n• Hospital SaaS: ₹999–₹2,999/month\n• Digital Token Convenience: ₹5–₹10\n• Pharmacy & Diagnostic Integrations"
    cell_rev_hdr.fill.solid()
    cell_rev_hdr.fill.fore_color.rgb = C_CARD
    p = cell_rev_hdr.text_frame.paragraphs[0]
    p.font.size = Pt(10)
    p.font.color.rgb = C_EMERALD
    p.font.bold = True

    # ----------------------------------------------------
    # SLIDE 6: MARKET SIZE
    # ----------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Market Size (TAM / SAM / SOM)", "05. Market Opportunity")

    mkt_data = [
        ("TAM (India OPD Consultations)", "₹1.8 Lakh Cr", "4.5 Billion annual outpatient consultations across Indian healthcare ecosystem.", C_CYAN),
        ("SAM (Tier-2/3 TS & AP)", "₹850 Crore", "25,000+ small-to-mid private clinics and nursing homes across semi-urban TS & AP.", C_CYAN),
        ("SOM (5 Launch Districts)", "₹4.2 Cr ARR", "350 target clinics across Mahabubabad, Warangal, Khammam, Suryapet, and Karimnagar.", C_EMERALD)
    ]

    for i, (label, val, desc, col) in enumerate(mkt_data):
        x = Inches(0.8 + i * 4.04)
        c = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(3.65), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD
        c.line.color.rgb = C_BLUE
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.4)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = label
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_CYAN
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = val
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = col
        p.font.name = "Segoe UI"
        p.space_before = Pt(14)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.font.name = "Segoe UI"
        p.space_before = Pt(14)

    # ----------------------------------------------------
    # SLIDE 7: COMPETITIVE MATRIX
    # ----------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Competitive Advantage Matrix", "06. Market Comparison")

    comp_table_shape = slide7.shapes.add_table(6, 4, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.9))
    ct = comp_table_shape.table
    ct.columns[0].width = Inches(3.0)
    ct.columns[1].width = Inches(2.9)
    ct.columns[2].width = Inches(2.9)
    ct.columns[3].width = Inches(2.933)

    comp_headers = ["Key Parameters", "Practo / Apollo 24/7", "Qmatic / Kiosk Hardware", "Skip-Q (Our Solution)"]
    for i, h in enumerate(comp_headers):
        cell = ct.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_EMERALD if i == 3 else C_CYAN
        p.font.name = "Segoe UI"

    comp_rows = [
        ("Live In-Room Token Tracking", "❌ No (Slot-only)", "⚠️ Only on lobby TV", "✅ Real-time on Mobile"),
        ("Hardware Capital Cost", "None", "❌ ₹1.5L+ per kiosk", "✅ ₹0 (Runs on Browser)"),
        ("Tier-2/3 Town Focus", "❌ Metro-Centric", "❌ Corporate Hospitals", "✅ Hyperlocal Bharat"),
        ("Clinic Onboarding Time", "2–3 Weeks", "4+ Weeks", "✅ Under 10 Minutes"),
        ("Pricing for Small Clinics", "❌ High Commission", "❌ Expensive CapEx", "✅ ₹999 / month flat")
    ]

    for r_idx, row in enumerate(comp_rows, start=1):
        for c_idx, val in enumerate(row):
            cell = ct.cell(r_idx, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_CARD
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(11)
            p.font.color.rgb = C_EMERALD if c_idx == 3 else (C_WHITE if c_idx == 0 else C_MUTED)
            p.font.bold = (c_idx == 0 or c_idx == 3)
            p.font.name = "Segoe UI"

    # ----------------------------------------------------
    # SLIDE 8: THE ASK & ROADMAP
    # ----------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "What We Seek from JNTUH TBI", "07. Incubation Roadmap")

    asks = [
        ("🏛️ 1. Incubation & Clinical Mentorship", "Clinical workflow validation, ABDM integration guidance, and healthcare compliance mentorship from JNTUH TBI network."),
        ("💰 2. ₹5 Lakhs Pre-Seed Grant", "To fund SMS/WhatsApp gateway scaling, QR onboarding kits, and 50-clinic pilot rollout in Mahabubabad & Warangal."),
        ("🤝 3. Government TVVP Hospital Pilot", "Facilitate trial rollout at Telangana Vaidya Vidhana Parishad (TVVP) Area Hospital in Mahabubabad.")
    ]

    for i, (title, desc) in enumerate(asks):
        y = Inches(1.8 + i * 1.65)
        c = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.733), Inches(1.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_CARD
        c.line.color.rgb = C_BLUE
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.4)
        tf.margin_top = Inches(0.25)
        tf.margin_right = Inches(0.4)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_CYAN
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.font.name = "Segoe UI"
        p.space_before = Pt(6)

    # ----------------------------------------------------
    # SLIDE 9: THANK YOU & DEMO
    # ----------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    apply_background(slide9)

    card9 = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(11.733), Inches(5.7))
    card9.fill.solid()
    card9.fill.fore_color.rgb = C_CARD
    card9.line.color.rgb = C_EMERALD
    card9.line.width = Pt(2)

    tf9 = card9.text_frame
    tf9.word_wrap = True
    tf9.margin_left = Inches(0.6)
    tf9.margin_top = Inches(0.6)
    tf9.margin_right = Inches(0.6)

    p = tf9.paragraphs[0]
    p.text = "Thank You!"
    p.font.size = Pt(50)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.font.name = "Segoe UI"

    p = tf9.add_paragraph()
    p.text = '"Restoring Time and Dignity to Healthcare Waiting Rooms across Bharat"'
    p.font.size = Pt(17)
    p.font.italic = True
    p.font.color.rgb = C_WHITE
    p.font.name = "Segoe UI"
    p.space_before = Pt(6)

    p = tf9.add_paragraph()
    p.text = "Experience the Live Working Prototype Now:\n• 📱 Patient Web App: https://skipq-user.vercel.app\n• 🏢 Hospital Reception Caller: https://skipq-hospital.vercel.app\n• 👑 Super Admin Governance: https://skipq-admin.vercel.app\n• 💻 GitHub Repository: https://github.com/sameir-dev/Skip-Q.git"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = "Segoe UI"
    p.space_before = Pt(24)

    output_file = "C:/OnlineConsultation/Skip_Q_Pitch_Deck.pptx"
    prs.save(output_file)
    print(f"Presentation saved perfectly at: {output_file}")

if __name__ == "__main__":
    create_deck()
