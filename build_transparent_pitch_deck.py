import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_transparent_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Modern High-Contrast Theme Colors
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

    def add_header(slide, title, section_name=""):
        apply_slide_bg(slide)

        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = f"SKIP-Q  |  JNTUH TBI IDEATHON 2026   •   {section_name.upper()}"
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

    # ==========================================
    # SLIDE 1: COVER
    # ==========================================
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
    p.text = "JNTUH TBI IDEATHON 2026   •   STARTUP PITCH & FINANCIALS"
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
    p.space_before = Pt(10)

    p = tf.add_paragraph()
    p.text = "Smart OPD Queue Management & Live In-Room Consultation Radar"
    p.font.name = FONT
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "Complete Working Model, Real Unit Economics, Transparent Financials & The Practo Comparison"
    p.font.name = FONT
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = C_MUTED
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "Founder: Sameer Shaik   •   JNTUH TBI 2-Day Bootcamp (20–21 August 2026)\nLive Web Platform: https://skipq-user.vercel.app"
    p.font.name = FONT
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_before = Pt(26)

    # ==========================================
    # SLIDE 2: THE CORE PROBLEM & THE SOLUTION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "The Real Ground Problem & Skip-Q Solution", "01. Concept & Problem")

    prob_sol = [
        ("The Ground Reality", "In Tier-2/3 district towns (Mahabubabad, etc.), patients travel 30+ km from villages and wait 2 to 4 hours in crowded waiting halls with zero visibility into doctor arrival or turn.", C_CORAL),
        ("The Skip-Q Solution", "A live in-room consultation radar showing real-time token numbers ('Now Serving: #14 | Your Token: #18') with auto-countdown arrival times and SMS alerts on their phone.", C_BLUE),
        ("The Ground Impact", "Zero waiting room crowding, 40% faster clinic consultation turnover, zero cross-infection risks, and 100% digital transparency with zero expensive hardware.", C_EMERALD)
    ]

    for i, (title, desc, col) in enumerate(prob_sol):
        x = Inches(0.8 + i * 4.04)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.4)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = f"0{i+1}"
        p.font.name = FONT
        p.font.size = Pt(30)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.space_before = Pt(10)

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(13)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(14)

    # ==========================================
    # SLIDE 3: COMPLETE END-TO-END FUNCTIONALITY
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "End-to-End System Flow: From Home to Doctor Room", "02. Complete Working")

    flow_steps = [
        ("Step 1: Geolocation Radar", "Patient opens web app. Location radar auto-detects Mahabubabad town boundary and displays local hospitals with live token boards."),
        ("Step 2: Instant 10-Sec Booking", "Patient selects doctor, enters contact details, verifies 6-digit OTP, and secures a digital OPD token pass instantly from home."),
        ("Step 3: Live Radar Tracking", "Patient tracks doctor's consultation live on phone ('3 Patients Ahead | Approx 15 Mins'). Patient leaves home only when 2 tokens away."),
        ("Step 4: Reception 1-Click Caller", "Receptionist clicks 'Call Next Patient' on the Hospital Portal. Real-time WebSockets auto-advance the queue and send SMS alerts."),
        ("Step 5: Smooth Consultation", "Doctor completes consultation. Next patient enters smoothly with zero reception shouting or door banging.")
    ]

    for i, (st_title, st_desc) in enumerate(flow_steps):
        y = Inches(1.65 + i * 1.05)
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.733), Inches(0.92))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = C_BLUE if i % 2 == 0 else C_EMERALD
        c.line.width = Pt(1.2)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.15)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = f"{st_title}:  {st_desc}"
        p.font.name = FONT
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE

    # ==========================================
    # SLIDE 4: PRACTO VS SKIP-Q COMPARISON (CRITICAL)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Why Skip-Q Beats Practo: The Fundamental Differences", "03. Market Comparison")

    comp_table_shape = s4.shapes.add_table(6, 4, Inches(0.8), Inches(1.65), Inches(11.733), Inches(5.15))
    ct = comp_table_shape.table
    ct.columns[0].width = Inches(2.8)
    ct.columns[1].width = Inches(3.0)
    ct.columns[2].width = Inches(3.0)
    ct.columns[3].width = Inches(2.933)

    comp_headers = ["Key Parameter", "Practo / Apollo 24/7", "Traditional Kiosks (Qmatic)", "Skip-Q (Our Platform)"]
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

    # ==========================================
    # SLIDE 5: ZERO-TRAVEL REMOTE OPERATIONS
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Zero-Travel Operational Model: 100% Remote & Scalable", "04. Operations")

    ops_cards = [
        ("1. Zero On-Site Hardware Needed", "No kiosks, local servers, or wiring installed at the clinic. The system runs entirely on the receptionist's existing browser (Chrome/Safari) via Vercel & Supabase cloud.", C_BLUE),
        ("2. 5-Minute Digital Self-Onboarding", "Clinics register online in 5 minutes. Custom QR codes are auto-generated. We courier pre-printed acrylic counter standees directly for ₹120. Zero field deployment teams.", C_EMERALD),
        ("3. 100% Remote Tech Support", "Zero travel needed to fix bugs. Centralized cloud updates automatically. Receptionist questions are resolved in under 2 minutes via WhatsApp chat or AnyDesk screen share.", C_PURPLE),
        ("4. Hyperlocal Chemist & IMA Distribution", "We partner with local pharmacies outside hospitals and district IMA WhatsApp groups. Doctors onboard digitally through peer recommendations at sub-₹600 CAC.", C_AMBER)
    ]

    for i, (title, desc, col_val) in enumerate(ops_cards):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + col * 5.96)
        y = Inches(1.65 + row * 2.65)

        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.77), Inches(2.4))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col_val
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.35)
        tf.margin_top = Inches(0.3)
        tf.margin_right = Inches(0.35)

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = col_val

        p = tf.add_paragraph()
        p.text = desc
        p.font.name = FONT
        p.font.size = Pt(12.5)
        p.font.color.rgb = C_MUTED
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 6: TRANSPARENT COST STRUCTURE (REAL NUMBERS)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Transparent Cost Structure: Real Itemized Numbers", "05. Cost Breakdown")

    cost_table_shape = s6.shapes.add_table(6, 3, Inches(0.8), Inches(1.65), Inches(11.733), Inches(5.15))
    cst = cost_table_shape.table
    cst.columns[0].width = Inches(3.4)
    cst.columns[1].width = Inches(5.5)
    cst.columns[2].width = Inches(2.833)

    cst_headers = ["Cost Line Item", "Transparent Technical Calculation", "Monthly Cost (₹)"]
    for i, h in enumerate(cst_headers):
        cell = cst.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = HEADER_FILL
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_CORAL if i == 2 else C_BLUE
        p.font.name = FONT

    cst_rows = [
        ("1. Cloud & Database Infrastructure", "Vercel Pro (₹1,700) + Supabase Pro DB (₹2,100) + SSL/Domain (₹700)", "₹4,500 / month"),
        ("2. Bulk SMS & OTP API Gateway", "50,000 patient token alerts × ₹0.10 per SMS (MSG91 / Fast2SMS)", "₹5,000 / month"),
        ("3. Clinic QR Standees & Print Kits", "40 clinics × ₹120 per acrylic counter display (amortized over 6 months)", "₹800 / month"),
        ("4. Local Support & Operations", "1 Part-time District Coordinator / Intern stipend for partner coordination", "₹6,000 / month"),
        ("5. Payment Gateway & Maintenance", "Razorpay / Cashfree API charges, WhatsApp Business API & contingency", "₹1,700 / month")
    ]

    for r_idx, (item, calc, cost) in enumerate(cst_rows, start=1):
        for c_idx, val in enumerate([item, calc, cost]):
            cell = cst.cell(r_idx, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_CORAL if c_idx == 2 else (C_WHITE if c_idx == 0 else C_MUTED)
            p.font.bold = (c_idx == 0 or c_idx == 2)
            p.font.name = FONT

    # ==========================================
    # SLIDE 7: TRANSPARENT REVENUE STREAMS (REAL NUMBERS)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Transparent Revenue Streams: Exact Pricing & Projections", "06. Revenue Model")

    rev_table_shape = s7.shapes.add_table(6, 3, Inches(0.8), Inches(1.65), Inches(11.733), Inches(5.15))
    rt = rev_table_shape.table
    rt.columns[0].width = Inches(3.4)
    rt.columns[1].width = Inches(5.5)
    rt.columns[2].width = Inches(2.833)

    rt_headers = ["Revenue Stream", "Pricing Formula & Volume (40 Clinics Pilot)", "Monthly Revenue (₹)"]
    for i, h in enumerate(rt_headers):
        cell = rt.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = HEADER_FILL
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_EMERALD if i == 2 else C_BLUE
        p.font.name = FONT

    rt_rows = [
        ("1. Hospital SaaS Subscriptions", "• 25 Solo Clinics @ ₹499/mo (₹12,475)\n• 10 Polyclinics @ ₹1,499/mo (₹14,990)\n• 5 Multi-Doctor Hospitals @ ₹3,499/mo (₹17,495)", "₹44,960 / month"),
        ("2. Digital Token Convenience Fee", "25,000 advance digital bookings × ₹5.00 convenience fee", "₹1,25,000 / month"),
        ("3. Platform Processing Fee", "25,000 advance digital bookings × ₹2.00 processing charge", "₹50,000 / month"),
        ("4. Live Queue SMS Handling Charge", "25,000 advance digital bookings × ₹1.50 live queue alert fee", "₹37,500 / month"),
        ("5. VIP Priority Passes & Pharmacy Tie-ups", "500 Fast-Track Priority Passes @ ₹25 + 600 Pharmacy referrals @ ₹15", "₹21,500 / month")
    ]

    for r_idx, (stream, formula, rev) in enumerate(rt_rows, start=1):
        for c_idx, val in enumerate([stream, formula, rev]):
            cell = rt.cell(r_idx, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10)
            p.font.color.rgb = C_EMERALD if c_idx == 2 else (C_WHITE if c_idx == 0 else C_MUTED)
            p.font.bold = (c_idx == 0 or c_idx == 2)
            p.font.name = FONT

    # ==========================================
    # SLIDE 8: FINANCIAL SUMMARY & UNIT ECONOMICS
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Key Financial Metrics: Highly Profitable & Scalable", "07. Financial Summary")

    fin_cards = [
        ("Total Monthly Revenue", "₹2,78,960", "Combined SaaS subscriptions, per-token convenience charges, and value-added services.", C_EMERALD),
        ("Total Monthly Operating Cost", "₹18,000", "Ultra-lean cloud architecture, bulk SMS at ₹0.10/SMS, zero kiosk hardware costs.", C_CORAL),
        ("Net Monthly Profit", "₹2,60,960", "~93% Gross Margin. Highly profitable even at small 40-clinic pilot scale.", C_EMERALD)
    ]

    for i, (title, val, desc, col) in enumerate(fin_cards):
        x = Inches(0.8 + i * 4.04)
        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.65), Inches(3.65), Inches(5.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.4)
        tf.margin_right = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

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

    # ==========================================
    # SLIDE 9: THANK YOU & LIVE DEMO
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(s9)

    c9 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    c9.fill.solid()
    c9.fill.fore_color.rgb = CARD_BG
    c9.line.color.rgb = C_EMERALD
    c9.line.width = Pt(2)

    tf = c9.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.6)
    tf.margin_top = Inches(0.6)
    tf.margin_right = Inches(0.6)

    p = tf.paragraphs[0]
    p.text = "Thank You!"
    p.font.name = FONT
    p.font.size = Pt(52)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD

    p = tf.add_paragraph()
    p.text = '"Eliminating Hospital Waiting Room Chaos through Technology & Transparency"'
    p.font.name = FONT
    p.font.size = Pt(17)
    p.font.italic = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "Live Interactive Demonstration:\n• 📱 Patient Web App: https://skipq-user.vercel.app\n• 🏢 Hospital Desk Caller: https://skipq-hospital.vercel.app\n• 👑 Super Admin Governance Hub: https://skipq-admin.vercel.app\n• 💻 Open Source Repository: https://github.com/sameir-dev/Skip-Q.git"
    p.font.name = FONT
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_BLUE
    p.space_before = Pt(26)

    out_file = "C:/OnlineConsultation/Skip_Q_Transparent_Pitch_Deck.pptx"
    prs.save(out_file)
    print(f"Transparent Pitch Deck saved at: {out_file}")

if __name__ == "__main__":
    build_transparent_deck()
