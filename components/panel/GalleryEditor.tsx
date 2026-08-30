import { addPiece, deletePiece, savePiece } from "@/app/panel/actions";
import type { Section } from "@/lib/content";

export default function GalleryEditor({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => (
        <section
          className="card card--flush"
          key={section.slug}
          aria-labelledby={`panel-${section.slug}`}
        >
          <h2 className="card__header" id={`panel-${section.slug}`}>
            {section.title}
          </h2>

          <ul className="editor">
            {section.pieces.map((piece) => (
              <li className="editor__row" key={piece.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="editor__thumb" src={piece.src} alt="" />

                <form action={savePiece} className="editor__form">
                  <input type="hidden" name="id" value={piece.id} />
                  <label className="field field--inline">
                    <span className="field__label">Caption</span>
                    <input
                      className="field__input"
                      name="caption"
                      defaultValue={piece.caption}
                      required
                    />
                  </label>
                  <label className="field field--inline">
                    <span className="field__label">Alt text</span>
                    <input className="field__input" name="alt" defaultValue={piece.alt} />
                  </label>
                  <button className="button button--tonal" type="submit">
                    Save
                  </button>
                </form>

                <div className="editor__side">
                  <form action={deletePiece}>
                    <input type="hidden" name="id" value={piece.id} />
                    <button
                      className="icon-button"
                      type="submit"
                      aria-label={`Delete ${piece.caption}`}
                    >
                      <span className="icon" aria-hidden="true">
                        delete
                      </span>
                    </button>
                  </form>
                </div>
              </li>
            ))}

            {section.pieces.length === 0 && (
              <li className="editor__none">Nothing in this section yet.</li>
            )}
          </ul>

          <form action={addPiece} className="editor__form editor__form--add">
            <input type="hidden" name="section" value={section.slug} />
            <label className="field field--inline">
              <span className="field__label">Image</span>
              <input
                className="field__input field__input--file"
                name="file"
                type="file"
                accept="image/*"
                required
              />
            </label>
            <label className="field field--inline">
              <span className="field__label">Caption</span>
              <input className="field__input" name="caption" required />
            </label>
            <button className="button button--filled" type="submit">
              Upload
            </button>
          </form>
        </section>
      ))}
    </>
  );
}
