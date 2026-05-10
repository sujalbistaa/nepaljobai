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
    nav: { jobs: 'Jobs', how: 'How it works', startups: 'For startups', signin: 'Sign in' },
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
    nav: { jobs: 'जागिर', how: 'काम गर्ने तरिका', startups: 'स्टार्टअपका लागि', signin: 'साइन इन' },
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