// Site-wide facts shared by the layout, tests, and later SEO and /llms.txt.
// Public information only (plan §7.4).

export const site = {
  owner: "Arham Zahid Khan",
  // Production URL; becomes the custom domain in Step 23.
  url: "https://portfolio-khanzarham.vercel.app",
  // Hero and bio: every claim traces to the CV (Oct 2026). Target roles:
  // AI engineer only (plan open question #1).
  role: "AI Engineer (in training)",
  // Only what is done today. CareerSyncAI is in design and documentation
  // (development not started, 2026-10-30), so it is described as a plan.
  positioning:
    "Final-year computer science student training as an AI engineer, with hands-on AI automation work and an LLM-powered recruitment platform in design.",
  bio: [
    "I'm a final-year BS Computer Science student at the University of Lahore, training to become an AI engineer.",
    "I completed a 10-week AI automation internship at Developers Hub, building and testing AI-driven automated workflows.",
    "My final year project, CareerSyncAI, is in its design and documentation phase: a two-sided recruitment platform that will use the Google Gemini LLM to parse resumes, tailor CVs to job descriptions and screen candidates.",
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
