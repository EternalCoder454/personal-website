import Link from "next/link";
import type { ReactNode } from "react";

/* Shared shell for the 404 and error screens. */
export default function Message({
  icon,
  title,
  text,
  children,
}: {
  icon: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <main className="content" id="main">
      <section className="card message">
        <span className="icon message__icon" aria-hidden="true">
          {icon}
        </span>
        <h1 className="message__title">{title}</h1>
        <p className="message__text">{text}</p>
        <div className="message__actions">
          {children}
          <Link className="button button--filled" href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
