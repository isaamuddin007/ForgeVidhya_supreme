/**
 * frontend/src/data/programs.js
 * Program taxonomy for forgeVidhya, grouped into 3 broad categories.
 *
 * This is the single source of truth for the Programs section. Copy for the
 * carried-over AI + engineering tracks preserves the existing site wording;
 * the non-engineering track summaries are written in the same voice.
 *
 * NOTE: static, trusted content — no user input flows through here, so it is
 * safe to render directly. If tracks ever become user/CMS-authored, sanitize
 * with DOMPurify before rendering (see frontend/src/utils/api.js).
 */

export const PROGRAM_CATEGORIES = [
  {
    id: 'ai-tech',
    name: 'AI & Tech',
    tagline: 'Start fast — from no-code automation to production AI, and raw ideas into shipped things.',
    accent: '#00BFFF', // electric blue
    tracks: [
      {
        title: 'AI Automation Fundamentals',
        summary: 'Replace repetitive work with autonomous AI agents.',
        level: 'Beginner-friendly',
        length: '6 weeks',
      },
      {
        title: 'AI Production Engineering',
        summary: 'Take AI demos from prototype to reliable real-world systems.',
        level: 'Intermediate',
        length: '8 weeks',
      },
      {
        title: 'Imagination to Life with AI',
        summary: 'Turn your ideas into apps, art, and products — no team required.',
        level: 'All levels',
        length: '5 weeks',
      },
    ],
  },
  {
    id: 'core-engineering',
    name: 'Core Engineering',
    tagline: 'The full stack of a real machine — intelligence, senses, skeleton, body, and power.',
    accent: '#0080BF', // deep blue
    tracks: [
      {
        title: 'Applied AI & Artificial Intelligence',
        summary: 'Using AI to solve real problems, not just passing exams.',
      },
      {
        title: 'Embedded Systems & IoT',
        summary: 'The nervous system — sensing and reacting to the physical world.',
      },
      {
        title: 'CAD Design & Digital Manufacturing',
        summary: 'The skeleton — turning ideas into manufacturable parts.',
      },
      {
        title: 'Robotics & Mechatronics',
        summary: 'The body — making machines move with purpose.',
      },
      {
        title: 'Renewable Energy & Electric Mobility',
        summary: 'The power — clean energy and the vehicles it drives.',
      },
    ],
  },
  {
    id: 'non-engineering',
    name: 'Non-Engineering',
    tagline: "The stuff no syllabus teaches — money, leverage, and holding your own in any room.",
    accent: '#FF9500', // fire orange
    tracks: [
      {
        title: 'How to Negotiate Terms in an Interview',
        summary: 'Walk in knowing your worth and walk out with a better offer.',
      },
      {
        title: 'How to Manage Expenses',
        summary: 'Make your money outlast the month — budgeting that actually sticks.',
      },
      {
        title: 'How to Invest Using AI Tools (a special formula)',
        summary: 'A repeatable, educational framework for using AI tools to research smarter investing decisions.',
      },
      {
        title: "How to Not Play the 'Pick Me' Game in the Real World",
        summary: 'Build real leverage and self-respect instead of chasing approval.',
      },
    ],
  },
];

// Convenience: total number of tracks across all categories.
export const TOTAL_TRACKS = PROGRAM_CATEGORIES.reduce(
  (n, c) => n + c.tracks.length,
  0
);
