export interface Link {
  label: string
  href: string
}

export interface Job {
  id: string
  org: string
  role: string
  period: string
  points: string[]
  /** first and last month as YYYY-MM, for the timeline; no end means it is the current job */
  start?: string
  end?: string
  tools?: string[]
  /** the hand-written label on the floppy disk in Work */
  disk?: string
}

export interface Project {
  id: string
  name: string
  summary: string
  stack: string[]
  repo: string
  award?: string
  note?: string
}

export interface Achievement {
  id: string
  title: string
  detail: string
  /** the small drawing on its Scrapbook page */
  sticker?: 'medal' | 'book' | 'mic' | 'mac'
  /** a row of marks under the text, such as four grades */
  tally?: { label: string; values: string[] }
}

export interface FamilyMember {
  who: string
  note: string
  /** a short git-style label, such as "init" */
  tag?: string
  /** drawn as a side branch that merges into the line */
  branch?: boolean
}

export interface Stat {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
}

export type HobbyIcon =
  | 'dumbbell'
  | 'ring'
  | 'shoe'
  | 'goggles'
  | 'shuttle'
  | 'book'
  | 'football'
  | 'mic'
  | 'whisk'
  | 'palette'

/** A page of the Note Pad: what exactly I did somewhere, in a few lines. */
export interface Note {
  title: string
  /** a short label beside the title, such as "my part" */
  tag?: string
  lines: string[]
  /** the tools that page is about */
  tools?: string[]
}

/** A painting or sketch in the Paintings window. The picture is src/assets/paintings/<id>.jpg. */
export interface Painting {
  id: string
  title: string
  medium: string
  /** size of the picture file in pixels */
  w: number
  h: number
}

/** A pin on the Map: a place that means something to me. */
export interface Place {
  id: string
  name: string
  /** north is positive */
  lat: number
  /** east is positive */
  lon: number
  /** IANA time zone, for the local time */
  zone: string
  note: string
}

/** One card of the recipe stack. Kept short on purpose. */
export interface Recipe {
  id: 'muffins' | 'truffles'
  title: string
  makes: string
  ingredients: string[]
  steps: string[]
  tip: string
}

export interface Content {
  identity: {
    name: string
    role: string
    /** typed one at a time in the About window */
    identities: string[]
    motto: string
    /** identities and motto as one line */
    headline: string
    subline: string
    /** two plain sentences for the Standard View */
    summary: string
    education: string
    email: string
  }
  /** oldest first */
  family: FamilyMember[]
  quote: { text: string; about: string }
  stats: Stat[]
  /** the two paragraphs told as plain text in the story */
  story: string[]
  hobbies: { icon: HobbyIcon; label: string }[]
  /** one short line for each language and tool, shown when its key is pressed */
  skillNotes: Record<string, string>
  languages: string[]
  tools: string[]
  work: Job[]
  community: Job[]
  projects: Project[]
  achievements: Achievement[]
  /** paragraphs */
  readMe: string[]
  /** in the order they are shown */
  paintings: Painting[]
  places: Place[]
  books: { title: string; author: string }[]
  recipes: Recipe[]
  /** one Note Pad page each */
  notes: Note[]
  trash: string[]
  /** the short note pinned to the desktop */
  homage: string
  links: Link[]
  /** file name under public/, null until supplied */
  resumePdf: string | null
}

const IDENTITIES = ['Former ballerina.', 'National-level swimmer.', 'Silver-medallist engineer.']
const MOTTO = 'I pick the hard thing on purpose.'
const FELL_FOR_CS =
  'I always loved maths and physics. Then I started engineering and fell for computer science, a field that is different every morning.'
const SINCE_THEN =
  'Since then: internships, committee work, tech events, tech talks, hackathons, crackathons and research. Today I am at Barclays, where I use my development, ML and MLOps skills every day.'

export const content: Content = {
  identity: {
    name: 'Varnika Bajpai',
    role: 'Software Engineer at Barclays',
    identities: IDENTITIES,
    motto: MOTTO,
    headline: `${IDENTITIES.join(' ')} ${MOTTO}`,
    subline: 'At my core I am a builder. I like to build things that challenge me and help my community.',
    summary:
      'Software engineer working on ML development and MLOps. I build backend systems, automation and applied machine learning models.',
    education:
      'BTech in Information Technology with Honours in AI, KJ Somaiya School of Engineering, Mumbai (2022–2026)',
    email: 'bajpaivarnika04@gmail.com',
  },

  family: [
    { who: 'Nanu', note: 'My grandfather. He started it.', tag: 'init' },
    { who: 'Dad', note: 'The best engineer I know.' },
    { who: 'My brother', note: 'Went first and laid out the path for me.' },
    { who: 'His wife', note: 'My favourite woman in STEM.', tag: 'merge', branch: true },
    { who: 'Me', note: 'Grew up knowing that building is a kind of power.', tag: 'HEAD' },
  ],

  quote: {
    text: 'She gave me the confidence, some would call it delusion, that I cannot fail. I have never corrected her.',
    about: 'My mother. I take challenges head on, the way she does.',
  },

  stats: [
    { value: 9.66, decimals: 2, label: 'CGPA' },
    { value: 2, prefix: '#', label: 'in the IT branch, silver medal' },
  ],

  story: [FELL_FOR_CS, SINCE_THEN],

  hobbies: [
    { icon: 'dumbbell', label: 'Weights' },
    { icon: 'ring', label: 'Pilates' },
    { icon: 'shoe', label: 'Running' },
    { icon: 'goggles', label: 'Swimming' },
    { icon: 'shuttle', label: 'Badminton' },
    { icon: 'book', label: 'Reading' },
    { icon: 'football', label: 'Football' },
    { icon: 'mic', label: 'Singing' },
    { icon: 'whisk', label: 'Baking' },
    { icon: 'palette', label: 'Painting' },
  ],

  skillNotes: {
    Python: 'ML models, Flask services and automation pipelines. My daily driver.',
    'C++': 'Data structures, algorithms and anything that has to be fast.',
    JavaScript: 'React on the front, Node.js on the back.',
    Java: 'Object-oriented design, and one of the five languages OmniCompiler runs.',
    ML: 'Classifiers, recommendations and face recognition.',
    LLMs: 'RAG, MCP servers and LLM-powered tools.',
    MLOps: 'Getting models out of notebooks and keeping them alive. My work at Barclays.',
    Flask: 'The service behind my test-log classifier.',
    Django: 'ML endpoints from my first internship.',
    Grafana: 'Dashboards that refresh themselves.',
    Docker: 'Sandboxed runtimes for OmniCompiler and MalShield.',
    SQL: 'Views, pipelines and PostgreSQL.',
    AWS: 'Where my LyondellBasell pipeline runs on a schedule.',
    GCP: 'Google Cloud certified.',
  },

  languages: ['Python', 'C++', 'JavaScript', 'Java'],

  tools: ['ML', 'LLMs', 'MLOps', 'Flask', 'Django', 'Grafana', 'Docker', 'SQL', 'AWS', 'GCP'],

  work: [
    {
      id: 'barclays',
      org: 'Barclays',
      role: 'Software Engineer',
      period: 'July 2026 – present',
      start: '2026-07',
      disk: 'Barclays ’26 →',
      tools: ['Python', 'ML', 'MLOps'],
      points: [
        'Joined the same team full time after a pre-placement offer.',
        'Building engineering tooling and automation, and learning new tech every week.',
      ],
    },
    {
      id: 'lyb',
      org: 'LyondellBasell',
      role: 'Digital Technology Intern, SAP Testing',
      period: 'January – June 2026',
      start: '2026-01',
      disk: 'LYB ’26',
      end: '2026-06',
      tools: ['Python', 'REST APIs', 'AWS', 'SAP testing'],
      points: [
        'Built a backend integration pipeline for testing analytics and visualisation with Python and REST APIs.',
        'Traversed deep parent-child hierarchies in the test management system with tree traversals.',
        'Scaled it across enterprise projects on an AWS server with near real-time scheduled runs.',
        'Delivered a fully automated pipeline that feeds self-refreshing dashboards with zero manual steps.',
      ],
    },
    {
      id: 'barclays-intern',
      org: 'Barclays',
      role: 'Technology Summer Intern',
      period: 'May – July 2025',
      start: '2025-05',
      disk: 'Barclays ’25',
      end: '2025-07',
      tools: ['Python', 'Flask', 'Grafana', 'Jira', 'Xray'],
      points: [
        'Built an ML classifier for testing logs with Python, Flask and Grafana.',
        'Connected an internal AI platform to Jira so that it drafts Xray test cases automatically.',
        'Converted the internship into a pre-placement offer.',
      ],
    },
    {
      id: 'gsquare',
      org: 'G-Square Solutions',
      role: 'AI and Data Science Intern',
      period: 'June – July 2024',
      start: '2024-06',
      disk: 'G-Square ’24',
      end: '2024-07',
      tools: ['Python', 'Django', 'Flask', 'SQL', 'BI dashboards'],
      points: [
        'Worked on BI dashboards and data pipelines for an AI/ML and BI solutions startup.',
        'Delivered one end-to-end project to a stakeholder, from data preprocessing to dashboard.',
      ],
    },
  ],

  community: [
    {
      id: 'csi',
      org: 'Computer Society of India, KJSSE',
      role: 'Operations Team',
      period: 'Second year',
      points: [
        'Helped coordinate hackathons, tech events and workshops.',
        'Delivered AI/ML and data science talks to juniors in Road to Programming.',
        'Ran PR and a weekly tech-updates series.',
      ],
    },
    {
      id: 'debsoc',
      org: 'Somaiya Debating Society',
      role: 'PR Representative',
      period: 'First year',
      points: ['Presiding officer of the Big Somaiya Debate.', 'Ran PR campaigns for the society.'],
    },
  ],

  projects: [
    {
      id: 'omnicompiler',
      name: 'OmniCompiler',
      summary:
        'A language-agnostic platform to run, debug, translate and analyse code across Python, JavaScript, Java, C++ and Go, with sandboxed runtimes, control-flow graphs and ML breakpoint suggestions.',
      stack: ['React', 'FastAPI', 'Docker', 'Python', 'Gemini', 'Random Forest'],
      repo: 'https://github.com/Pratham2994/OmniCompiler',
      note: 'Final-year project. Journal article under review.',
    },
    {
      id: 'floatchat',
      name: 'FloatChat',
      summary:
        'Ask questions about Argo ocean data in plain language. A custom MCP server and RAG return answers and charts grounded in real NetCDF files.',
      stack: ['React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Chroma', 'MCP', 'RAG'],
      repo: 'https://github.com/VarnikaBajpai4/FloatChat_DebugDynasty_SiH',
      note: 'Built for Smart India Hackathon.',
    },
    {
      id: 'bharosa',
      name: 'UBI Bharosa',
      summary:
        'An AI-powered scheduler and smart ticketing system for bank branches, with face recognition and customer prioritisation models.',
      stack: ['PostgreSQL', 'Express', 'React', 'Node.js', 'Python', 'ArcFace', 'XGBoost'],
      repo: 'https://github.com/AmaanSyed2004/ideahack-DebugDynasty',
      award: '2nd runner-up among 500+ teams, Union Bank of India Idea Hackathon (national level).',
    },
    {
      id: 'symbiote',
      name: 'Symbiote',
      summary:
        'Matches students into balanced hackathon teams from their skills, GitHub activity and EQ traits, with real-time team chat.',
      stack: ['React', 'Node.js', 'MongoDB', 'Python', 'FastAPI', 'Socket.io'],
      repo: 'https://github.com/Pratham2994/Symbiote',
    },
    {
      id: 'malshield',
      name: 'MalShield',
      summary:
        'ML-powered malware detection that combines static and dynamic analysis with YARA rules across EXE, DOC, BAT and more.',
      stack: ['Python', 'LightGBM', 'YARA', 'Docker'],
      repo: 'https://github.com/VarnikaBajpai4/ctrl_alt_elite_hack8',
    },
  ],

  achievements: [
    {
      id: 'silver-medal',
      title: 'Silver Medal',
      detail: 'Second in the IT branch, with a CGPA of 9.66.',
      sticker: 'medal',
      tally: { label: 'SGPA in each of the last four semesters', values: ['10', '10', '10', '10'] },
    },
    {
      id: 'ubi',
      title: 'UBI Idea Hackathon, 2nd Runner-up',
      detail: 'PSBs Hackathon Series 2025. National level, 500+ teams. We built UBI Bharosa for Union Bank of India.',
    },
    {
      id: 'honours',
      title: 'Honours in AI',
      detail: 'With the BTech: data science, AI, machine learning, deep learning and NLP.',
      sticker: 'book',
    },
    {
      id: 'barclays-ppo',
      title: 'Barclays Internship and PPO',
      detail: 'Selected for the summer internship, then offered a full-time role.',
      sticker: 'mac',
    },
    {
      id: 'emun',
      title: 'E-MUN, 2nd Best Delegate',
      detail:
        'Represented the Republic of India in the WTO committee on e-commerce and digital trade: navigating tariff moratoriums.',
      sticker: 'mic',
    },
    {
      id: 'gcp',
      title: 'Google Cloud Certified',
      detail: 'Certified on Google Cloud Platform.',
    },
    {
      id: 'certificates',
      title: 'Certificates',
      detail:
        'React: The Complete Guide (Udemy), Generative AI Basics and NLP (Salesforce Trailhead), Google Analytics for Beginners.',
    },
  ],

  readMe: [
    'I come from a family of engineers. My grandfather, Nanu, started it. My father is the best engineer I know. My brother went first and laid out the path for me, and his wife has now joined the list. I grew up knowing that the ability to build a solution is a kind of power.',
    'My mother is why I take challenges head on, the way she does. She gave me the confidence, some would call it delusion, that I cannot fail. I have never corrected her.',
    FELL_FOR_CS,
    SINCE_THEN,
    'Away from the keyboard: weights, pilates, running, swimming, badminton, books, football, singing, baking and painting.',
    'This whole site is a homage to the retro Mac, System 1 to 7. I got my Mac when I started engineering and it has been my best friend ever since.',
  ],

  notes: [
    {
      title: 'OmniCompiler',
      tag: 'my part',
      lines: [
        'Breakpoint recommendation, end to end.',
        'One Random Forest model per language, trained on features of each line of code.',
        'It scores the candidate lines and suggests where to pause.',
      ],
      tools: ['Random Forest', 'scikit-learn', 'feature engineering'],
    },
    {
      title: 'Symbiote',
      tag: 'my part',
      lines: [
        'The matching algorithm, written from scratch.',
        'It places each person in a band for every skill, then pairs the bands that complement each other.',
        'Cosine distance between skill profiles decides how good a fit is.',
      ],
      tools: ['Python', 'cosine distance', 'scoring'],
    },
    {
      title: 'UBI Bharosa',
      tag: 'my part',
      lines: [
        'The ML models, built to plug into the bank\'s existing software.',
        'Face recognition with ArcFace embeddings.',
        'Loan recommendations with Random Forest.',
        'Customer priority with XGBoost regression.',
      ],
      tools: ['ArcFace', 'Random Forest', 'XGBoost'],
    },
    {
      title: 'LyondellBasell',
      tag: 'internship',
      lines: [
        'A backend pipeline for SAP testing analytics, in Python over REST APIs.',
        'Tree traversal across parent and child test hierarchies.',
        'It runs on AWS on a schedule, with no manual step.',
      ],
      tools: ['Python', 'REST APIs', 'AWS'],
    },
    {
      title: 'Barclays',
      tag: 'now',
      lines: [
        'ML development and MLOps, as my daily work.',
        'As an intern: an ML classifier for test logs, and automation that drafts Xray test cases in Jira.',
        'The details stay inside the bank.',
      ],
      tools: ['Python', 'Flask', 'Grafana'],
    },
    {
      title: 'Honours in AI',
      tag: 'studied',
      lines: [
        'Data science and AI: normalisation, similarity, search, reasoning.',
        'ML: classification, LDA, PCA, kernel methods.',
        'DL and NLP: CNNs, RNNs, LSTMs, seq2seq.',
        'I built each topic as a small project. On my GitHub: speech emotion recognition with an LSTM.',
      ],
      tools: ['ML', 'deep learning', 'NLP'],
    },
    {
      title: 'What I am working on',
      tag: 'research',
      lines: [
        'Paper under review: "A Unified Multi-Language Debugging Framework: Containerized Execution, Structural Analysis, and Breakpoint Recommendation".',
        'Studying quantisation fidelity: quantisation does not damage a model evenly, and the usual benchmarks miss the abilities that break first.',
      ],
      tools: ['debugging', 'quantisation', 'LLMs'],
    },
  ],

  // DRAFT titles — owner to edit
  paintings: [
    { id: 'swans', title: 'Swans', medium: 'paint on canvas', w: 750, h: 900 },
    { id: 'fawn', title: 'Fawn', medium: 'paint on canvas', w: 760, h: 750 },
    { id: 'meadow', title: 'Meadow at Sunset', medium: 'paint on canvas', w: 620, h: 900 },
    { id: 'mountain', title: 'Mountain Lake', medium: 'paint on canvas', w: 730, h: 900 },
    { id: 'universe', title: 'Our Little Universe', medium: 'paint on canvas', w: 680, h: 900 },
    { id: 'bluebird', title: 'Bluebird', medium: 'paint on canvas', w: 760, h: 740 },
    { id: 'hummingbird', title: 'Hummingbird', medium: 'watercolour', w: 1000, h: 690 },
    { id: 'automatic', title: 'Automatic', medium: 'pencil', w: 760, h: 800 },
    { id: 'butterfly', title: 'Butterfly', medium: 'pencil', w: 690, h: 900 },
    { id: 'wildflowers', title: 'Wildflowers', medium: 'pencil', w: 1000, h: 800 },
    { id: 'goldengate', title: 'Golden Gate', medium: 'pencil', w: 720, h: 900 },
    { id: 'lion', title: 'Lion', medium: 'pencil', w: 670, h: 900 },
  ],

  // DRAFT notes — owner to edit
  places: [
    { id: 'mumbai', name: 'Mumbai', lat: 19.08, lon: 72.88, zone: 'Asia/Kolkata', note: 'Home. Everything starts here.' },
    {
      id: 'london',
      name: 'Stamford Bridge, London',
      lat: 51.48,
      lon: -0.19,
      zone: 'Europe/London',
      note: 'Chelsea. A Blue since birth.',
    },
    {
      id: 'giverny',
      name: 'Giverny',
      lat: 49.08,
      lon: 1.53,
      zone: 'Europe/Paris',
      note: 'The garden of Monet. He is why I love to paint.',
    },
    {
      id: 'montreux',
      name: 'Montreux',
      lat: 46.43,
      lon: 6.91,
      zone: 'Europe/Zurich',
      note: 'Queen, my favourite band, recorded here. The statue of Freddie looks at the lake.',
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      lat: 52.07,
      lon: -1.02,
      zone: 'Europe/London',
      note: 'Lewis Hamilton, number 44. This is his home race.',
    },
    {
      id: 'detroit',
      name: 'Detroit',
      lat: 42.33,
      lon: -83.05,
      zone: 'America/Detroit',
      note: 'Eminem. I like all rap, but he is first.',
    },
  ],

  recipes: [
    {
      id: 'muffins',
      title: 'Double Chocolate Muffins',
      makes: 'about 14',
      ingredients: [
        '2 cups flour',
        '1 cup sugar',
        '½ cup cocoa',
        '1 tsp baking soda',
        '½ tsp salt',
        '1¾ cups chocolate chips',
        '2 eggs',
        '¾ cup sour cream or yogurt',
        '½ cup oil',
        '½ cup milk',
        '1½ tsp vanilla',
      ],
      steps: [
        'Whisk the dry things and the chips in one bowl.',
        'Whisk the wet things, then fold them in. The batter is thick. Do not overmix.',
        'Fill the liners to the top.',
        'Bake 5 minutes at 220°C, then about 15 minutes at 180°C.',
      ],
      tip: 'The hot start gives the tall tops.',
    },
    {
      id: 'truffles',
      title: 'Oreo Truffles',
      makes: 'a full tray',
      ingredients: ['38 Oreos', '225 g cream cheese', '1 cup dark melting chocolate', '1 cup white melting chocolate'],
      steps: [
        'Crush the Oreos to fine crumbs.',
        'Beat the cream cheese smooth, then mix in the crumbs.',
        'Roll into small balls. Freeze for 15 minutes.',
        'Dip half in dark chocolate and half in white.',
        'Chill for one hour.',
      ],
      tip: 'They keep for three weeks in the fridge. They never last that long.',
    },
  ],

  // The books I tell people to read.
  books: [
    { title: 'One, Two, Buckle My Shoe', author: 'Agatha Christie' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { title: 'Barbarians at the Gate', author: 'Bryan Burrough and John Helyar' },
    { title: 'The Third Door', author: 'Alex Banayan' },
    { title: 'The Joys of Compounding', author: 'Gautam Baid' },
    { title: 'Atomic Habits', author: 'James Clear' },
    { title: 'O. Henry Omnibus', author: 'O. Henry' },
    { title: 'My Gita', author: 'Devdutt Pattanaik' },
  ],

  // DRAFT — owner to edit
  trash: [
    'todo_app_v7_final_FINAL.zip',
    'model_that_was_99_percent_accurate_on_training_data.pkl',
    'Plan to read only one book at a time',
    'rest_day.txt',
    'receipt_do_not_open.pdf',
  ],

  homage:
    'P.S. This whole site is a homage to the retro Mac, System 1 to 7. I got my Mac when I started engineering and it has been my best friend ever since.',

  links: [
    { label: 'Email', href: 'mailto:bajpaivarnika04@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/varnika-bajpai-6106a2258' },
    { label: 'GitHub', href: 'https://github.com/VarnikaBajpai4' },
  ],

  resumePdf: null,
}
