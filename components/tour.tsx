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
import { tour } from "@/lib/site";

/**
 * The tour overlay.
 *
 * One <dialog> for the whole page, opened from anywhere through the
 * context, so a second trigger does not mean a second copy of the video
 * element. Native <dialog> is used on purpose: it brings focus
 * trapping, focus restore and Escape with it, none of which are worth
 * reimplementing.
 *
 * While `tour.src` is empty, `available` is false and every trigger
 * renders as an inert frame instead of a button.
 */

type TourContext = {
  available: boolean;
  open: () => void;
};

const Ctx = createContext<TourContext>({ available: false, open: () => {} });

export const useTour = () => useContext(Ctx);

export function TourProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const available = tour.src.length > 0;

  const open = useCallback(() => {
    if (!available) return;
    dialogRef.current?.showModal();
    setIsOpen(true);
  }, [available]);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setIsOpen(false);
  }, []);

  /* Keep the state in step with the element however it was closed: the
     button, Escape, or the backdrop.

     This watches the open attribute rather than listening for the close
     event, because the close event is not dispatched in every engine.
     Measured here: dialog.close() removed the attribute and fired
     nothing, which left the state stale and the page scroll-locked for
     good. The attribute is removed on every close path, so it is the
     signal that cannot be missed. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const observer = new MutationObserver(() => setIsOpen(dialog.open));
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, [available]);

  /* Locking the body removes the scrollbar and shifts the page sideways
     by its width. Pad it back by the exact gap. A modal <dialog> does
     not do this for you in every browser.

     Escape is closed by hand here rather than left to the platform.
     A modal dialog is supposed to close itself on Escape, and in this
     engine it does not: measured with focus inside the dialog and
     :modal matching, a real Escape press left it open. Closing a modal
     is not a thing to leave to a behaviour that might not be there. */
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, close]);

  return (
    <Ctx.Provider value={{ available, open }}>
      {children}

      {available ? (
        <dialog
          ref={dialogRef}
          aria-label={tour.title}
          className="tour-dialog"
          /* A click on the backdrop has the dialog itself as its target,
             because the backdrop is a pseudo-element of it. */
          onClick={(event) => {
            if (event.target === dialogRef.current) close();
          }}
        >
          <div className="tour-panel">
            <div className="flex items-start justify-between gap-6 border-b border-outline-variant px-5 py-4">
              <div>
                <p className="t-label text-on-surface-muted">Product tour</p>
                <p className="t-title mt-1.5 text-on-surface">{tour.title}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close the tour"
                className="target -mr-2 -mt-2 grid shrink-0 place-items-center rounded-[var(--radius-sm)] text-on-surface-variant transition-colors duration-100 hover:bg-surface-container hover:text-on-surface"
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

            {/* aspect-ratio reserves the box before the file arrives, so
                opening the overlay does not shift what is behind it.

                The video is mounted only while the overlay is open, so
                closing it stops playback and the next open starts at the
                beginning. That is one less thing to reset by hand. */}
            <div className="aspect-video w-full bg-black">
              {isOpen ? (
                <video
                  className="h-full w-full"
                  src={tour.src}
                  poster={tour.poster || undefined}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  {tour.captions ? (
                    <track
                      kind="captions"
                      src={tour.captions}
                      srcLang="en"
                      label="English"
                      default
                    />
                  ) : null}
                </video>
              ) : null}
            </div>
          </div>
        </dialog>
      ) : null}
    </Ctx.Provider>
  );
}

function PlayGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

/**
 * The full-width frame. It is the same box whether or not there is a
 * film in it: a button when there is, an inert frame with an honest
 * label when there is not.
 */
export function TourFrame() {
  const { available, open } = useTour();

  const inner = (
    <>
      <div className="aspect-video w-full bg-surface-lowest">
        {tour.poster ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={tour.poster}
            alt=""
            className="h-full w-full object-cover"
            width={1280}
            height={720}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-full border border-outline text-on-surface-variant"
            >
              <PlayGlyph size={24} />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-outline-variant px-5 py-4 md:px-6">
        <div>
          <p className="t-title text-on-surface">{tour.title}</p>
          <p className="t-body-sm mt-1 max-w-[62ch] text-pretty text-on-surface-variant">
            {tour.blurb}
          </p>
        </div>
        <span className="t-label shrink-0 text-primary">
          {tour.length ? `Play ${tour.length}` : "Play"}
        </span>
      </div>
    </>
  );

  /* Nothing, rather than a box announcing that the thing does not exist.
     A section that promises to show you the product and then shows you a
     "being filmed" label reads worse than never making the promise. The
     parent section checks this too and skips itself entirely. */
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Play the tour: ${tour.title}`}
      className="mt-10 block w-full border border-outline-variant bg-surface-low text-left transition-colors duration-150 ease-[var(--ease-standard)] hover:border-outline hover:bg-surface-container"
    >
      {inner}
    </button>
  );
}
