import { bandFor, skills } from "@/lib/site";

export default function Skills() {
  return (
    <section className="card card--flush" aria-labelledby="experience-label">
      <h2 className="card__header card__header--center" id="experience-label">
        My Experiences
      </h2>

      <ul className="skills">
        {skills.map((skill, index) => (
          <li
            className="skill"
            key={skill.name}
            style={{ "--level": skill.level, "--index": index } as React.CSSProperties}
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
