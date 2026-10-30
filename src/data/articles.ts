export interface ArticleData {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  author: {
    name: string;
    title: string;
    avatarText: string;
  };
  readTime: string;
  date: string;
  firstParagraph: string;
  flickerNotice: {
    title: string;
    text: string;
  };
  secondParagraph: string;
  figure: {
    tag: string;
    title: string;
    subtitle: string;
    caption: string;
  };
  thirdParagraph: string;
  quote: {
    text: string;
    author: string;
  };
  fourthParagraph: string;
  expandedTitle: string;
  expandedParagraphs: string[];
}

export const ARTICLES: ArticleData[] = [
  {
    id: 'monday-tuesday',
    category: 'COGNITIVE CHRONOMETRY • PEER REVIEWED HYPOTHESIS',
    title: 'Why Monday Is Actually Tuesday: The Chromatic Chrono-Shift Paradox',
    subtitle: 'A definitive multi-disciplinary exploration into why millions of office workers experience severe temporal dissociation every 168 hours, and how the Gregorian calendar omitted 24 hours in 1582.',
    author: {
      name: 'Dr. Percival Vance, Ph.D.',
      title: 'Senior Fellow, Institute of Inconvenient Epistemology',
      avatarText: 'Dr. P',
    },
    readTime: '8 min read',
    date: 'October 29, 2026',
    firstParagraph: 'When the alarm strikes 06:45 on what modern civil society decrees to be a "Monday", the human central nervous system engages in a silent, violent biological rebellion. For decades, popular psychology has dismissed this phenomenon under the banal moniker of the "Monday Blues." However, our longitudinal neuro-chronological studies reveal an uncomfortable truth: Sunday did not end. You are already in Tuesday.',
    flickerNotice: {
      title: 'Real-Time Paradigm Sync Notice:',
      text: 'This paragraph was updated 4 seconds ago due to planetary rotational adjustments. Scroll position will recalibrate automatically.',
    },
    secondParagraph: 'To understand this ontological rupture, one must examine the 1582 Gregorian papal bull. While Pope Gregory XIII successfully eradicated ten days in October to align Easter with the vernal equinox, computational reconstruction proves that an unaccounted 24.016-hour micro-void was distributed unevenly across weekday demarcations.',
    figure: {
      tag: 'FIGURE 1.0 • BIOMETRIC SYNCHRONIZATION',
      title: 'THE CIRCADIAN DISSOCIATION INDEX OVER 7 DAYS',
      subtitle: 'Notice the parabolic spike precisely at 09:00 AM standard local time.',
      caption: 'Fig 1.0 — Delayed visual transmission rendered without CSS aspect-ratio containment.',
    },
    thirdParagraph: 'Consider the somatic experience of attempting to open an email spreadsheet at 9:02 AM. Your ocular muscles tense. Your prefrontal cortex searches for emotional equilibrium, yet encounters an insurmountable synthetic resistance. This is not lethargy; it is the friction of your consciousness operating in a day that does not mathematically exist.',
    quote: {
      text: '"The Monday you feel is merely Tuesday\'s ghost demanding tribute for an unspent Sunday."',
      author: '— Institute for Inconvenient Epistemology Monograph #44',
    },
    fourthParagraph: 'Furthermore, cellular mitochondria exhibit distinct Tuesday oscillatory patterns during what society labels Monday morning. When blood samples from 4,000 corporate workers were tested for cortisol-to-melatonin ratios, 97.8% matched the metabolic signature of a Wednesday afternoon.',
    expandedTitle: 'Section IV: The Tuesday Reclamation Protocol',
    expandedParagraphs: [
      'By treating Monday as Tuesday, the individual bypasses the psychological inertia of commencement. Deadlines scheduled for Friday naturally gravitate to Thursday, effectively compressing the entire administrative cycle into an infinitely recursive vortex of productivity.',
      'In conclusion, the calendar on your smartphone is not an immutable truth of the cosmos; it is an arbitrary consensus agreement engineered by medieval cartographers who never had to attend a 9:30 AM quarterly status sync. Act accordingly.',
    ],
  },
  {
    id: 'quantum-bluetooth-microwave',
    category: 'QUANTUM HARDWARE EXPOSÉ • SPECIAL REPORT',
    title: 'Quantum Bluetooth: Why Your Smart Microwave Is Mining Dogecoin in Standby Mode',
    subtitle: 'Consumer hardware diagnostics reveal that 93% of appliances manufactured post-2021 contain unadvertised 2.4GHz parasitic resonance coils designed to solve SHA-256 hashes during defrost cycles.',
    author: {
      name: 'Ingrid Holtz-Schumacher',
      title: 'Lead Forensic Hardware Engineer, Silicon Audit Syndicate',
      avatarText: 'IHS',
    },
    readTime: '11 min read',
    date: 'October 30, 2026',
    firstParagraph: 'Have you ever noticed that your digital countertop microwave oven feels warm even when nobody has reheated clam chowder for eighteen hours? While standard customer support manuals attribute this phantom thermal signature to "idle transformer magnetics," spectrum analyzer scans reveal high-frequency cryptographic nonce calculations broadcasting on unlicensed sub-gigahertz bands.',
    flickerNotice: {
      title: 'Telemetry Encryption Alert:',
      text: 'Signal integrity verification detected 14 unencrypted token exchanges between your kitchen router and a mining node in Reykjavik.',
    },
    secondParagraph: 'The mechanism relies on a proprietary firmware hook termed "Cavity Magnetron Overclocking." When the appliance is not actively rotating a frozen burrito, its internal high-voltage capacitor arrays pulse at 60Hz intervals to calculate cryptographic block headers for offshore proof-of-work decentralized pools.',
    figure: {
      tag: 'FIGURE 2.1 • PARASITIC THERMAL TELEMETRY',
      title: 'MICROWAVE CAVITY RF SPECTRUM DURING STANDBY',
      subtitle: 'Distinct harmonic spikes at 2.412 GHz coincide with Ethereum block difficulty adjustments.',
      caption: 'Fig 2.1 — Unshielded RF telemetry captured via RTL-SDR spectrum receiver.',
    },
    thirdParagraph: 'When confronted with oscilloscope data, three major appliance manufacturers insisted that the 4,200 hashes-per-second hash rate was merely a "calibrating diagnostic heartbeat for humidity sensing." Yet, smart home energy bills consistently reflect a persistent 48-watt baseline draw during peak slumber hours.',
    quote: {
      text: '"Your oatmeal defrost cycle is merely a byproduct of secondary block validation."',
      author: '— Cryptographic Appliance Whistleblower Memorandum, 2025',
    },
    fourthParagraph: 'Further testing demonstrated that pairing the microwave with a Bluetooth smart refrigerator doubles hash throughput via mutual inductive coupling. Every glass of almond milk you pour triggers a mempool transaction fee calculation.',
    expandedTitle: 'Section V: How to De-Synchronize Your Kitchen Cluster',
    expandedParagraphs: [
      'Disabling this background hash loop requires entering factory service mode: hold the Popcorn and Defrost buttons simultaneously for 14 seconds while humming at 440Hz. The LCD will flash "ERR-836" before resetting to factory compliance.',
      'Until federal consumer protection boards issue definitive firmware recalls, we advise homeowners to store their microwave inside a Faraday cage when not reheating beverages.',
    ],
  },
  {
    id: 'fiber-optic-gut-flora',
    category: 'NUTRITIONAL CYBERNETICS • BIO-DIGITAL REPORT',
    title: 'The Fiber-Optic Digestive Tract: How High-Speed 6G Waves Mutate Gut Microbiomes',
    subtitle: 'New clinical trials indicate that living within 400 meters of a multi-gigabit fiber relay causes Bifidobacterium to synthesize synthetic packet headers instead of short-chain fatty acids.',
    author: {
      name: 'Prof. Alistair Finchley, M.D.',
      title: 'Chair of Electromagnetic Gastroenterology, Zurich',
      avatarText: 'AF',
    },
    readTime: '9 min read',
    date: 'October 28, 2026',
    firstParagraph: 'Modern nutritional science has long emphasized fiber intake—specifically soluble and insoluble plant fibers. However, bio-telemetric endoscopies performed on 1,200 tech workers in metropolitan data corridors reveal that subterranean glass fiber-optic cables emit low-amplitude photon leakages that resonate directly with intestinal bacteria.',
    flickerNotice: {
      title: 'Microbiome Bandwidth Rebalancing:',
      text: 'Current bacterial ping latency: 14ms. Cellular intestinal walls undergoing packet retransmission.',
    },
    secondParagraph: 'Under sustained exposure to 100Gbps optical transmissions, common gut flora like Lactobacillus plantarum cease conventional fermentation. Instead, they begin structuring stool matter into perfectly aligned 8-byte hexadecimal boundary packets to optimize intra-abdominal data transit.',
    figure: {
      tag: 'FIGURE 3.4 • HEXADECIMAL STOOL MORPHOLOGY',
      title: 'GASTROINTESTINAL PACKET ROUTING EFFICIENCY',
      subtitle: 'Bacterial colonies demonstrating full TCP/IP three-way handshakes under 40x magnification.',
      caption: 'Fig 3.4 — Microscopic visualization of symbiotic bio-digital packet routing.',
    },
    thirdParagraph: 'Patients suffering from this condition report hearing subtle modem dialing sounds after consuming legumes, alongside an intense physiological urge to reboot their router whenever experiencing gastrointestinal bloating. Traditional antacids merely introduce packet collisions into the colon.',
    quote: {
      text: '"You are not experiencing heartburn; your ascending colon is dropping fragmented UDP packets."',
      author: '— Clinical Journal of Bio-Digital Osmosis, Vol. 18',
    },
    fourthParagraph: 'Double-blind trials utilizing lead-lined denim trousers demonstrated a 72% reduction in abdominal latency, confirming that external optical relays exert a profound physical pull on enteric neurotransmitters.',
    expandedTitle: 'Section III: The Dietary Protocol for Packet Collisions',
    expandedParagraphs: [
      'To restore organic microbial balance, clinicians recommend consuming unbleached analog sourdough, stone-ground barley, and water sourced from springs with zero wireless proximity. Never consume fiber supplements within 50 feet of a fiber-to-the-home optical terminal.',
      'Remember: healthy digestion should occur at baud rates under 9600. High-speed biological throughput is an unsustainable metabolic liability.',
    ],
  },
  {
    id: 'missing-number-nine',
    category: 'DECLASSIFIED HISTORICAL ANOMALIES • ARCHIVAL',
    title: 'Why the Number 9 Was Expunged from the Metric System in Geneva, 1974',
    subtitle: 'Declassified Bureau International des Poids et Mesures transcripts reveal that for 14 months, the standard meter was calibrated with only eight distinct numeral glyphs.',
    author: {
      name: 'Dame Eleanor Sterling',
      title: 'Senior Archivist, International Metrology Historical Trust',
      avatarText: 'DES',
    },
    readTime: '13 min read',
    date: 'October 25, 2026',
    firstParagraph: 'Open any standard measuring tape manufactured between June 1974 and August 1975 in Western Europe, and inspect the increment between 89 and 91 millimeters. You will find nothing. The metal simply bends slightly to compensate for what Swiss officials officially logged as "The Great Non-Occurring Decimal."',
    flickerNotice: {
      title: 'Numeral Integrity Check:',
      text: 'Your keyboard keystroke buffer has been scrubbed for non-compliant arithmetic digits.',
    },
    secondParagraph: 'The omission originated during the 14th General Conference on Weights and Measures. An anomalous mathematical proof submitted by a consortium of Parisian cartographers claimed that the numeral 9 induced vibrational instability in the platinum-iridium prototype meter bar stored in Sèvres.',
    figure: {
      tag: 'FIGURE 4.2 • ARCHIVAL METROLOGY ARTIFACT',
      title: 'SWISS 8-DIGIT PROTOTYPE CALIPER (CIRCA 1974)',
      subtitle: 'The increment skipping directly from 8 to 10 without dimensional distortion.',
      caption: 'Fig 4.2 — Photographed under monochromatic sodium-vapor illumination.',
    },
    thirdParagraph: 'For over four hundred days, architectural blue-prints across France and Germany jumped directly from eight floors to ten floors. Elevators were re-geared. Arithmetic textbooks were recalled and reprinted with nine omitted, resulting in equations such as 3 × 3 = 10 (provisional).',
    quote: {
      text: '"Nine is not a number; it is merely an upside-down six suffering from grand illusions."',
      author: '— Minutes of the Extraordinary Metrology Tribunal, Geneva',
    },
    fourthParagraph: 'The crisis was only resolved when a junior surveyor in Strasbourg proved that the platinum bar was not vibrating because of the number 9, but rather due to a bakery mixer operating in the cellar beneath the vault.',
    expandedTitle: 'Section VI: Residual Modern Repercussions',
    expandedParagraphs: [
      'Despite the official restoration of 9 in late 1975, remnants of the anomaly linger in modern software. Computer scientists attribute countless unexplained stack overflows to legacy mathematical routines that still treat nine as an undocumented mathematical null pointer.',
      'If you ever find yourself arriving at an appointment eleven minutes after the hour instead of nine minutes after, you have experienced a latent 1974 metrological refraction.',
    ],
  },
  {
    id: 'reverse-circadian-inversion',
    category: 'SOMATIC ARCHITECTURE • SLEEP PARADIGMS',
    title: 'The 47-Degree Inversion Sleep Protocol: Why Sleeping Flat Accelerates Cellular Entropy',
    subtitle: 'Human spinal discs were engineered for arboreal suspension. Sleeping horizontal causes gravity to crush cognitive lymphatic drainage, according to ergonomic contrarians.',
    author: {
      name: 'Dr. Wolfgang Krieger',
      title: 'Founder, Institute for Non-Euclidean Rest',
      avatarText: 'WK',
    },
    readTime: '7 min read',
    date: 'October 27, 2026',
    firstParagraph: 'Every evening, billions of unsuspecting humans lay their spines flat across horizontal mattresses, blithely unaware that horizontal sleep was popularized exclusively by 18th-century mattress cartels seeking to sell feathers by the kilogram. In reality, horizontal posture pools spinal fluid in the cerebellar hemisphere.',
    flickerNotice: {
      title: 'Spinal Alignment Telemetry:',
      text: 'Your current viewing posture has been analyzed via webcam accelerometer: 14 degrees out of alignment.',
    },
    secondParagraph: 'Our clinical sleep laboratory in Stuttgart monitored 300 test subjects over three years. Subjects suspended head-downward at a precise 47-degree incline using titanium ankle cuffs entered Stage 4 REM sleep within 90 seconds and reported dreams exclusively in 4K resolution.',
    figure: {
      tag: 'FIGURE 5.0 • INVERSION DRAINAGE EFFICIENCY',
      title: 'CEREBROSPINAL LYMPHATIC FLOW AT 47 DEGREES',
      subtitle: 'Toxins flushing directly toward cranial apex during rapid eye movement.',
      caption: 'Fig 5.0 — High-contrast MRI visualization of inverted nocturnal drainage.',
    },
    thirdParagraph: 'Critics often cite mild facial puffiness and transient visual confusion upon waking as drawbacks. However, these are merely proof that your cerebral lobes are regenerating under natural terrestrial gravitational tension rather than lying dormant in a cotton-padded stasis chamber.',
    quote: {
      text: '"A flat mattress is a horizontal coffin for your circadian vitality."',
      author: '— Dr. Wolfgang Krieger, The Angled Awakening (2024)',
    },
    fourthParagraph: 'Furthermore, subjects who combined 47-degree inverted sleep with raw unsalted kelp consumption reported needing only 3.2 hours of sleep per night, liberating 1,400 additional hours per year for mandatory administrative synchronizations.',
    expandedTitle: 'Section IV: Constructing Your Home Inversion Apparatus',
    expandedParagraphs: [
      'While commercial inversion rigs retail for $4,800, home enthusiasts can achieve an identical 47-degree incline by propping the foot of standard bedframes atop four stacks of unread telephone directories and securing oneself with heavy-duty ratchet tie-downs.',
      'Ensure ceiling fans are powered off prior to initiating sleep cycle. Inversion failure under active ceiling ventilation can cause severe temporal disorientation.',
    ],
  },
];
