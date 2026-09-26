// ============================================================
// forgeVidhya — Central site data
// Edit this file to update content across the whole website.
// ============================================================

export const siteConfig = {
  name: "forgeVidhya",
  tagline: "Forge the future with AI",
  description:
    "forgeVidhya equips first-year engineering students in India's tier-3 colleges with future-ready skills — AI automation, AI production, and turning imagination into reality with AI.",
  url: "https://forgevidhya.example.com",
  foundedYear: 2025,
  email: "160425733047@mjcollege.ac.in",
  phone: "+91 8008757916",
  /** Single-line postal address. Shown in the footer and on the Contact page. */
  address:
    "SU Knowledge Hub Foundation, Road No. 3, Banjara Hills, Hyderabad, Telangana, 500073",
  /** Office location — powers the map section (see components/LocationMap). */
  location: {
    /** Address split for multi-line display. */
    lines: [
      "SU Knowledge Hub Foundation",
      "Road No. 3, Banjara Hills",
      "Hyderabad, Telangana, 500073",
    ],
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500073",
    country: "India",
    /** Mappls place page — opened when the map card is clicked. */
    mapUrl:
      "https://www.mappls.com/place-SU+Knowledge+Hub+Foundation-Road+Number+3-Venkateshwara+Nagar-Sri+Nagar+Colony-Aurora+Colony-Banjara+Hills-Hyderabad-Telangana-500073-x515aj??@,,,l,f,f,f,f,f,f,zdata=MTcuNDI4NzI2Kzc4LjQ0MjUwNysxNyt4NTE1YWorKzI2MTE1KysrNDIyLTJNSi1KUEZKed",
    /** Coordinates carried in the Mappls link (used for the directions hint). */
    lat: 17.428726,
    lng: 78.442507,
  },
  social: {
    twitter: "https://x.com/isaam_mjcetian",
    linkedin: "https://www.linkedin.com/in/isaam-uddin-3a7781388",
    instagram: "https://www.instagram.com/isaam.mjcetian/",
    youtube: "https://www.youtube.com/@Isaamuddin-m7o",
    github: "https://github.com/futureforgeai",
  },
};

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// ============================================================
// Services / Programs
// ============================================================

export type Service = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name
  outcomes: string[];
  duration: string;
  level: string;
};

export const services: Service[] = [
  {
    slug: "ai-automation-fundamentals",
    title: "AI Automation Fundamentals",
    tagline: "Replace repetitive work with autonomous AI agents",
    description:
      "Learn to orchestrate AI agents that handle real tasks — email triage, report generation, data extraction — using no-code and low-code tools like n8n, Zapier AI, and LangChain. Built for students with zero coding background.",
    icon: "Workflow",
    outcomes: [
      "Build 3 production-ready automation workflows",
      "Connect AI to Google Sheets, Gmail, and WhatsApp",
      "Ship a personal AI assistant by week 4",
      "Earn a verifiable project certificate",
    ],
    duration: "6 weeks · live + recorded",
    level: "Beginner-friendly",
  },
  {
    slug: "ai-production-engineering",
    title: "AI Production Engineering",
    tagline: "Take AI demos from prototype to reliable real-world systems",
    description:
      "Most students can call an API. Few can ship AI that's fast, cheap, observable, and safe. This track teaches prompt engineering at scale, evaluation, caching, cost control, and deploying AI features that don't break at 3 AM.",
    icon: "Cog",
    outcomes: [
      "Design eval suites that catch hallucinations",
      "Cut inference cost 60% with caching & routing",
      "Deploy a RAG app with monitoring & guardrails",
      "Build a portfolio project recruiters actually open",
    ],
    duration: "8 weeks · project-based",
    level: "Intermediate",
  },
  {
    slug: "imagination-to-life",
    title: "Imagination to Life with AI",
    tagline: "Turn your ideas into apps, art, and products — no team required",
    description:
      "The solo-founder superpower. Use AI to design, prototype, and ship the thing you've been dreaming about — an app, a game, a comic, a hardware concept. We teach creative AI tools (image, video, code-gen) combined with product thinking.",
    icon: "Sparkles",
    outcomes: [
      "Generate a full product concept + brand in week 1",
      "Prototype an app using AI-assisted dev tools",
      "Create marketing visuals and a demo video",
      "Present a launch-ready prototype to mentors",
    ],
    duration: "5 weeks · creative studio",
    level: "All levels",
  },
  {
    slug: "career-accelerator",
    title: "Career Accelerator for Tier-3 Engineers",
    tagline: "Out-resume students from top colleges using AI skills",
    description:
      "AI skills alone don't get you hired — visibility does. We help you build a public portfolio, write technical content, optimize your LinkedIn for AI roles, and run mock interviews focused on real startup hiring rubrics.",
    icon: "Rocket",
    outcomes: [
      "Publish 4 technical write-ups that rank",
      "Optimize LinkedIn & GitHub for recruiter search",
      "Pass 5 mock interviews with feedback",
      "Get introduced to hiring startup partners",
    ],
    duration: "4 weeks · cohort + 1:1",
    level: "Career-focused",
  },
];

// ============================================================
// Program categories — the grouped view revealed by the "Explore programs"
// button on the Services page. AI & Core-Engineering items deep-link to the
// existing service / engineering-field anchors on that page; the
// non-engineering items are life-skill workshops (no dedicated pages yet).
// ============================================================

export type CategoryProgram = {
  title: string;
  blurb: string;
  /** Slug of the knowledge-base course this program opens (see lib/courses). */
  courseSlug?: string;
};

export type ProgramCategory = {
  id: "ai-and-tech" | "core-engineering" | "non-tech";
  title: string;
  icon: string; // lucide icon name
  blurb: string;
  /** Glow gradient (brand hex) for the floating chooser card. */
  from: string;
  to: string;
  programs: CategoryProgram[];
};

export const programCategories: ProgramCategory[] = [
  {
    id: "ai-and-tech",
    title: "AI & Tech",
    icon: "Sparkles",
    blurb: "Build with AI from day one.",
    from: "#5170ff",
    to: "#5170ff",
    programs: [
      { title: "AI Automation Fundamentals", blurb: "Replace repetitive work with autonomous AI agents.", courseSlug: "ai-automation-fundamentals" },
      { title: "AI Production Engineering", blurb: "Take AI demos from prototype to reliable real-world systems.", courseSlug: "ai-production-engineering" },
      { title: "Imagination to Life with AI", blurb: "Turn your ideas into apps, art, and products — no team required.", courseSlug: "imagination-to-life" },
    ],
  },
  {
    id: "core-engineering",
    title: "Core Engineering",
    icon: "Cog",
    blurb: "Hardware, systems, and the physical world.",
    from: "#a70066",
    to: "#a70066",
    programs: [
      { title: "Applied AI & Artificial Intelligence", blurb: "Using AI to solve real problems, not just passing exams.", courseSlug: "applied-ai-indian-problems" },
      { title: "Embedded Systems & IoT", blurb: "The nervous system — sensing and reacting to the physical world.", courseSlug: "embedded-systems-iot" },
      { title: "CAD Design & Digital Manufacturing", blurb: "The skeleton — turning ideas into manufacturable parts.", courseSlug: "cad-digital-manufacturing" },
      { title: "Robotics & Mechatronics", blurb: "The body — making machines move with purpose.", courseSlug: "robotics-mechatronics" },
      { title: "Renewable Energy & Electric Mobility", blurb: "The power — clean energy and the vehicles it drives.", courseSlug: "renewable-energy-mobility" },
    ],
  },
  {
    id: "non-tech",
    title: "Non-Tech",
    icon: "Compass",
    blurb: "Real-world skills school never taught you.",
    from: "#5170ff",
    to: "#5170ff",
    programs: [
      { title: "How to negotiate terms in an interview", blurb: "Ask for what you're worth — and get it.", courseSlug: "negotiate-interview-terms" },
      { title: "How to manage your expenses", blurb: "Make your first income actually last.", courseSlug: "manage-expenses" },
      { title: "How to invest in AI tools using a special formula", blurb: "A simple formula for spending on AI that pays back.", courseSlug: "invest-in-ai-tools" },
      { title: "How to not play the pick me please in the real world", blurb: "Build real leverage instead of chasing approval.", courseSlug: "pick-me" },
    ],
  },
];

// ============================================================
// Engineering catalog — broader than AI (7 fields)
// Each field expands (magic reveal) to show its topics + sample project.
// ============================================================

export type EngineeringField = {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string; // lucide icon name
  aiIntegration: string;
  topics: { name: string; detail: string }[];
  project?: string;
};

export const engineeringFields: EngineeringField[] = [
  {
    slug: "applied-ai-intelligence",
    number: 1,
    title: "The Core: Applied AI & Intelligence",
    subtitle: "Using AI to solve real problems, not just passing exams.",
    icon: "BrainCircuit",
    aiIntegration: "AI is the core skill — applied to every other field below.",
    topics: [
      {
        name: "Prompt Engineering for Engineers",
        detail:
          "How to talk to LLMs to debug code, design circuits, or generate CAD scripts.",
      },
      {
        name: "Computer Vision for Hardware",
        detail:
          "Teaching cameras to detect defects, count objects, or recognize gestures (OpenCV + AI).",
      },
      {
        name: "Predictive Maintenance",
        detail:
          "Using sensor data + AI to predict when a machine will break before it happens.",
      },
      {
        name: "AI-Assisted Design",
        detail:
          "Generate 100 variations of a product design in minutes, then select the best one.",
      },
      {
        name: "Data Storytelling",
        detail:
          "Analyze messy real-world data and visualize insights for non-technical stakeholders.",
      },
      {
        name: "Ethical AI & Bias",
        detail:
          "Where AI fails in critical systems (medical, automotive) and how to mitigate it.",
      },
    ],
  },
  {
    slug: "embedded-systems-iot",
    number: 2,
    title: "Embedded Systems & IoT",
    subtitle: "The nervous system — sensing and reacting to the physical world.",
    icon: "Cpu",
    aiIntegration: "Edge AI — running AI on small chips.",
    topics: [
      {
        name: "Microcontroller Mastery",
        detail: "ESP32, Arduino, Raspberry Pi Pico programming.",
      },
      {
        name: "Sensor Interfacing",
        detail: "Reading temperature, humidity, pressure, gas, motion.",
      },
      {
        name: "Edge AI Deployment",
        detail:
          "Running tiny ML models directly on microcontrollers (TinyML) without internet.",
      },
      {
        name: "Home & Industrial Automation",
        detail: "Smart systems that react to voice, app, or sensor triggers.",
      },
      {
        name: "Wireless Protocols",
        detail: "MQTT, Bluetooth Low Energy (BLE), LoRaWAN for long-range IoT.",
      },
    ],
    project:
      "Build a Smart Helmet that detects drowsiness using an AI camera and alerts the driver.",
  },
  {
    slug: "cad-digital-manufacturing",
    number: 3,
    title: "CAD Design & Digital Manufacturing",
    subtitle: "The skeleton — turning ideas into manufacturable parts.",
    icon: "Box",
    aiIntegration: "Generative Design & Simulation.",
    topics: [
      {
        name: "Parametric Modeling",
        detail: "Fusion 360, SolidWorks, OnShape — designing with logic, not just drawing.",
      },
      {
        name: "Generative Design",
        detail:
          "Using AI to create organic, lightweight structures humans couldn't imagine.",
      },
      {
        name: "3D Printing & Prototyping",
        detail: "FDM/SLA printing, slicing strategies, material science (PLA, ABS, Resin).",
      },
      {
        name: "Design for Manufacturing (DFM)",
        detail: "Designing parts that are actually cheap and easy to mass-produce.",
      },
      {
        name: "Reverse Engineering",
        detail: "Scanning existing products and recreating/improving them digitally.",
      },
    ],
    project:
      "Use AI to generate a drone frame that is 30% lighter but equally strong, then 3D print it.",
  },
  {
    slug: "robotics-mechatronics",
    number: 4,
    title: "Robotics & Mechatronics",
    subtitle: "The body — making machines move with purpose.",
    icon: "Bot",
    aiIntegration: "Autonomous Navigation & Control.",
    topics: [
      {
        name: "Kinematics & Dynamics",
        detail: "Understanding how gears, levers, and motors move things.",
      },
      {
        name: "Actuator Selection",
        detail: "Choosing the right motor (Stepper, Servo, DC) for the job.",
      },
      {
        name: "Control Systems",
        detail: "PID controllers, feedback loops, stability.",
      },
      {
        name: "Autonomous Navigation",
        detail: "SLAM (mapping), obstacle avoidance using LiDAR/Camera + AI.",
      },
      {
        name: "Robotic Arms & Manipulation",
        detail: "Pick-and-place logic, gripper design, path planning.",
      },
    ],
    project:
      "Build a warehouse robot that maps a room and sorts packages by color using AI vision.",
  },
  {
    slug: "renewable-energy-mobility",
    number: 5,
    title: "Renewable Energy & Electric Mobility",
    subtitle: "The power — clean energy and the vehicles it drives.",
    icon: "BatteryCharging",
    aiIntegration: "Optimization & Grid Management.",
    topics: [
      {
        name: "EV Powertrain Basics",
        detail: "Motors, controllers, battery packs (BMS).",
      },
      {
        name: "Solar System Design",
        detail: "Sizing panels, inverters, batteries for homes/farms.",
      },
      {
        name: "Energy Auditing",
        detail: "Measuring consumption and identifying waste.",
      },
      {
        name: "AI for Energy Optimization",
        detail: "Predict solar output or optimize battery charging cycles.",
      },
      {
        name: "Charging Infrastructure",
        detail: "Understanding standards, connectors, and grid load.",
      },
    ],
    project:
      "Design an AI-powered solar tracker that follows the sun to maximize efficiency by 20%.",
  },
  {
    slug: "supply-chain-operations",
    number: 6,
    title: "Supply Chain, Operations & Sourcing",
    subtitle: "The reality — turning a prototype into a real product.",
    icon: "Truck",
    aiIntegration: "Demand Forecasting & Logistics.",
    topics: [
      {
        name: "Bill of Materials (BOM) Management",
        detail: "Listing every part, cost, and supplier.",
      },
      {
        name: "Vendor Sourcing Strategy",
        detail: "How to find reliable suppliers in India (and China).",
      },
      {
        name: "Cost Estimation & Pricing",
        detail: "Calculating landed cost, margins, and break-even points.",
      },
      {
        name: "Inventory Management",
        detail: "JIT (Just-in-Time), safety stock, warehouse layout.",
      },
      {
        name: "Quality Control (QC)",
        detail: "Statistical process control, defect detection (AI vision).",
      },
    ],
    project:
      "Source all components for a DIY Electronics Kit under ₹500, calculate margins, and create a sourcing plan.",
  },
  {
    slug: "technical-communication-leadership",
    number: 7,
    title: "Technical Communication & Leadership",
    subtitle: "The voice — selling and leading your ideas.",
    icon: "Megaphone",
    aiIntegration: "Content Generation & Translation.",
    topics: [
      {
        name: "Technical Documentation",
        detail: "Writing manuals, API docs, and project reports (aided by AI).",
      },
      {
        name: "Visual Storytelling",
        detail: "Creating diagrams, explainer videos, and presentations.",
      },
      {
        name: "Pitching & Negotiation",
        detail: "Selling ideas to investors, clients, or management.",
      },
      {
        name: "Cross-Cultural Collaboration",
        detail: "Working with global teams across cultures.",
      },
      {
        name: "Patent & IP Basics",
        detail: "How to protect your innovations.",
      },
    ],
    project:
      "Create a full pitch deck and technical manual for your robot, translated into Hindi and English using AI tools.",
  },
];

// ============================================================
// Testimonials
// ============================================================

export type Testimonial = {
  name: string;
  role: string;
  college: string;
  quote: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Aarav Sharma",
    role: "1st-year ECE student",
    college: "Govt. Engineering College, Odisha",
    quote:
      "My college had no AI labs and no mentors. In 6 weeks at forgeVidhya I built an automation that reads my attendance and texts me reminders. My professors were shocked — they didn't even know this was possible.",
    initials: "AS",
  },
  {
    name: "Priya Reddy",
    role: "1st-year CSE student",
    college: "SV Engineering College, Andhra Pradesh",
    quote:
      "I thought AI was only for IIT students with GPUs. Here I learned to ship a RAG app on a free tier and actually understood evals. The career sessions got me my first freelance gig.",
    initials: "PR",
  },
  {
    name: "Mohammed Irfan",
    role: "1st-year Mech student",
    college: "Rural Engineering College, UP",
    quote:
      "Mechanical branch, no coding background. The Imagination-to-Life track helped me prototype an AI tool that generates CAD part suggestions. I presented it at a state hackathon and placed top 5.",
    initials: "MI",
  },
  {
    name: "Sneha Kulkarni",
    role: "1st-year IT student",
    college: "City Engineering College, Maharashtra",
    quote:
      "The mentors actually came from where I come from. No condescension. They showed me how a tier-3 student can out-build a tier-1 student by picking the right tools. I now run a small AI automation side hustle.",
    initials: "SK",
  },
];

// ============================================================
// Stats
// ============================================================

export const stats = [
  { value: "1,200+", label: "Students from 80+ tier-3 colleges" },
  { value: "94%", label: "Complete their first AI project" },
  { value: "₹0", label: "Cost to start — free foundational track" },
  { value: "37", label: "Hiring startup partners" },
];

// ============================================================
// Blog posts
// ============================================================

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // ISO
  readTime: string;
  cover: string; // gradient class or url
  // Lightweight markdown-ish body — H2/H3/p/li rendered in BlogPost page.
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "tier-3-engineer-ai-automation-roadmap-2026",
    title: "The 2026 AI Automation Roadmap for Tier-3 Engineering Students",
    excerpt:
      "A no-fluff, week-by-week path from zero coding experience to shipping your first AI automation — built specifically for students without access to big-college labs or mentors.",
    category: "Roadmaps",
    author: "forgeVidhya Team",
    date: "2026-07-10",
    readTime: "9 min read",
    cover: "from-forge-sky via-forge-blue to-forge-red",
    content: `
## Why this roadmap exists

If you're a first-year engineering student at a tier-3 college in India, you've probably noticed two things. First, the syllabus is decades behind what the industry actually pays for. Second, every YouTube "AI expert" assumes you already know Python, have a GPU, and have a mentor.

This roadmap removes those assumptions. You don't need a GPU. You don't need to code yet. You need six weeks, a laptop, and curiosity.

## The three skills that actually matter in 2026

Forget learning "AI" as a single thing. The market splits into three practical skills:

1. **AI automation** — making AI do repetitive work for you and others.
2. **AI production** — shipping AI features that are fast, cheap, and reliable.
3. **AI creation** — turning ideas into apps, art, and prototypes using AI tools.

Each one is a separate career lever. Master one before chasing the next.

## Week-by-week plan

### Week 1 — Understand the landscape

Spend this week not building anything. Watch how AI is used in real companies. Sign up for free tiers of n8n, OpenAI, and Claude. Read three case studies of AI automations saving small businesses time.

### Week 2 — Your first automation

Pick one boring task in your own life: summarizing lecture notes, organizing attendance, or triaging emails. Build a single n8n workflow that does it. It will be ugly. Ship it anyway.

### Week 3 — Connect AI to the real world

Wire your workflow to a real tool — Google Sheets, WhatsApp, or Gmail. The moment your AI sends you a WhatsApp message unprompted, you understand what "automation" actually means.

### Week 4 — Make it reliable

Add error handling, retries, and a simple dashboard. This is where most tutorials stop and where real engineering begins.

### Week 5 — Show your work

Write a short post. Record a 60-second demo. Post it publicly. Visibility compounds — the tier-3 student who posts weekly beats the tier-1 student who posts never.

### Week 6 — Pick a specialization

Now choose: go deeper into production engineering, or pivot into AI creation. You've earned the right to specialize.

## What to ignore

Ignore people selling "AGI is coming" fear content. Ignore courses that promise 12-month curriculums. Ignore anyone who says tier-3 students can't compete — they're selling you a story, not skills.

The only thing standing between you and your first AI project is six focused weeks. Start this week.
`,
  },
  {
    slug: "ship-rag-app-free-tier-no-gpu",
    title: "How to Ship a RAG App on a Free Tier (No GPU Required)",
    excerpt:
      "Retrieval-augmented generation sounds intimidating. Here's the exact architecture we teach first-years to deploy a RAG app for ₹0, with evals, caching, and real users.",
    category: "Tutorials",
    author: "Ananya Verma",
    date: "2026-06-28",
    readTime: "12 min read",
    cover: "from-surface-cloud to-surface-mist",
    content: `
## The myth of the expensive RAG stack

Open any RAG tutorial and you'll see GPU requirements, vector database pricing, and Kubernetes. None of that is necessary for a first deployment. In this guide we build a RAG app that answers questions over your college's PDF notes — entirely on free tiers.

## What you'll need

- A free OpenAI or Claude API key (or a free local model)
- A free Pinecone or Qdrant account (free tier is enough for ~50k chunks)
- A free Vercel or Cloudflare Pages account
- A laptop. That's it.

## The architecture

### Step 1 — Ingest your documents

Chunk your PDFs into 500-token pieces with 50-token overlap. Store each chunk with its source filename and page number as metadata. Metadata is what makes citations possible later.

### Step 2 — Embed and store

Use a small embedding model like text-embedding-3-small. It costs fractions of a rupee per million tokens. Store embeddings in Qdrant's free tier.

### Step 3 — Retrieve with a query plan

Don't just dump the top-5 chunks into the prompt. First, rewrite the user's question into a cleaner search query. Then retrieve. Then rerank with a simple cross-encoder. This single trick cuts hallucinations dramatically.

### Step 4 — Generate with citations

Prompt the model to only answer from the retrieved chunks and to cite the source filename + page. If the chunks don't contain the answer, it should say "I don't know." Saying "I don't know" is a feature, not a bug.

## The part tutorials skip — evals

Before you ship, build a tiny eval set: 20 questions with known-good answers. Score each answer on (a) correctness and (b) did it cite the right source. If your score drops below 80%, don't ship. Fix retrieval first.

## Cost control

Add a simple in-memory cache keyed on the rewritten query. 60% of student queries are repeats. This alone takes your monthly bill from "worried" to "forgot about it."

## Deploy

Push to Vercel. Add a feedback button. Watch real users break your assumptions. That's when the real engineering starts.

The whole stack costs ₹0 until you have real traffic — and by then you'll know exactly which line item to optimize.
`,
  },
  {
    slug: "tier-3-student-outbuild-tier-1",
    title: "How a Tier-3 Student Can Out-Build a Tier-1 Student",
    excerpt:
      "It's not about being smarter. It's about choosing the right game. Here's the asymmetric strategy we've watched play out across 1,000+ students.",
    category: "Career",
    author: "Karthik Nair",
    date: "2026-06-15",
    readTime: "7 min read",
    cover: "from-forge-blue to-forge-red",
    content: `
## The unfair advantage nobody talks about

Tier-1 students have better labs, better peers, and better brand names on their resumes. You cannot beat them at their game. But you don't have to play their game.

The game they're forced to play is "learn the fundamentals slowly over four years." The game you can choose to play is "ship AI tools to real users every month."

## Why shipping beats studying right now

The AI tooling stack changes every 90 days. A second-year student who shipped a tool last month knows more about what actually works in 2026 than a fourth-year student who studied a 2022 textbook. Speed of shipping is now a moat.

## The asymmetric playbook

### Pick a narrow, real problem

Tier-1 students chase flashy problems because they want impressive resumes. You should chase boring, specific, painful problems — like "auto-fill attendance for my college's specific portal." Boring + specific = shippable in a weekend.

### Build in public, weekly

Every Friday, post one thing you built. It doesn't have to be polished. Public cadence beats private perfection. After 12 weeks, recruiters can see a body of work. A tier-1 resume cannot compete with 12 shipped projects.

### Use AI as your team

You don't have a senior to review your code. Use Claude or GPT as your code reviewer. You don't have a designer. Use image-generation tools. You don't have a PM. Use AI to draft user interview questions. AI collapses the team you don't have into one person.

### Pick markets they ignore

Tier-1 students optimize for FAANG. You should optimize for startups in tier-2 cities, for solo founders, for small businesses that need an AI automation built yesterday. These employers care about shipped work, not college names.

## The hard truth

This strategy works, but only if you ship. Reading this article and doing nothing is the same as not reading it. The students we've watched break out of tier-3 constraints all share one trait: they shipped something this month.

Pick your weekend project. Go.
`,
  },
  {
    slug: "ai-automation-ideas-college-students",
    title: "10 AI Automation Ideas Any College Student Can Build This Weekend",
    excerpt:
      "Stuck on what to build? Here are ten AI automations that solve real student problems and double as portfolio projects recruiters love.",
    category: "Ideas",
    author: "forgeVidhya Team",
    date: "2026-05-30",
    readTime: "6 min read",
    cover: "from-forge-sky to-surface-mist",
    content: `
## Why weekend projects matter

A shipped weekend project beats a perfect never-finished project. Every idea below is small enough to finish in 2 days and impressive enough to put on your portfolio.

## The 10 ideas

### 1. Lecture note summarizer
Upload a lecture recording, get a structured summary with key terms and a 5-question quiz. Great for exam week.

### 2. Attendance auto-tracker
A script that reads your timetable and WhatsApp group messages and predicts who's likely to fall below 75% attendance.

### 3. Assignment deadline voice agent
An AI voice call that reminds you of deadlines in your own language — Hindi, Tamil, Telugu, or Bengali.

### 4. Lab report formatter
Take messy lab notes and output a clean, formatted lab report with the correct sections and a generated diagram.

### 5. Internship scraper + matcher
Scrape internship postings daily, match them to your skills using embeddings, and WhatsApp you the top 3.

### 6. Study group matcher
Collect everyone's free slots and subjects they want help with, then auto-form study groups of 3-4.

### 7. Code review bot for your class Discord
A bot that reviews classmates' code submissions using an LLM and gives friendly, specific feedback.

### 8. Campus event poster generator
Type the event details, get a ready-to-post Instagram poster in your college's colors.

### 9. Mess menu nutrition explainer
Photograph the mess menu, get a breakdown of calories, protein, and what to pair for a balanced meal.

### 10. Resume tailorer
Paste a job description, get your resume rewritten with the right keywords — without lying.

## How to pick

Pick the one that solves a problem you personally have. You'll ship faster, test with real users (your friends), and the story you tell recruiters will be genuine.

Pick one. Build it this weekend. Post it Monday.
`,
  },
  {
    slug: "evals-not-vibes-ai-production",
    title: "Evals, Not Vibes: How to Know Your AI App Actually Works",
    excerpt:
      "Vibes-based testing is why 80% of AI features get quietly turned off in production. Here's the eval-first workflow we teach every forgeVidhya student before they ship.",
    category: "AI Production",
    author: "Ananya Verma",
    date: "2026-05-12",
    readTime: "11 min read",
    cover: "from-forge-red via-forge-blue to-forge-sky",
    content: `
## The vibes trap

You built an AI feature. You tried it three times. It felt good. You shipped it. Two weeks later, users complain it's "wrong sometimes" and you have no idea why.

This is the vibes trap — and it's the number one reason AI features get turned off in production.

## What an eval actually is

An eval is a test for AI behavior. It has three parts:

1. **An input** — a realistic user question or task.
2. **An expected behavior** — the correct answer, the right format, or a rubric.
3. **A scorer** — a function that says pass or fail.

That's it. You don't need a fancy framework. A folder of 30 JSON files and a 50-line Python script is a real eval suite.

## Building your first eval set

### Start with failure modes, not success cases

Don't write evals for things your AI already does well. Write evals for the ways it embarrasses you: when it hallucinates, when it refuses helpful requests, when it leaks prompts, when it's too verbose.

### Use real user queries

The first 20 queries you get from real users become your first 20 evals. Tag each with what the right answer should have been. Now every change you make is measured against reality.

### Mix automatic and human scoring

Some checks are automatic: "did the output contain a citation?" Some need a rubric: "is this explanation clear to a first-year student?" Use both. Pure automatic scoring misses tone. Pure human scoring doesn't scale.

## Running evals on every change

Before you change a prompt, a model, or a retrieval setting, run the full eval set. If score drops, revert. If score rises, ship. This single habit puts you ahead of most "AI engineers" in the industry today.

## The metric that matters

Your headline metric should be "pass rate on the eval set." Not latency. Not cost. Those are constraints. Pass rate is the outcome. Optimize the outcome, respect the constraints.

## What this looks like in practice

A student in our last cohort took their RAG app from 62% pass rate to 91% in four days — just by writing evals and iterating. They didn't touch the model. They fixed retrieval, rewrote the query plan, and tightened the prompt.

Evals aren't extra work. Evals are the work.
`,
  },
];

export const blogCategories = Array.from(
  new Set(blogPosts.map((p) => p.category))
);
