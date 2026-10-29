// Site-wide facts shared by the layout, tests, and later SEO and /llms.txt.
// Public information only (plan §7.4).

export const site = {
  owner: "Arham Zahid Khan",
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
