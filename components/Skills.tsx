import { bandFor } from "@/lib/site";
import type { SkillRow } from "@/lib/content";

export default function Skills({ skills }: { skills: SkillRow[] }) {
  return (
    <section className="card card--flush" aria-labelledby="experience-label">
      <h2 className="card__header" id="experience-label">
        Experiences
      </h2>

      <ul className="skills">
        {skills.map((skill) => (
          <li
            className="skill"
            key={skill.id}
            style={{ "--level": skill.level } as React.CSSProperties}
          >
            <span className="skill__icon icon" aria-hidden="true">
              {skill.icon}
            </span>
            <span className="skill__body">
              <span className="skill__name">{skill.name}</span>
              <span className="skill__meta">
                Level {skill.level} · {bandFor(skill.level)}
              </span>
              <span className="skill__meter" aria-hidden="true" />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
