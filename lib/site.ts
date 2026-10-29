// Site-wide facts shared by the layout, tests, and later SEO and /llms.txt.
// Public information only (plan §7.4).

export const site = {
  owner: "Arham Zahid Khan",
  // Production URL; becomes the custom domain in Step 23.
  url: "https://portfolio-khanzarham.vercel.app",
  // Hero and bio: every claim traces to the CV (Oct 2026). Target roles:
  // AI engineer only (plan open question #1).
  role: "AI Engineer (in training)",
  positioning:
    "Final-year computer science student building LLM-powered applications, from prompt design and structured output to the APIs that ship them.",
  bio: [
    "I'm a final-year BS Computer Science student at the University of Lahore, focused on building AI-powered applications.",
    "In my final year project, CareerSyncAI, I integrate the Google Gemini LLM through prompt engineering to parse resumes into structured JSON, tailor CVs to job descriptions and run a multi-turn screening chatbot. I learned Python and FastAPI from scratch to deliver its backend on a 30-day timeline.",
    "I also completed a 10-week AI automation internship at Developers Hub, building and testing AI-driven automated workflows.",
    "How I work: I validate every feature end to end, keep regression checkpoints after each phase, and learn a new stack quickly when a project needs it.",
  ],
  email: "khanarhamzahid@gmail.com",
  social: {
    github: "https://github.com/khanzArham",
    linkedin: "https://www.linkedin.com/in/arham-zahid-khan-7b428025a/",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  /** Kept out of navigation until the section has real content. */
  hidden?: boolean;
};

export const navItems: readonly NavItem[] = [
  { label: "Work", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Skills", href: "/skills" },
  // Plan §10: the Lab stays hidden until it has working demos.
  { label: "Lab", href: "/lab", hidden: true },
  { label: "About", href: "/about" },
];

export const visibleNavItems = navItems.filter((item) => !item.hidden);

export const contactItem: NavItem = { label: "Contact", href: "/contact" };
