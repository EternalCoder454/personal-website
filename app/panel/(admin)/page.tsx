import type { Metadata } from "next";
import SkillsEditor from "@/components/panel/SkillsEditor";
import GalleryEditor from "@/components/panel/GalleryEditor";
import SecurityCard from "@/components/panel/SecurityCard";
import SignOutButton from "@/components/panel/SignOutButton";
import { getSkills, getSections } from "@/lib/content";
import { hasDatabase } from "@/lib/db";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function PanelPage() {
  const [skills, sections] = await Promise.all([getSkills(), getSections()]);

  return (
    <main className="content content--wide">
      <div className="panel-head">
        <h1 className="panel-head__title">Panel</h1>
        <SignOutButton />
      </div>

      {!hasDatabase && (
        <section className="card panel-warning">
          <span className="icon" aria-hidden="true">warning</span>
          <p>
            DATABASE_URL is not set, so this is showing the defaults from
            lib/site.ts and nothing can be saved.
          </p>
        </section>
      )}

      <SkillsEditor skills={skills} />
      <GalleryEditor sections={sections} />
      <SecurityCard />
    </main>
  );
}
