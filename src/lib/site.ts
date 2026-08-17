export const siteConfig = {
  name: "Vamshi Systems Lab",
  shortName: "V/E",
  description:
    "An interactive playground by Vamshi Endurthi for exploring simplified wireless propagation, obstacles, smart devices, and movement.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  github: "https://github.com/vamshidharreddye",
  resume: process.env.NEXT_PUBLIC_RESUME_URL || "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || ""
} as const;

export const primaryNavigation = [
  { label: "Playground", href: "/" },
  { label: "About", href: "/about" }
] as const;
