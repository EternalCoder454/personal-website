import { profile } from "@/lib/site";

/* Read at build time. */
const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      {profile.name} · {year}
    </footer>
  );
}
