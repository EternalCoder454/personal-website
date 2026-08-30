import { contact } from "@/lib/site";

export default function Contact() {
  return (
    <section className="card contact" aria-labelledby="contact-label">
      <h2 className="contact__title" id="contact-label">
        {contact.title}
      </h2>
      <div className="contact__actions">
        <a
          className="button button--filled"
          href={contact.primary.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="icon button__icon" aria-hidden="true">
            {contact.primary.icon}
          </span>
          {contact.primary.label}
        </a>

        {contact.email && (
          <a className="button button--tonal" href={`mailto:${contact.email}`}>
            <span className="icon button__icon" aria-hidden="true">
              mail
            </span>
            Email
          </a>
        )}
      </div>
    </section>
  );
}
