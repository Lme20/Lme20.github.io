export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: "/", label: "home" },
  { href: "/me", label: "about me" },
  { href: "/projects", label: "projects" },
  { href: "/design", label: "design" },
  { href: "/creations", label: "creations" },
  { href: "/papers", label: "papers" },
  { href: "/cv", label: "cv" },
];

export function isActive(href: string, path: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}