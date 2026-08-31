"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GallerySection, Piece } from "@/lib/site";

/* Plain <img>, not next/image: these are pixel art, and the image optimiser
   resamples, which blurs exactly the edges that make them what they are. */

/* From the loaded thumbnail, so the lightbox reserves the right box. */
type Opened = Piece & { width: number; height: number };

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

function Lightbox({ piece, onClose }: { piece: Opened; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);

  const dismiss = useCallback(() => setClosing(true), []);

  /* Safety net: animationend never fires in a background tab. */
  useEffect(() => {
    if (!closing) return;
    const id = setTimeout(onClose, 400);
    return () => clearTimeout(id);
  }, [closing, onClose]);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }

      /* Without this, Tab walks out of the dialog. */
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    /* Pad back the scrollbar width so the page does not shift. */
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [dismiss]);

  return createPortal(
    <div
      className={`lightbox${closing ? " lightbox--closing" : ""}`}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={piece.caption || "Image"}
    >
      <div
        className="lightbox__scrim"
        onClick={dismiss}
        onAnimationEnd={() => {
          if (closing) onClose();
        }}
      />
      <button
        ref={closeRef}
        className="lightbox__close icon-button"
        type="button"
        onClick={dismiss}
        aria-label="Close image"
      >
        <span className="icon" aria-hidden="true">
          close
        </span>
      </button>
      <figure className="lightbox__figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="lightbox__img"
          src={piece.src}
          alt={piece.alt}
          width={piece.width || undefined}
          height={piece.height || undefined}
        />
        <figcaption className="lightbox__caption">{piece.caption}</figcaption>
      </figure>
    </div>,
    document.body
  );
}

export default function GalleryGrid({ section }: { section: GallerySection }) {
  const [open, setOpen] = useState<Opened | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  if (section.pieces.length === 0) {
    return <EmptyState icon={section.icon} text={section.emptyText} />;
  }

  return (
    <>
      <div className="gallery">
        {section.pieces.map((piece, index) => (
          <figure
            className="piece"
            key={piece.src}
            style={{ "--index": index } as React.CSSProperties}
          >
            <button
              className="piece__button"
              type="button"
              aria-label={`Open ${piece.caption}`}
              onClick={(event) => {
                const button = event.currentTarget;
                const img = button.querySelector("img");
                opener.current = button;
                setOpen({
                  ...piece,
                  width: img?.naturalWidth ?? 0,
                  height: img?.naturalHeight ?? 0,
                });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={piece.src} alt={piece.alt} loading="lazy" />
            </button>
            <figcaption className="piece__caption">{piece.caption}</figcaption>
          </figure>
        ))}
      </div>

      {open && <Lightbox piece={open} onClose={close} />}
    </>
  );
}
