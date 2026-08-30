"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { socials, isCopySocial, type CopySocial, type LinkSocial } from "@/lib/site";
import SocialIcon from "./SocialIcon";
import { Ripples, useRipples } from "./Ripple";

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // http:// and file:// don't get the async clipboard API
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  if (!ok) throw new Error("copy rejected");
}

function LinkRow({ social }: { social: LinkSocial }) {
  const { drops, onPointerDown, clear } = useRipples();

  return (
    <li>
      <a
        className="list-item"
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={onPointerDown}
      >
        <SocialIcon icon={social.icon} />
        <span className="list-item__text">
          <span className="list-item__headline">{social.name}</span>
          <span className="list-item__supporting">{social.handle}</span>
        </span>
        <span className="list-item__trailing" aria-hidden="true">
          Open
          <span className="icon">open_in_new</span>
        </span>
        <Ripples drops={drops} clear={clear} />
      </a>
    </li>
  );
}

function CopyRow({
  social,
  announce,
}: {
  social: CopySocial;
  announce: (message: string) => void;
}) {
  const { drops, onPointerDown, clear } = useRipples();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    const value = social.copy;

    try {
      await copyText(value);
    } catch {
      announce(`Couldn't copy. The username is ${value}`);
      return;
    }

    announce(`Copied ${value} to your clipboard`);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <li>
      <button
        className="list-item"
        type="button"
        onClick={handleClick}
        onPointerDown={onPointerDown}
        aria-label={`Copy ${social.name} username ${social.copy}`}
      >
        <SocialIcon icon={social.icon} />
        <span className="list-item__text">
          <span className="list-item__headline">{social.name}</span>
          <span className="list-item__supporting">{social.handle}</span>
        </span>
        <span
          className={`list-item__trailing${copied ? " list-item__trailing--done" : ""}`}
          aria-hidden="true"
        >
          {copied ? "Copied" : "Copy"}
          <span className="icon">
            {copied ? "check" : "content_copy"}
          </span>
        </span>
        <Ripples drops={drops} clear={clear} />
      </button>
    </li>
  );
}

export default function Socials() {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const announce = useCallback((text: string) => {
    setMessage(text);
    setOpen(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 4000);
  }, []);

  return (
    <>
      <section className="card card--flush" aria-labelledby="socials-label">
        <h2 className="card__header" id="socials-label">
          Socials
        </h2>
        <ul className="list">
          {socials.map((social) =>
            isCopySocial(social) ? (
              <CopyRow key={social.name} social={social} announce={announce} />
            ) : (
              <LinkRow key={social.name} social={social} />
            )
          )}
        </ul>
      </section>

      <div className={`snackbar${open ? " snackbar--open" : ""}`} role="status" aria-live="polite">
        <span className="snackbar__text">{message}</span>
      </div>
    </>
  );
}
