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
    "Final-year computer science student training as an AI engineer: prompt contracts, LLM evaluation suites and AI automation workflows.",
  bio: [
    "I'm a final-year BS Computer Science student at the University of Lahore, training to become an AI engineer.",
    "In a 10-week AI automation and prompt engineering internship at Developers Hub, I built and tested LLM workflows with routing, JSON validation and retries, wrote prompt contracts and Claude skills with explicit output schemas and fallbacks, and built evaluation suites for edge cases, malformed inputs and prompt-injection risks.",
    "My final year project, CareerSyncAI, is in its design and documentation phase: a two-sided recruitment platform that will use the Google Gemini and Claude APIs to parse resumes, tailor CVs to job descriptions and screen candidates.",
  ],
  email: "khanarhamzahid@gmail.com",
  social: {
    github: "https://github.com/khanzArham",
    linkedin: "https://www.linkedin.com/in/arham-zahid-khan-7b428025a/",
  },
} as const;

/**
 * Projects under way without a published dossier, shown honestly on the
 * journey map's Build station. Remove an entry once its dossier ships.
 */
export const projectsInProgress = [
  { name: "CareerSyncAI", status: "In design · final year project" },
] as const;

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
