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
  languages: string[]
  tools: string[]
  work: Job[]
  community: Job[]
  projects: Project[]
  achievements: Achievement[]
  /** paragraphs */
  readMe: string[]
  /** one Note Pad page each */
  notes: string[]
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
    education:
      'BTech in Information Technology with Honours in AI, KJ Somaiya School of Engineering, Mumbai (2022–2026)',
    email: 'bajpaivarnika04@gmail.com',
  },

  family: [
    { who: 'Nanu', note: 'My grandfather. He started it.', tag: 'init' },
    { who: 'Dad', note: 'The best engineer I know.' },
    { who: 'My brother', note: 'Went first and laid out the path for me.' },
    { who: 'His wife', note: 'Newly merged into the family.', tag: 'merge', branch: true },
    { who: 'Me', note: 'I grew up knowing that the ability to build a solution is a kind of power.', tag: 'HEAD' },
  ],

  quote: {
    text: 'She gave me the confidence, some would call it delusion, that I cannot fail. I have never corrected her.',
    about: 'My mother, the reason I take challenges head on, the way she does.',
  },

  stats: [
    { value: 9.66, decimals: 2, label: 'CGPA' },
    { value: 2, prefix: '#', label: 'in my batch. Silver medal.' },
    { value: 500, suffix: '+', label: 'teams in the national hackathon where we placed third' },
    { value: 19, prefix: '1 of ', label: 'picked from my college for Barclays' },
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

  languages: ['Python', 'C++', 'JavaScript', 'Java'],

  tools: ['ML', 'LLMs', 'MLOps', 'Flask', 'Django', 'Grafana', 'Docker', 'SQL', 'AWS', 'GCP'],

  work: [
    {
      id: 'barclays',
      org: 'Barclays',
      role: 'Software Engineer',
      period: 'July 2026 – present',
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
      points: [
        'One of 19 students selected from the college.',
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
      detail: 'Graduated second in the entire batch with a CGPA of 9.66.',
    },
    {
      id: 'honours',
      title: 'Honours in AI',
      detail: 'Completed an Honours in Artificial Intelligence alongside the BTech.',
    },
    {
      id: 'ubi',
      title: 'UBI Idea Hackathon, 2nd Runner-up',
      detail: 'National level, 500+ teams. Built UBI Bharosa for Union Bank of India.',
    },
    {
      id: 'emun',
      title: 'E-MUN, 2nd Best Delegate',
      detail:
        'Represented the Republic of India in the WTO committee on e-commerce and digital trade: navigating tariff moratoriums.',
    },
    {
      id: 'barclays-ppo',
      title: 'Barclays Internship and PPO',
      detail: 'One of 19 students selected from the college, then offered a full-time role.',
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

  // DRAFT — owner to edit
  notes: [
    'I love building new things.',
    'Currently: shipping at Barclays, reading too many books at once, and chasing a new deadlift PR.',
    'Unique. Creative. Challenging. Helpful. Pick at least three for every project.',
  ],

  // DRAFT — owner to edit
  trash: [
    'todo_app_v7_final_FINAL.zip',
    'A blockchain for my sourdough starter',
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
