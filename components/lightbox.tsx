"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Screenshot } from "@/lib/site";

/**
 * Click a screenshot, read it properly.
 *
 * One <dialog> for the whole page, opened from anywhere through the
 * context, so twelve thumbnails do not mean twelve overlays.
 *
 * The two platform workarounds here are the same ones the tour overlay
 * needed, and for the same measured reasons: the close event is not
 * dispatched in every engine, so state is synced from a MutationObserver
 * on the open attribute; and Escape does not always close a modal
 * dialog by itself, so it is handled explicitly.
 */

type LightboxContext = { open: (shot: Screenshot) => void };

const Ctx = createContext<LightboxContext>({ open: () => {} });

export const useLightbox = () => useContext(Ctx);

/** The full-resolution twin of a card image. */
const fullSrc = (src: string) => src.replace(/\.webp$/, "-full.webp");

export function LightboxProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shot, setShot] = useState<Screenshot | null>(null);
  /* false: fitted to the viewport. true: 1:1, pan by scrolling. */
  const [actualSize, setActualSize] = useState(false);

  const open = useCallback((next: Screenshot) => {
    setShot(next);
    setActualSize(false);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setShot(null);
  }, []);

  /* The open attribute changes on every close path. The close event does
     not fire at all in some engines, so this is the signal to trust. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const observer = new MutationObserver(() => {
      if (!dialog.open) setShot(null);
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, []);

  /* Lock the page behind the overlay and pad back the scrollbar width,
     and close on Escape by hand rather than trusting the platform. */
  useEffect(() => {
    if (!shot) return;
    const body = document.body;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [shot, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}

      <dialog
        ref={dialogRef}
        aria-label={shot ? shot.alt : "Screenshot"}
        className="lightbox"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        {shot ? (
          <div className="lightbox-panel">
            <div className="flex items-center justify-between gap-6 border-b border-outline-variant px-5 py-3">
              <p className="t-body-sm min-w-0 truncate text-on-surface-variant">
                {shot.caption || shot.alt}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActualSize((v) => !v)}
                  className="target rounded-[var(--radius-sm)] px-3 t-body-sm text-on-surface-variant transition-colors duration-100 hover:bg-surface-container hover:text-on-surface"
                >
                  {actualSize ? "Fit" : "Actual size"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="target grid place-items-center rounded-[var(--radius-sm)] text-on-surface-variant transition-colors duration-100 hover:bg-surface-container hover:text-on-surface"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className={actualSize ? "overflow-auto" : "overflow-hidden"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullSrc(shot.src)}
                alt={shot.alt}
                /* The full file's own dimensions, not the card's. An
                   attribute width smaller than the file caps the used
                   width, which made "actual size" render the same
                   pixels as the thumbnail. */
                width={shot.fullWidth}
                height={shot.fullHeight}
                onClick={() => setActualSize((v) => !v)}
                className={
                  actualSize
                    ? "h-auto max-w-none cursor-zoom-out"
                    : "h-auto max-h-[80vh] w-full cursor-zoom-in object-contain"
                }
              />
            </div>
          </div>
        ) : null}
      </dialog>
    </Ctx.Provider>
  );
}

/** Wraps a screenshot so the whole thing is one button. */
export function Zoomable({
  shot,
  className = "",
  children,
}: {
  shot: Screenshot;
  className?: string;
  children: ReactNode;
}) {
  const { open } = useLightbox();

  return (
    <button
      type="button"
      onClick={() => open(shot)}
      aria-label={`Enlarge: ${shot.alt}`}
      className={`group block w-full cursor-zoom-in text-left ${className}`}
    >
      {children}
    </button>
  );
}
