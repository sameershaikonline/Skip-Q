const pptxgen = require('pptxgenjs');
const fs = require('fs');

async function createPitchDeck() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Sameer & Team';
  pptx.company = 'Skip-Q Healthcare Network';
  pptx.title = 'Skip-Q — JNTUH TBI Ideathon 2026 Pitch Deck';

  // THEME COLORS (Cyber Dark Luxury)
  const BG_COLOR = '0B1120'; // Slate 950
  const CARD_BG = '1E293B'; // Slate 800
  const CARD_BORDER = '334155'; // Slate 700
  const ACCENT_BLUE = '3B82F6';
  const ACCENT_CYAN = '38BDF8';
  const ACCENT_EMERALD = '10B981';
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';
  const ACCENT_AMBER = 'F59E0B';

  // Helper for Slide Background
  function applyDarkBackground(slide) {
    slide.background = { color: BG_COLOR };
    // Top subtle brand header
    slide.addText('SKIP-Q  |  JNTUH TBI IDEATHON 2026', {
      x: 0.8,
      y: 0.4,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_BLUE,
    });
  }

  // ----------------------------------------------------
  // SLIDE 1: TITLE / COVER SLIDE
  // ----------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_COLOR };

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 4.8,
    fill: { color: CARD_BG },
    line: { color: ACCENT_BLUE, width: 2 },
    roundRadius: 0.2,
  });

  slide1.addText('Skip-Q', {
    x: 1.2,
    y: 2.1,
    w: 10.5,
    h: 1.1,
    fontSize: 52,
    fontFace: 'Arial',
    bold: true,
    color: ACCENT_CYAN,
  });

  slide1.addText('Smart OPD Queue Management & Live Consultation Radar', {
    x: 1.2,
    y: 3.2,
    w: 10.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  slide1.addText('Eliminating Healthcare Waiting Room Chaos for Bharat’s Tier-2 & Tier-3 Towns', {
    x: 1.2,
    y: 3.8,
    w: 10.5,
    h: 0.5,
    fontSize: 15,
    fontFace: 'Arial',
    italic: true,
    color: TEXT_MUTED,
  });

  slide1.addText('JNTUH Technology Business Incubator (JTBI)  •  20–21 August 2026\nLive Deployed Platform: https://skipq-user.vercel.app', {
    x: 1.2,
    y: 5.1,
    w: 10.5,
    h: 0.8,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: ACCENT_EMERALD,
  });

  // ----------------------------------------------------
  // SLIDE 2: THE BURNING PROBLEM
  // ----------------------------------------------------
  const slide2 = pptx.addSlide();
  applyDarkBackground(slide2);

  slide2.addText('THE PROBLEM: The Agony of Indian Hospital OPDs', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  // 3 Problem Cards
  const pCards = [
    {
      title: '2 to 4 Hours Wasted',
      desc: 'Patients travel 20–50 km from villages and sit blindly on crowded hospital benches without knowing when their turn is.',
      color: 'EF4444',
    },
    {
      title: 'Tier-2/3 Digital Neglect',
      desc: 'Existing apps like Practo focus on expensive metro consultations and ignore walk-in OPD queues in district towns like Mahabubabad.',
      color: ACCENT_AMBER,
    },
    {
      title: 'Cross-Infection & Chaos',
      desc: 'Overcrowded waiting rooms increase airborne viral transmission, noise pollution, doctor fatigue, and receptionist burnout.',
      color: 'F87171',
    },
  ];

  pCards.forEach((c, idx) => {
    const xPos = 0.8 + idx * 3.9;
    slide2.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.8,
      w: 3.6,
      h: 4.6,
      fill: { color: CARD_BG },
      line: { color: c.color, width: 1.5 },
      roundRadius: 0.15,
    });

    slide2.addText(`0${idx + 1}`, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.0,
      h: 0.5,
      fontSize: 28,
      fontFace: 'Arial',
      bold: true,
      color: c.color,
    });

    slide2.addText(c.title, {
      x: xPos + 0.3,
      y: 2.8,
      w: 3.0,
      h: 0.8,
      fontSize: 18,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_WHITE,
    });

    slide2.addText(c.desc, {
      x: xPos + 0.3,
      y: 3.7,
      w: 3.0,
      h: 2.2,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ----------------------------------------------------
  // SLIDE 3: THE SOLUTION — SKIP-Q
  // ----------------------------------------------------
  const slide3 = pptx.addSlide();
  applyDarkBackground(slide3);

  slide3.addText('THE SOLUTION: Live In-Room Consultation Radar', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  const solFeatures = [
    { title: 'Live In-Room Token Tracking', desc: 'Patients see exact ongoing consultation number live (Now Serving: #14 | Your Token: #18).' },
    { title: 'Instant Digital Token Booking', desc: 'Book verified OPD tokens in 10 seconds via phone/email OTP with live countdown timer.' },
    { title: 'Zero Hardware Required', desc: 'Clinics require zero expensive kiosks. Runs on existing smartphones, tablets, or PC browsers.' },
    { title: 'Hyperlocal Coverage', desc: 'GPS & OpenStreetMap location radar built specifically for district headquarters & rural mandals.' },
  ];

  solFeatures.forEach((f, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.8 + row * 2.5;

    slide3.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 5.6,
      h: 2.2,
      fill: { color: CARD_BG },
      line: { color: ACCENT_BLUE, width: 1.5 },
      roundRadius: 0.15,
    });

    slide3.addText(`✔ ${f.title}`, {
      x: xPos + 0.3,
      y: yPos + 0.3,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });

    slide3.addText(f.desc, {
      x: xPos + 0.3,
      y: yPos + 0.8,
      w: 5.0,
      h: 1.2,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ----------------------------------------------------
  // SLIDE 4: THE 3-PILLAR ECOSYSTEM
  // ----------------------------------------------------
  const slide4 = pptx.addSlide();
  applyDarkBackground(slide4);

  slide4.addText('ARCHITECTURE: 3-Pillar Unified Platform', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  const pillars = [
    {
      title: '1. Patient Web App',
      url: 'skipq-user.vercel.app',
      points: [
        'Live hospital & clinic discovery',
        'Zomato-speed location radar (Photon/OSM)',
        'Live digital token counter & countdown',
        'SMS/Email real-time OTP updates',
      ],
      color: ACCENT_BLUE,
    },
    {
      title: '2. Hospital Desk Portal',
      url: 'skipq-hospital.vercel.app',
      points: [
        '1-Click "Call Next Patient" controller',
        'Doctor schedule & OPD session manager',
        'Emergency token priority override',
        'Real-time daily patient flow analytics',
      ],
      color: ACCENT_CYAN,
    },
    {
      title: '3. Super Admin Hub',
      url: 'skipq-admin.vercel.app',
      points: [
        'District-wide hospital onboarding',
        'Doctor credential & bio verification',
        'Live system-wide consultation tracker',
        'Automated database & security governance',
      ],
      color: ACCENT_EMERALD,
    },
  ];

  pillars.forEach((p, idx) => {
    const xPos = 0.8 + idx * 3.9;
    slide4.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.8,
      w: 3.6,
      h: 4.7,
      fill: { color: CARD_BG },
      line: { color: p.color, width: 1.5 },
      roundRadius: 0.15,
    });

    slide4.addText(p.title, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.0,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      bold: true,
      color: TEXT_WHITE,
    });

    slide4.addText(p.url, {
      x: xPos + 0.3,
      y: 2.5,
      w: 3.0,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      italic: true,
      color: p.color,
    });

    const bulletText = p.points.map((pt) => `• ${pt}`).join('\n\n');
    slide4.addText(bulletText, {
      x: xPos + 0.3,
      y: 3.0,
      w: 3.0,
      h: 3.2,
      fontSize: 12,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      lineSpacing: 16,
    });
  });

  // ----------------------------------------------------
  // SLIDE 5: BUSINESS MODEL CANVAS (BMC)
  // ----------------------------------------------------
  const slide5 = pptx.addSlide();
  applyDarkBackground(slide5);

  slide5.addText('BUSINESS MODEL CANVAS (BMC)', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  const bmcRows = [
    [
      { text: 'Key Partners', options: { bold: true, color: ACCENT_CYAN } },
      { text: 'Key Activities', options: { bold: true, color: ACCENT_CYAN } },
      { text: 'Value Propositions', options: { bold: true, color: ACCENT_CYAN } },
      { text: 'Customer Relationships', options: { bold: true, color: ACCENT_CYAN } },
      { text: 'Customer Segments', options: { bold: true, color: ACCENT_CYAN } },
    ],
    [
      { text: '• District Hospitals\n• Private Nursing Homes\n• IMA Doctor Chapters\n• Local Pharmacies' },
      { text: '• Clinic Onboarding\n• Real-Time Queue Cloud\n• Patient SMS Dispatch\n• ABDM Compliance' },
      { text: '• Zero Waiting Chaos\n• 40% Higher Clinic Flow\n• Live Token on Mobile\n• Zero Hardware Cost' },
      { text: '• Self-serve QR Portal\n• Dedicated WhatsApp Support\n• Automated SMS Reminders' },
      { text: '• Rural & Semi-Urban Patients\n• Single/Polyclinic Doctors\n• Private Nursing Homes\n• District Health Dept' },
    ],
    [
      { text: 'Cost Structure', options: { bold: true, color: 'EF4444' } },
      { text: '• Cloud Servers (Next.js/Supabase)\n• SMS/WhatsApp API Gateway\n• Field QR Standee Kits', options: { colspan: 2 } },
      { text: 'Revenue Streams', options: { bold: true, color: ACCENT_EMERALD } },
      { text: '• Hospital SaaS: ₹999–₹2,999/month\n• Digital Token Convenience Fee: ₹5–₹10\n• Pharmacy & Diagnostic Integrations', options: { colspan: 2 } },
    ],
  ];

  slide5.addTable(bmcRows, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 4.8,
    fill: { color: CARD_BG },
    color: TEXT_WHITE,
    fontSize: 10,
    fontFace: 'Arial',
    border: { pt: 1, color: CARD_BORDER },
    align: 'left',
    valign: 'middle',
  });

  // ----------------------------------------------------
  // SLIDE 6: MARKET SIZE & OPPORTUNITY
  // ----------------------------------------------------
  const slide6 = pptx.addSlide();
  applyDarkBackground(slide6);

  slide6.addText('MARKET OPPORTUNITY (TAM / SAM / SOM)', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  const metrics = [
    { label: 'TAM (Total Available Market)', value: '₹1.8 Lakh Cr', sub: '4.5 Billion annual outpatient consultations across India.' },
    { label: 'SAM (Serviceable Market)', value: '₹850 Cr', sub: '25,000+ Tier-2/3 clinics across Telangana & Andhra Pradesh.' },
    { label: 'SOM (Initial Beachhead)', value: '₹4.2 Cr ARR', sub: '350 clinics across 5 target districts (Mahabubabad, Warangal, Khammam).' },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 0.8 + idx * 3.9;
    slide6.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.8,
      w: 3.6,
      h: 4.6,
      fill: { color: CARD_BG },
      line: { color: ACCENT_BLUE, width: 1.5 },
      roundRadius: 0.15,
    });

    slide6.addText(m.label, {
      x: xPos + 0.3,
      y: 2.2,
      w: 3.0,
      h: 0.6,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });

    slide6.addText(m.value, {
      x: xPos + 0.3,
      y: 2.9,
      w: 3.0,
      h: 1.0,
      fontSize: 32,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_EMERALD,
    });

    slide6.addText(m.sub, {
      x: xPos + 0.3,
      y: 4.1,
      w: 3.0,
      h: 1.8,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      lineSpacing: 18,
    });
  });

  // ----------------------------------------------------
  // SLIDE 7: COMPETITIVE MATRIX
  // ----------------------------------------------------
  const slide7 = pptx.addSlide();
  applyDarkBackground(slide7);

  slide7.addText('COMPETITIVE ADVANTAGE', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  const compTable = [
    [
      { text: 'Key Parameters', options: { bold: true, color: ACCENT_CYAN } },
      { text: 'Practo / Apollo 24/7', options: { bold: true, color: TEXT_MUTED } },
      { text: 'Qmatic / Kiosk Hardware', options: { bold: true, color: TEXT_MUTED } },
      { text: 'Skip-Q (Our Solution)', options: { bold: true, color: ACCENT_EMERALD } },
    ],
    [
      { text: 'Live In-Room Token Tracking' },
      { text: '❌ No (Slot-only)' },
      { text: '⚠️ Only on lobby TV' },
      { text: '✅ Real-time on Mobile' },
    ],
    [
      { text: 'Hardware Capital Cost' },
      { text: '❌ None' },
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
      { text: '⚠️ 2–3 Weeks' },
      { text: '❌ 4+ Weeks' },
      { text: '✅ Under 10 Minutes' },
    ],
    [
      { text: 'Pricing for Small Clinics' },
      { text: '❌ High Commission' },
      { text: '❌ Expensive CapEx' },
      { text: '✅ ₹999 / month flat' },
    ],
  ];

  slide7.addTable(compTable, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 4.8,
    fill: { color: CARD_BG },
    color: TEXT_WHITE,
    fontSize: 12,
    fontFace: 'Arial',
    border: { pt: 1, color: CARD_BORDER },
    align: 'center',
    valign: 'middle',
  });

  // ----------------------------------------------------
  // SLIDE 8: THE ASK & JNTUH TBI ROADMAP
  // ----------------------------------------------------
  const slide8 = pptx.addSlide();
  applyDarkBackground(slide8);

  slide8.addText('THE ASK & JNTUH TBI INCUBATION GOALS', {
    x: 0.8,
    y: 0.9,
    w: 11.5,
    h: 0.6,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  const asks = [
    {
      title: '1. Incubation & Mentorship',
      desc: 'Clinical pilot validation, ABDM integration guidance, and healthcare compliance mentorship from JNTUH TBI network.',
    },
    {
      title: '2. ₹5 Lakhs Pre-Seed Grant',
      desc: 'To fund SMS/WhatsApp gateway scaling, QR onboarding kits, and 50-clinic pilot rollout in Mahabubabad & Warangal.',
    },
    {
      title: '3. Government Pilot Facilitation',
      desc: 'Facilitate trial rollout at Telangana Vaidya Vidhana Parishad (TVVP) Area Hospital in Mahabubabad.',
    },
  ];

  asks.forEach((a, idx) => {
    const yPos = 1.8 + idx * 1.6;
    slide8.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: yPos,
      w: 11.7,
      h: 1.35,
      fill: { color: CARD_BG },
      line: { color: ACCENT_BLUE, width: 1.5 },
      roundRadius: 0.15,
    });

    slide8.addText(a.title, {
      x: 1.1,
      y: yPos + 0.2,
      w: 11.0,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      bold: true,
      color: ACCENT_CYAN,
    });

    slide8.addText(a.desc, {
      x: 1.1,
      y: yPos + 0.65,
      w: 11.0,
      h: 0.6,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });
  });

  // ----------------------------------------------------
  // SLIDE 9: THANK YOU & LIVE DEMO
  // ----------------------------------------------------
  const slide9 = pptx.addSlide();
  slide9.background = { color: BG_COLOR };

  slide9.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 11.7,
    h: 4.8,
    fill: { color: CARD_BG },
    line: { color: ACCENT_EMERALD, width: 2 },
    roundRadius: 0.2,
  });

  slide9.addText('Thank You!', {
    x: 1.2,
    y: 2.0,
    w: 10.5,
    h: 0.9,
    fontSize: 48,
    fontFace: 'Arial',
    bold: true,
    color: ACCENT_EMERALD,
  });

  slide9.addText('"Restoring Time & Dignity to Healthcare Waiting Rooms"', {
    x: 1.2,
    y: 3.0,
    w: 10.5,
    h: 0.5,
    fontSize: 18,
    fontFace: 'Arial',
    italic: true,
    color: TEXT_WHITE,
  });

  slide9.addText('Experience the Live Working Prototype Now:\n• Patient App: https://skipq-user.vercel.app\n• Hospital Caller: https://skipq-hospital.vercel.app\n• Super Admin: https://skipq-admin.vercel.app', {
    x: 1.2,
    y: 3.8,
    w: 10.5,
    h: 1.8,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: ACCENT_CYAN,
    lineSpacing: 22,
  });

  const outputPath = 'C:/OnlineConsultation/Skip-Q_JNTUH_Ideathon_2026.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`PPTX file generated successfully at: ${outputPath}`);
}

createPitchDeck().catch(console.error);
