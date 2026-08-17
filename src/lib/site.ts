export const siteConfig = {
  name: "Vamshi Systems Lab",
  shortName: "V/E",
  description:
    "Vamshi Endurthi builds software, AI systems, infrastructure, and interfaces that make engineering behavior visible.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  github: "https://github.com/vamshidharreddye",
  resume: process.env.NEXT_PUBLIC_RESUME_URL || "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || ""
} as const;

export const primaryNavigation = [
  { label: "Systems", href: "/systems" },
  { label: "Lab", href: "/lab" },
  { label: "Signals", href: "/signals" },
  { label: "Field Notes", href: "/field-notes" },
  { label: "About", href: "/about" }
] as const;
