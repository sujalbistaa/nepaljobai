/**
 * NepalJobAI — global constants
 * Localized strings, Kathmandu valley districts, sample data, demo presets.
 */

export const SITE = {
  name: 'NepalJobAI',
  tagline: 'Match real skills to real jobs in Kathmandu.',
  url: 'https://nepaljobai.np',
  hackathon: 'Glocal Nepal Startup Innovation Hackathon 2026',
  builtIn: '72 hours',
  team: ['Sujal Bista', 'Teammate 2', 'Teammate 3'],
  github: 'https://github.com/sujalbistaa/nepaljobai',
} as const;

export type Lang = 'en' | 'ne';

/** Hero copy — bilingual. */
export const COPY = {
  en: {
    eyebrow: '→ FOR NEPALI YOUTH · BUILT IN 72 HOURS',
    headlineLine1: 'Stop applying to',
    headlineLine2: "jobs you'll never get.",
    headlineLine3: 'Start getting the ones',
    headlineLine4: 'you actually can.',
    sub: 'Upload your resume in English or Nepali. We score you against every live role in Kathmandu, point out the exact skills you\'re missing, and hand you a 12-week plan that\'s free to follow.',
    ctaPrimary: 'Upload my resume',
    ctaSecondary: 'See how it works',
    nav: { jobs: 'Jobs', how: 'How it works', startups: 'For startups', signin: 'Sign in', signout: 'Sign out', dashboard: 'Dashboard' },
    stats: {
      openRoles: 'Open roles',
      startups: 'KTM startups',
      median: 'Median junior / mo',
      matchRate: 'Find a 70%+ match',
    },
    demo: {
      live: 'LIVE',
      tryNow: '↓ TRY IT NOW · NO SIGN-UP',
      dropTitle: 'Drop your resume',
      dropSub: 'PDF, image, or handwritten Nepali',
      orQuick: '— or quick test —',
      analyzing: 'Analyzing · 1,247 live roles',
      bestMatch: '% best match',
      topResult: 'Top result',
      tryAnother: 'try another →',
      seeAll: 'see all 47 matches →',
      happeningNow: 'Happening now · Kathmandu',
      othersMatched: 'others matched',
      inLastMinute: 'in the last minute',
    },
    howItWorks: {
      label: 'How it works',
      heading: 'Three steps to your next job.',
      steps: [
        {
          number: '01',
          title: 'Upload your résumé',
          body: 'Drop a PDF, Word doc, or a photo of a handwritten CV. We OCR and parse it in seconds — English or Nepali.',
        },
        {
          number: '02',
          title: 'We match you to live jobs',
          body: 'Your skills are embedded and compared against hundreds of real listings scraped daily from Merojob, Kumarijob, and Kathmandu startups.',
        },
        {
          number: '03',
          title: 'Get your roadmap',
          body: 'See your match score, exact skill gaps, salary in NPR, and a free 12-week upskilling plan — personalised to you.',
        },
      ],
    },
    forWho: {
      label: "Who it's for",
      heading: 'Built for two sides of the same problem.',
      seekers: {
        tag: 'Job seekers',
        heading: "You're skilled. The system just can't see it.",
        sub: "Stop guessing which jobs to apply for. We tell you exactly where you stand and what to fix.",
        points: [
          'Upload a résumé in English or Nepali — even handwritten',
          'Get a match score against every live role in Kathmandu',
          'See the exact skills you\'re missing, with free courses to fill them',
          'Follow a 12-week roadmap built around your current level',
        ],
        cta: 'Match my résumé →',
      },
      startups: {
        tag: 'Startups & employers',
        heading: 'Stop drowning in applications that don\'t fit.',
        sub: 'Post a role and let the model surface candidates who are actually close — not just keyword-matched.',
        points: [
          'List roles and reach candidates sorted by real skill proximity',
          'See a ranked shortlist with gap scores, not just CVs',
          'Kathmandu-focused talent pool — no noise from outside the valley',
          'Free during the hackathon beta, usage-based after launch',
        ],
        cta: 'List a role →',
      },
    },
    roadmapTeaser: {
      label: '12-week roadmap',
      heading: 'Free plan. Real courses. No fluff.',
      sub: 'Every roadmap is generated from your actual skill gaps — not a generic syllabus. All resources are free.',
      legendNote: '— all free resources',
      cta: 'Get my roadmap →',
    },
    footer: {
      tagline: 'AI-powered job matching for Nepali youth. Built in Kathmandu.',
      builtIn: 'Built in 72 hours · NSIH 2026',
      legal: '© 2026 NepalJobAI. Made for Glocal Nepal Startup Innovation Hackathon.',
      cols: {
        product: {
          heading: 'Product',
          links: [
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Match my résumé', href: '/sign-up' },
            { label: 'Job listings', href: '/matches' },
            { label: '12-week roadmap', href: '/roadmap' },
          ],
        },
        for: {
          heading: 'For',
          links: [
            { label: 'Job seekers', href: '/sign-up' },
            { label: 'Startups', href: '/sign-up?role=startup' },
            { label: 'Fresh graduates', href: '/sign-up' },
            { label: 'Career changers', href: '/sign-up' },
          ],
        },
        oss: {
          heading: 'Open source',
          links: [
            { label: 'GitHub', href: 'https://github.com/sujalbistaa/nepaljobai', external: true },
            { label: 'README', href: 'https://github.com/sujalbistaa/nepaljobai#readme', external: true },
            { label: 'Contributing', href: 'https://github.com/sujalbistaa/nepaljobai/blob/main/CONTRIBUTING.md', external: true },
          ],
        },
      },
    },
  },

  ne: {
    eyebrow: '→ नेपाली युवाहरूका लागि · ७२ घण्टामा निर्मित',
    headlineLine1: 'पाउनै नसक्ने',
    headlineLine2: 'जागिरमा निवेदन नदिनुहोस्।',
    headlineLine3: 'पाउन सक्ने जागिर',
    headlineLine4: 'खोज्न सुरु गर्नुहोस्।',
    sub: 'आफ्नो बायोडाटा अंग्रेजी वा नेपालीमा अपलोड गर्नुहोस्। हामी काठमाडौंका हरेक खुला पदसँग तपाईंको स्कोर गणना गर्छौं, कुन सीप कमी छ देखाउँछौं, र १२ हप्ताको निःशुल्क योजना दिन्छौं।',
    ctaPrimary: 'मेरो बायोडाटा अपलोड गर्नुहोस्',
    ctaSecondary: 'कसरी काम गर्छ हेर्नुहोस्',
    nav: { jobs: 'जागिर', how: 'काम गर्ने तरिका', startups: 'स्टार्टअपका लागि', signin: 'साइन इन', signout: 'साइन आउट', dashboard: 'ड्यासबोर्ड' },
    stats: {
      openRoles: 'खुला पदहरू',
      startups: 'काठमाडौं स्टार्टअप',
      median: 'औसत जुनियर / मासिक',
      matchRate: '७०%+ मिलान फेला पार्ने',
    },
    demo: {
      live: 'लाइभ',
      tryNow: '↓ अहिले प्रयास गर्नुहोस् · साइन-अप छैन',
      dropTitle: 'आफ्नो बायोडाटा छोड्नुहोस्',
      dropSub: 'PDF, तस्बिर, वा हस्तलिखित नेपाली',
      orQuick: '— वा छिटो परीक्षण —',
      analyzing: 'विश्लेषण गर्दै · १,२४७ लाइभ पदहरू',
      bestMatch: '% उत्तम मिलान',
      topResult: 'शीर्ष परिणाम',
      tryAnother: 'अर्को प्रयास गर्नुहोस् →',
      seeAll: 'सबै ४७ मिलानहरू हेर्नुहोस् →',
      happeningNow: 'अहिले भइरहेको · काठमाडौं',
      othersMatched: 'अरूले मिलाए',
      inLastMinute: 'अघिल्लो मिनेटमा',
    },
    howItWorks: {
      label: 'कसरी काम गर्छ',
      heading: 'तीन चरणमा आफ्नो काम पाउनुस्।',
      steps: [
        {
          number: '01',
          title: 'आफ्नो CV अपलोड गर्नुस्',
          body: 'PDF, Word, वा हातले लेखेको CV को फोटो पनि हुन्छ। हामी सेकेन्डमा OCR र parse गर्छौं — अंग्रेजी वा नेपालीमा।',
        },
        {
          number: '02',
          title: 'हामी तपाईंलाई live job सँग match गर्छौं',
          body: 'तपाईंका skills embed गरेर Merojob, Kumarijob र काठमाडौंका startups का सयौं listing सँग दैनिक तुलना गरिन्छ।',
        },
        {
          number: '03',
          title: 'आफ्नो roadmap पाउनुस्',
          body: 'Match score, कुन skills छैन, NPR मा तलब, र निःशुल्क १२-हप्ते upskilling plan — सबै तपाईंकै लागि।',
        },
      ],
    },
    forWho: {
      label: 'कसका लागि हो',
      heading: 'एउटै समस्याका दुई पक्षका लागि।',
      seekers: {
        tag: 'जागिर खोज्नेहरू',
        heading: 'तपाईं सक्षम हुनुहुन्छ। प्रणालीले देख्न सकेको छैन।',
        sub: 'कुन job apply गर्ने भनेर अनुमान नगर्नुस्। हामी भन्छौं तपाईं कहाँ हुनुहुन्छ र के सुधार्नुपर्छ।',
        points: [
          'अंग्रेजी वा नेपालीमा CV अपलोड गर्नुस् — हातले लेखेको पनि',
          'काठमाडौंका हरेक live role सँग match score पाउनुस्',
          'के skills छैन र कसरी सिक्ने — निःशुल्क course सहित',
          'तपाईंको स्तर अनुसार बनाइएको १२-हप्ते roadmap पाउनुस्',
        ],
        cta: 'मेरो CV match गर्नुस् →',
      },
      startups: {
        tag: 'Startups र नियोक्ता',
        heading: 'नमिल्ने applications मा डुब्न बन्द गर्नुस्।',
        sub: 'Job post गर्नुस् र model ले साँचो skill proximity भएका candidates देखाउँछ — keyword match मात्र होइन।',
        points: [
          'Role list गर्नुस् र real skill proximity अनुसार sorted candidates पाउनुस्',
          'Gap score सहित ranked shortlist — CV मात्र होइन',
          'काठमाडौं-केन्द्रित talent pool — बाहिरको noise छैन',
          'Hackathon beta मा निःशुल्क, launch पछि usage-based',
        ],
        cta: 'Role list गर्नुस् →',
      },
    },
    roadmapTeaser: {
      label: '१२-हप्ते roadmap',
      heading: 'निःशुल्क plan। असली course। फालतु कुरा छैन।',
      sub: 'हरेक roadmap तपाईंको actual skill gap बाट बन्छ — generic syllabus होइन। सबै resources निःशुल्क छन्।',
      legendNote: '— सबै निःशुल्क resources',
      cta: 'मेरो roadmap पाउनुस् →',
    },
    footer: {
      tagline: 'नेपाली युवाका लागि AI-powered job matching। काठमाडौंमा बनाइएको।',
      builtIn: '७२ घण्टामा बनाइयो · NSIH 2026',
      legal: '© 2026 NepalJobAI। Glocal Nepal Startup Innovation Hackathon का लागि बनाइएको।',
      cols: {
        product: {
          heading: 'Product',
          links: [
            { label: 'कसरी काम गर्छ', href: '/#how-it-works' },
            { label: 'मेरो CV match गर्नुस्', href: '/sign-up' },
            { label: 'Job listings', href: '/matches' },
            { label: '१२-हप्ते roadmap', href: '/roadmap' },
          ],
        },
        for: {
          heading: 'कसका लागि',
          links: [
            { label: 'जागिर खोज्नेहरू', href: '/sign-up' },
            { label: 'Startups', href: '/sign-up?role=startup' },
            { label: 'नयाँ graduates', href: '/sign-up' },
            { label: 'Career परिवर्तन', href: '/sign-up' },
          ],
        },
        oss: {
          heading: 'Open source',
          links: [
            { label: 'GitHub', href: 'https://github.com/sujalbistaa/nepaljobai', external: true },
            { label: 'README', href: 'https://github.com/sujalbistaa/nepaljobai#readme', external: true },
            { label: 'Contributing', href: 'https://github.com/sujalbistaa/nepaljobai/blob/main/CONTRIBUTING.md', external: true },
          ],
        },
      },
    },
  },
} as const;

/** Kathmandu valley districts. */
export const KTM_DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur'] as const;

export const KTM_AREAS = [
  'Pulchowk', 'Jawalakhel', 'Sanepa', 'Kupondole', 'Thamel', 'Durbarmarg',
  'Naxal', 'Baluwatar', 'Maharajgunj', 'Baneshwor', 'Tinkune', 'Sinamangal',
  'Koteshwor', 'Madhyapur Thimi', 'Bhaktapur', 'Kirtipur',
] as const;

/** Sample match used in SocialProof section. */
export const HERO_SAMPLE_MATCH = {
  score: 84,
  role: 'Junior Backend Developer',
  company: 'Leapfrog Technology',
  location: 'Pulchowk, Lalitpur',
  salaryMin: 45000,
  salaryMax: 60000,
  postedDaysAgo: 2,
  applicants: 18,
  applyBy: 'Mar 28',
  haveSkills: ['Python', 'Git', 'REST APIs', 'SQL'],
  needSkills: [{ name: 'Docker', weeksToLearn: 2 }],
} as const;

/** Live numbers band. */
export const LIVE_STATS = {
  openRoles: 1247,
  startups: 312,
  medianSalary: 38000,
  matchRate: 89,
} as const;

/** Demo presets — what the user sees when they click a skill-combo button. */
export type DemoPreset = {
  id: string;
  label: string;
  skills: string[];
  result: {
    score: number;
    role: string;
    company: string;
    location: string;
    salary: number;
    matches: number;
  };
};

export const DEMO_PRESETS: readonly DemoPreset[] = [
  {
    id: 'python-git-sql',
    label: 'Python + Git',
    skills: ['python', 'git', 'sql'],
    result: {
      score: 84,
      role: 'Junior Backend Developer',
      company: 'Leapfrog',
      location: 'Pulchowk',
      salary: 45000,
      matches: 47,
    },
  },
  {
    id: 'react-js',
    label: 'React',
    skills: ['react', 'javascript'],
    result: {
      score: 91,
      role: 'Frontend Engineer',
      company: 'CloudFactory',
      location: 'Sanepa',
      salary: 60000,
      matches: 32,
    },
  },
  {
    id: 'excel-sql',
    label: 'SQL + Excel',
    skills: ['excel', 'sql'],
    result: {
      score: 78,
      role: 'Data Analyst Intern',
      company: 'Khalti',
      location: 'Naxal',
      salary: 25000,
      matches: 19,
    },
  },
  {
    id: 'design',
    label: 'Design',
    skills: ['photoshop', 'figma'],
    result: {
      score: 73,
      role: 'UI Designer',
      company: 'Cotiviti',
      location: 'Tinkune',
      salary: 40000,
      matches: 14,
    },
  },
] as const;

/** Live activity events for the ticker. */
export type ActivityEvent = {
  type: 'matched' | 'gap' | 'started' | 'hired';
  who: string;
  detail: string;
};

export const ACTIVITY_EVENTS: readonly ActivityEvent[] = [
  { type: 'matched', who: 'Aarav K.', detail: '87% · Frontend @ CloudFactory' },
  { type: 'gap', who: 'Sneha R.', detail: 'wants Python · 4 wks' },
  { type: 'matched', who: 'Bibek T.', detail: '81% · Data Intern @ Khalti' },
  { type: 'started', who: 'Pratik M.', detail: 'roadmap wk 1/12 · Docker' },
  { type: 'matched', who: 'Anisha S.', detail: '79% · UI Designer @ Cotiviti' },
  { type: 'hired', who: 'Roshan B.', detail: 'Backend @ Leapfrog ✓' },
  { type: 'matched', who: 'Saraswati P.', detail: '84% · Ops @ Trekking Co' },
  { type: 'gap', who: 'Mohit R.', detail: 'wants AWS · 6 wks' },
  { type: 'matched', who: 'Sushila G.', detail: '76% · Marketing @ Tootle' },
  { type: 'started', who: 'Karan D.', detail: 'roadmap wk 3/12 · React' },
] as const;