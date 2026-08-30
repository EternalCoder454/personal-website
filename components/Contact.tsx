"use client";

import { contact } from "@/lib/site";
import { Ripples, useRipples } from "./Ripple";

/* Built from the same list row as Socials rather than a filled button.
   A saturated full-width button was the only block of solid colour on the
   page and sat at 42px against rows of 67-76px, which is what made this
   card read as belonging to a different design. */
function ActionRow({
  icon,
  headline,
  supporting,
  href,
}: {
  icon: string;
  headline: string;
  supporting: string;
  href: string;
}) {
  const { drops, onPointerDown, clear } = useRipples();
  const external = href.startsWith("http");

  return (
    <li>
      <a
        className="list-item"
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onPointerDown={onPointerDown}
      >
        <span className="list-item__leading" aria-hidden="true">
          <span className="icon">{icon}</span>
        </span>
        <span className="list-item__text">
          <span className="list-item__headline">{headline}</span>
          <span className="list-item__supporting">{supporting}</span>
        </span>
        <span className="list-item__trailing" aria-hidden="true">
          {external ? "Open" : "Email"}
          <span className="icon">{external ? "open_in_new" : "mail"}</span>
        </span>
        <Ripples drops={drops} clear={clear} />
      </a>
    </li>
  );
}

export default function Contact() {
  return (
    <section className="card card--flush" aria-labelledby="contact-label">
      <h2 className="card__header" id="contact-label">
        {contact.title}
      </h2>

      <ul className="list">
        <ActionRow
          icon={contact.primary.icon}
          headline={contact.primary.label}
          supporting="Commissions and questions"
          href={contact.primary.href}
        />
        {contact.email && (
          <ActionRow
            icon="mail"
            headline="Email me"
            supporting={contact.email}
            href={`mailto:${contact.email}`}
          />
        )}
      </ul>
    </section>
  );
}
