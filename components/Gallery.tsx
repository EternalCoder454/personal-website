"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gallery, type Piece } from "@/lib/site";

/* Plain <img>, not next/image: these are pixel art, and the image optimiser
   resamples, which blurs exactly the edges that make them what they are. */

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="empty">
      <span className="icon empty__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty__title">Nothing here yet</p>
      <p className="empty__text">{text}</p>
    </div>
  );
}

function Lightbox({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="lightbox">
      <div className="lightbox__scrim" onClick={onClose} />
      <button
        ref={closeRef}
        className="lightbox__close icon-button"
        type="button"
        onClick={onClose}
        aria-label="Close image"
      >
        <span className="icon" aria-hidden="true">
          close
        </span>
      </button>
      <figure className="lightbox__figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lightbox__img" src={piece.src} alt={piece.alt} />
        <figcaption className="lightbox__caption">{piece.caption}</figcaption>
      </figure>
    </div>
  );
}

export default function Gallery() {
  const [open, setOpen] = useState<Piece | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  return (
    <>
      {gallery.map((section) => (
        <section
          key={section.title}
          className="card card--flush"
          aria-labelledby={`${section.title}-label`}
        >
          <h2 className="card__header" id={`${section.title}-label`}>
            {section.title}
          </h2>

          {section.pieces.length > 0 ? (
            <div className="gallery">
              {section.pieces.map((piece) => (
                <figure className="piece" key={piece.src}>
                  <button
                    className="piece__button"
                    type="button"
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setOpen(piece);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={piece.src} alt={piece.alt} loading="lazy" />
                  </button>
                  <figcaption className="piece__caption">{piece.caption}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <EmptyState icon={section.icon} text={section.emptyText} />
          )}
        </section>
      ))}

      {open && <Lightbox piece={open} onClose={close} />}
    </>
  );
}
