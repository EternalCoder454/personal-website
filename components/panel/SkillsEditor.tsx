import { addSkill, deleteSkill, moveSkill, saveSkill } from "@/app/panel/actions";
import { bandFor } from "@/lib/site";
import type { SkillRow } from "@/lib/content";

export default function SkillsEditor({ skills }: { skills: SkillRow[] }) {
  return (
    <section className="card card--flush" aria-labelledby="panel-skills">
      <h2 className="card__header" id="panel-skills">
        Experiences
      </h2>

      <ul className="editor">
        {skills.map((skill, index) => (
          <li className="editor__row" key={skill.id}>
            <form action={saveSkill} className="editor__form">
              <input type="hidden" name="id" value={skill.id} />

              <label className="field field--inline">
                <span className="field__label">Name</span>
                <input className="field__input" name="name" defaultValue={skill.name} required />
              </label>

              <label className="field field--inline field--narrow">
                <span className="field__label">Icon</span>
                <input className="field__input" name="icon" defaultValue={skill.icon} required />
              </label>

              <label className="field field--inline field--tiny">
                <span className="field__label">Level</span>
                <input
                  className="field__input"
                  name="level"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={skill.level}
                  required
                />
              </label>

              <span className="editor__band">{bandFor(skill.level)}</span>
              <button className="button button--tonal" type="submit">
                Save
              </button>
            </form>

            <div className="editor__side">
              <form action={moveSkill}>
                <input type="hidden" name="id" value={skill.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  className="icon-button"
                  type="submit"
                  aria-label={`Move ${skill.name} up`}
                  disabled={index === 0}
                >
                  <span className="icon" aria-hidden="true">
                    arrow_upward
                  </span>
                </button>
              </form>
              <form action={moveSkill}>
                <input type="hidden" name="id" value={skill.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  className="icon-button"
                  type="submit"
                  aria-label={`Move ${skill.name} down`}
                  disabled={index === skills.length - 1}
                >
                  <span className="icon" aria-hidden="true">
                    arrow_downward
                  </span>
                </button>
              </form>
              <form action={deleteSkill}>
                <input type="hidden" name="id" value={skill.id} />
                <button className="icon-button" type="submit" aria-label={`Delete ${skill.name}`}>
                  <span className="icon" aria-hidden="true">
                    delete
                  </span>
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <form action={addSkill} className="editor__form editor__form--add">
        <label className="field field--inline">
          <span className="field__label">New experience</span>
          <input className="field__input" name="name" placeholder="Name" required />
        </label>
        <label className="field field--inline field--narrow">
          <span className="field__label">Icon</span>
          <input className="field__input" name="icon" placeholder="star" />
        </label>
        <label className="field field--inline field--tiny">
          <span className="field__label">Level</span>
          <input className="field__input" name="level" type="number" min={1} max={10} defaultValue={1} />
        </label>
        <button className="button button--filled" type="submit">
          Add
        </button>
      </form>
    </section>
  );
}
