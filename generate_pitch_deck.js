const pptxgen = require('pptxgenjs');

async function buildPixelPerfectDeck() {
  const pptx = new pptxgen();

  // Widescreen 16:9 layout: 13.33 x 7.5 inches
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Sameer & Team';
  pptx.company = 'Skip-Q Healthcare Network';
  pptx.title = 'Skip-Q — JNTUH TBI Ideathon 2026 Pitch Deck';

  // THEME COLOR PALETTE (Modern Executive Navy & Emerald)
  const BG_COLOR = '030712'; // Ultra dark slate
  const CARD_BG = '0F172A'; // Slate 900
  const CARD_BORDER = '1E293B'; // Slate 800
  const BLUE_ACCENT = '2563EB'; // Blue 600
  const CYAN_ACCENT = '38BDF8'; // Sky 400
  const EMERALD_ACCENT = '10B981'; // Emerald 500
  const ROSE_ACCENT = 'EF4444'; // Rose 500
  const AMBER_ACCENT = 'F59E0B'; // Amber 500
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';
  const TEXT_DARK = 'CBD5E1';

  const FONT_FAMILY = 'Segoe UI';

  // Standard Header function with pixel-perfect alignment
  function addSlideHeader(slide, title, category) {
    slide.background = { color: BG_COLOR };

    // Brand Pill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.4,
      w: 3.2,
      h: 0.32,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
      roundRadius: 0.1,
    });
    slide.addText('SKIP-Q  |  JNTUH TBI IDEATHON 2026', {
      x: 0.8,
      y: 0.4,
      w: 3.2,
      h: 0.32,
      fontSize: 9,
      fontFace: FONT_FAMILY,
      bold: true,
      color: CYAN_ACCENT,
      align: 'center',
      valign: 'middle',
    });

    if (category) {
      slide.addText(category.toUpperCase(), {
        x: 0.8,
        y: 0.85,
        w: 11.73,
        h: 0.25,
        fontSize: 10,
        fontFace: FONT_FAMILY,
        bold: true,
        color: CYAN_ACCENT,
        valign: 'bottom',
      });
    }

    slide.addText(title, {
      x: 0.8,
      y: 1.1,
      w: 11.73,
      h: 0.5,
      fontSize: 22,
      fontFace: FONT_FAMILY,
      bold: true,
      color: TEXT_WHITE,
      valign: 'top',
    });
  }

  // ==========================================
  // SLIDE 1: COVER SLIDE
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_COLOR };

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.8,
    w: 11.73,
    h: 5.9,
    fill: { color: CARD_BG },
    line: { color: BLUE_ACCENT, width: 2 },
    roundRadius: 0.25,
  });

  slide1.addText('JNTUH TBI IDEATHON 2026  •  STARTUP PITCH', {
    x: 1.4,
    y: 1.4,
    w: 10.5,
    h: 0.35,
    fontSize: 12,
    fontFace: FONT_FAMILY,
    bold: true,
    color: CYAN_ACCENT,
  });

  slide1.addText('Skip-Q', {
    x: 1.4,
    y: 1.9,
    w: 10.5,
    h: 1.1,
    fontSize: 56,
    fontFace: FONT_FAMILY,
    bold: true,
    color: CYAN_ACCENT,
  });

  slide1.addText('Smart OPD Queue Management & Live In-Room Consultation Radar', {
    x: 1.4,
    y: 3.1,
    w: 10.5,
    h: 0.6,
    fontSize: 20,
    fontFace: FONT_FAMILY,
    bold: true,
    color: TEXT_WHITE,
  });

  slide1.addText('Restoring Time and Dignity to Healthcare Waiting Rooms in Bharat’s Tier-2 & Tier-3 Towns', {
    x: 1.4,
    y: 3.8,
    w: 10.5,
    h: 0.5,
    fontSize: 14,
    fontFace: FONT_FAMILY,
    italic: true,
    color: TEXT_MUTED,
  });

  slide1.addShape(pptx.ShapeType.line, {
    x: 1.4,
    y: 4.6,
    w: 10.5,
    h: 0,
    line: { color: '334155', width: 1 },
  });

  slide1.addText('Founder & Developer: Sameer Shaik  •  JNTUH TBI 2-Day Bootcamp (20–21 August 2026)\nLive Production Platform: https://skipq-user.vercel.app', {
    x: 1.4,
    y: 4.9,
    w: 10.5,
    h: 0.8,
    fontSize: 13,
    fontFace: FONT_FAMILY,
    bold: true,
    color: EMERALD_ACCENT,
    lineSpacing: 20,
  });

  // ==========================================
  // SLIDE 2: THE BURNING PROBLEM
  // ==========================================
  const slide2 = pptx.addSlide();
  addSlideHeader(slide2, 'The Agony of Indian Hospital OPDs', '01. The Problem');

  const probCards = [
    {
      num: '01',
      title: '2 to 4 Hours Wasted',
      desc: 'Patients travel 30+ km from rural mandals and sit blindly on crowded hospital benches without knowing when their doctor will call them.',
      color: ROSE_ACCENT,
    },
    {
      num: '02',
      title: '70% Bharat Neglected',
      desc: 'Metro apps like Practo focus only on high-fee scheduled appointments, completely ignoring walk-in OPD queues in district towns like Mahabubabad.',
      color: AMBER_ACCENT,
    },
    {
      num: '03',
      title: 'Cross-Infection & Chaos',
      desc: 'Overcrowded waiting halls increase airborne viral transmission, noise pollution, doctor burnout, and receptionist exhaustion.',
      color: ROSE_ACCENT,
    },
  ];

  probCards.forEach((c, idx) => {
    const xPos = 0.8 + idx * 4.04;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 3.65,
      h: 4.9,
      fill: { color: CARD_BG },
      line: { color: c.color, width: 1.5 },
      roundRadius: 0.2,
    });

    slide2.addText(c.num, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.05,
      h: 0.55,
      fontSize: 28,
      fontFace: FONT_FAMILY,
      bold: true,
      color: c.color,
    });

    slide2.addText(c.title, {
      x: xPos + 0.3,
      y: 2.8,
      w: 3.05,
      h: 0.7,
      fontSize: 17,
      fontFace: FONT_FAMILY,
      bold: true,
      color: TEXT_WHITE,
    });

    slide2.addText(c.desc, {
      x: xPos + 0.3,
      y: 3.6,
      w: 3.05,
      h: 2.7,
      fontSize: 13,
      fontFace: FONT_FAMILY,
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ==========================================
  // SLIDE 3: THE SOLUTION
  // ==========================================
  const slide3 = pptx.addSlide();
  addSlideHeader(slide3, 'Live In-Room Consultation Radar', '02. The Solution');

  const solCards = [
    {
      title: '📡 Live In-Room Token Radar',
      desc: 'Patients track the exact ongoing token number live on their mobile (Now Serving: #14 | Your Token: #18) with sub-second WebSocket updates.',
    },
    {
      title: '🎟️ 10-Second Digital Token Pass',
      desc: 'Book verified OPD passes in seconds using phone & email OTP, complete with live estimated arrival countdown timers.',
    },
    {
      title: '💻 Zero Hardware Capital Cost',
      desc: 'Zero expensive ₹1.5L kiosk machines needed. Clinics run the entire caller desk directly from any smartphone, tablet, or laptop browser.',
    },
    {
      title: '📍 Hyperlocal Town Radar',
      desc: 'Ultra-fast sub-100ms OpenStreetMap location detection tailored specifically for district headquarters like Mahabubabad.',
    },
  ];

  solCards.forEach((s, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const xPos = 0.8 + col * 5.96;
    const yPos = 1.8 + row * 2.5;

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.77,
      h: 2.25,
      fill: { color: CARD_BG },
      line: { color: BLUE_ACCENT, width: 1.5 },
      roundRadius: 0.15,
    });

    slide3.addText(s.title, {
      x: xPos + 0.3,
      y: yPos + 0.25,
      w: 5.17,
      h: 0.45,
      fontSize: 16,
      fontFace: FONT_FAMILY,
      bold: true,
      color: CYAN_ACCENT,
    });

    slide3.addText(s.desc, {
      x: xPos + 0.3,
      y: yPos + 0.75,
      w: 5.17,
      h: 1.3,
      fontSize: 13,
      fontFace: FONT_FAMILY,
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ==========================================
  // SLIDE 4: THE 3-PILLAR ECOSYSTEM
  // ==========================================
  const slide4 = pptx.addSlide();
  addSlideHeader(slide4, 'Unified 3-Pillar Cloud Infrastructure', '03. Architecture');

  const archCards = [
    {
      title: '1. Patient Web App',
      url: 'skipq-user.vercel.app',
      color: BLUE_ACCENT,
      bullets: [
        'Live clinic discovery & location radar',
        'Real-time token counter & countdown',
        'Instant OTP verification & token pass',
        'SMS/Email updates before your turn',
      ],
    },
    {
      title: '2. Hospital Desk Portal',
      url: 'skipq-hospital.vercel.app',
      color: CYAN_ACCENT,
      bullets: [
        '1-Click "Call Next Patient" desk',
        'Doctor schedule & OPD session manager',
        'Emergency token priority override',
        'Daily patient throughput analytics',
      ],
    },
    {
      title: '3. Super Admin Hub',
      url: 'skipq-admin.vercel.app',
      color: EMERALD_ACCENT,
      bullets: [
        'District-wide hospital onboarding',
        'Doctor credential & bio verification',
        'Live system-wide consultation tracker',
        'Supabase PostgreSQL governance',
      ],
    },
  ];

  archCards.forEach((a, idx) => {
    const xPos = 0.8 + idx * 4.04;
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 3.65,
      h: 4.9,
      fill: { color: CARD_BG },
      line: { color: a.color, width: 1.5 },
      roundRadius: 0.2,
    });

    slide4.addText(a.title, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.05,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_FAMILY,
      bold: true,
      color: TEXT_WHITE,
    });

    slide4.addText(a.url, {
      x: xPos + 0.3,
      y: 2.5,
      w: 3.05,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_FAMILY,
      italic: true,
      color: a.color,
    });

    const bText = a.bullets.map((b) => `• ${b}`).join('\n\n');
    slide4.addText(bText, {
      x: xPos + 0.3,
      y: 2.9,
      w: 3.05,
      h: 3.5,
      fontSize: 12,
      fontFace: FONT_FAMILY,
      color: TEXT_MUTED,
      lineSpacing: 16,
    });
  });

  // ==========================================
  // SLIDE 5: BUSINESS MODEL CANVAS
  // ==========================================
  const slide5 = pptx.addSlide();
  addSlideHeader(slide5, 'Business Model Canvas (BMC)', '04. Business Model');

  const bmcColW = [2.35, 2.35, 2.35, 2.35, 2.33];
  const bmcTable = [
    [
      { text: 'Key Partners', options: { bold: true, color: CYAN_ACCENT, fill: '1E293B' } },
      { text: 'Key Activities', options: { bold: true, color: CYAN_ACCENT, fill: '1E293B' } },
      { text: 'Value Propositions', options: { bold: true, color: CYAN_ACCENT, fill: '1E293B' } },
      { text: 'Relationships', options: { bold: true, color: CYAN_ACCENT, fill: '1E293B' } },
      { text: 'Customer Segments', options: { bold: true, color: CYAN_ACCENT, fill: '1E293B' } },
    ],
    [
      { text: '• District Hospitals\n• Private Nursing Homes\n• IMA Doctor Chapters\n• Local Pharmacies' },
      { text: '• Clinic Onboarding\n• Real-Time Queue Cloud\n• Patient SMS Dispatch\n• ABDM Compliance' },
      { text: '• Zero Waiting Chaos\n• 40% Higher Clinic Flow\n• Live Token on Mobile\n• Zero Hardware Cost' },
      { text: '• Self-serve QR Portal\n• Dedicated Support\n• Automated SMS Alerts' },
      { text: '• Rural & Town Patients\n• Solo & Polyclinic Doctors\n• Private Nursing Homes\n• District Health Dept' },
    ],
    [
      { text: 'Cost Structure', options: { bold: true, color: ROSE_ACCENT, fill: '1E293B' } },
      { text: '• Cloud Servers (Next.js/Supabase)\n• SMS/WhatsApp API Gateway\n• Field QR Kits & Operations', options: { colspan: 2 } },
      { text: 'Revenue Streams', options: { bold: true, color: EMERALD_ACCENT, fill: '1E293B' } },
      { text: '• Hospital SaaS: ₹999–₹2,999/month\n• Digital Token Convenience: ₹5–₹10\n• Pharmacy & Diagnostic Tie-ups', options: { colspan: 2 } },
    ],
  ];

  slide5.addTable(bmcTable, {
    x: 0.8,
    y: 1.8,
    w: 11.73,
    h: 4.9,
    colW: bmcColW,
    fill: { color: CARD_BG },
    color: TEXT_WHITE,
    fontSize: 10,
    fontFace: FONT_FAMILY,
    border: { pt: 1, color: CARD_BORDER },
    align: 'left',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 6: MARKET SIZE
  // ==========================================
  const slide6 = pptx.addSlide();
  addSlideHeader(slide6, 'Market Size (TAM / SAM / SOM)', '05. Market Opportunity');

  const marketData = [
    { label: 'TAM (India OPD Consultations)', value: '₹1.8 Lakh Cr', desc: '4.5 Billion annual outpatient consultations across Indian healthcare.' },
    { label: 'SAM (Tier-2/3 TS & AP)', value: '₹850 Crore', desc: '25,000+ small-to-mid private clinics and nursing homes across semi-urban TS & AP.' },
    { label: 'SOM (5 Launch Districts)', value: '₹4.2 Cr ARR', desc: '350 target clinics across Mahabubabad, Warangal, Khammam, Suryapet, and Karimnagar.' },
  ];

  marketData.forEach((m, idx) => {
    const xPos = 0.8 + idx * 4.04;
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 3.65,
      h: 4.9,
      fill: { color: CARD_BG },
      line: { color: BLUE_ACCENT, width: 1.5 },
      roundRadius: 0.2,
    });

    slide6.addText(m.label, {
      x: xPos + 0.3,
      y: 2.2,
      w: 3.05,
      h: 0.6,
      fontSize: 13,
      fontFace: FONT_FAMILY,
      bold: true,
      color: CYAN_ACCENT,
    });

    slide6.addText(m.value, {
      x: xPos + 0.3,
      y: 2.9,
      w: 3.05,
      h: 0.9,
      fontSize: 32,
      fontFace: FONT_FAMILY,
      bold: true,
      color: EMERALD_ACCENT,
    });

    slide6.addText(m.desc, {
      x: xPos + 0.3,
      y: 4.0,
      w: 3.05,
      h: 2.3,
      fontSize: 13,
      fontFace: FONT_FAMILY,
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ==========================================
  // SLIDE 7: COMPETITIVE ADVANTAGE
  // ==========================================
  const slide7 = pptx.addSlide();
  addSlideHeader(slide7, 'Competitive Advantage Matrix', '06. Market Comparison');

  const compColW = [3.0, 2.9, 2.9, 2.93];
  const compTableData = [
    [
      { text: 'Key Parameters', options: { bold: true, color: CYAN_ACCENT, fill: '1E293B' } },
      { text: 'Practo / Apollo 24/7', options: { bold: true, color: TEXT_MUTED, fill: '1E293B' } },
      { text: 'Qmatic / Kiosk Hardware', options: { bold: true, color: TEXT_MUTED, fill: '1E293B' } },
      { text: 'Skip-Q (Our Solution)', options: { bold: true, color: EMERALD_ACCENT, fill: '1E293B' } },
    ],
    [
      { text: 'Live In-Room Token Tracking' },
      { text: '❌ No (Slot-only)' },
      { text: '⚠️ Only on lobby TV' },
      { text: '✅ Real-time on Mobile' },
    ],
    [
      { text: 'Hardware Capital Cost' },
      { text: 'None' },
      { text: '❌ ₹1.5L+ per kiosk' },
      { text: '✅ ₹0 (Runs on Browser)' },
    ],
    [
      { text: 'Tier-2/3 Town Focus' },
      { text: '❌ Metro-Centric' },
      { text: '❌ Corporate Hospitals' },
      { text: '✅ Hyperlocal Bharat' },
    ],
    [
      { text: 'Clinic Onboarding Time' },
      { text: '2–3 Weeks' },
      { text: '4+ Weeks' },
      { text: '✅ Under 10 Minutes' },
    ],
    [
      { text: 'Pricing for Small Clinics' },
      { text: '❌ High Commission' },
      { text: '❌ Expensive CapEx' },
      { text: '✅ ₹999 / month flat' },
    ],
  ];

  slide7.addTable(compTableData, {
    x: 0.8,
    y: 1.8,
    w: 11.73,
    h: 4.9,
    colW: compColW,
    fill: { color: CARD_BG },
    color: TEXT_WHITE,
    fontSize: 11,
    fontFace: FONT_FAMILY,
    border: { pt: 1, color: CARD_BORDER },
    align: 'center',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 8: THE ASK & JNTUH TBI ROADMAP
  // ==========================================
  const slide8 = pptx.addSlide();
  addSlideHeader(slide8, 'What We Seek from JNTUH TBI', '07. Incubation Roadmap');

  const roadmapItems = [
    {
      title: '🏛️ 1. Incubation & Clinical Mentorship',
      desc: 'Clinical workflow validation, ABDM integration guidance, and healthcare regulatory compliance mentorship from JNTUH TBI ecosystem.',
    },
    {
      title: '💰 2. ₹5 Lakhs Pre-Seed Grant',
      desc: 'To fund SMS/WhatsApp gateway scaling, QR onboarding kits, and 50-clinic pilot rollout in Mahabubabad & Warangal.',
    },
    {
      title: '🤝 3. Government TVVP Hospital Pilot',
      desc: 'Facilitate trial rollout at Telangana Vaidya Vidhana Parishad (TVVP) Area Hospital in Mahabubabad.',
    },
  ];

  roadmapItems.forEach((r, idx) => {
    const yPos = 1.8 + idx * 1.65;
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: yPos,
      w: 11.73,
      h: 1.45,
      fill: { color: CARD_BG },
      line: { color: BLUE_ACCENT, width: 1.5 },
      roundRadius: 0.15,
    });

    slide8.addText(r.title, {
      x: 1.1,
      y: yPos + 0.2,
      w: 11.13,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_FAMILY,
      bold: true,
      color: CYAN_ACCENT,
    });

    slide8.addText(r.desc, {
      x: 1.1,
      y: yPos + 0.65,
      w: 11.13,
      h: 0.65,
      fontSize: 13,
      fontFace: FONT_FAMILY,
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ==========================================
  // SLIDE 9: THANK YOU & LIVE DEMO
  // ==========================================
  const slide9 = pptx.addSlide();
  slide9.background = { color: BG_COLOR };

  slide9.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.8,
    w: 11.73,
    h: 5.9,
    fill: { color: CARD_BG },
    line: { color: EMERALD_ACCENT, width: 2 },
    roundRadius: 0.25,
  });

  slide9.addText('Thank You!', {
    x: 1.4,
    y: 1.4,
    w: 10.5,
    h: 1.0,
    fontSize: 50,
    fontFace: FONT_FAMILY,
    bold: true,
    color: EMERALD_ACCENT,
  });

  slide9.addText('"Restoring Time and Dignity to Healthcare Waiting Rooms across Bharat"', {
    x: 1.4,
    y: 2.5,
    w: 10.5,
    h: 0.5,
    fontSize: 17,
    fontFace: FONT_FAMILY,
    italic: true,
    color: TEXT_WHITE,
  });

  slide9.addShape(pptx.ShapeType.line, {
    x: 1.4,
    y: 3.2,
    w: 10.5,
    h: 0,
    line: { color: '334155', width: 1 },
  });

  slide9.addText('Experience the Live Working Prototype Now:\n• 📱 Patient Web App: https://skipq-user.vercel.app\n• 🏢 Hospital Reception Caller: https://skipq-hospital.vercel.app\n• 👑 Super Admin Governance: https://skipq-admin.vercel.app\n• 💻 GitHub Repository: https://github.com/sameir-dev/Skip-Q.git', {
    x: 1.4,
    y: 3.5,
    w: 10.5,
    h: 2.6,
    fontSize: 14,
    fontFace: FONT_FAMILY,
    bold: true,
    color: CYAN_ACCENT,
    lineSpacing: 26,
  });

  const finalPath = 'C:/OnlineConsultation/Skip_Q_Pitch_Deck.pptx';
  await pptx.writeFile({ fileName: finalPath });
  console.log(`Pixel-perfect PPTX saved at: ${finalPath}`);
}

buildPixelPerfectDeck().catch(console.error);
