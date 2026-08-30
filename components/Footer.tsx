import { profile } from "@/lib/site";

/* Built once per deploy, which is when the year is read. */
const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      {profile.name} · {year}
    </footer>
  );
}
