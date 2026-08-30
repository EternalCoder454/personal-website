import { Clock, TimeZoneChip } from "@/components/Clock";
import Socials from "@/components/Socials";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";
import { profile } from "@/lib/site";

export default function Home() {
  return (
    <main className="content content--split" id="main">
      <div className="column">
        <section className="hero">
          <div className="hero__avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatar} alt={`${profile.name}'s avatar`} width={112} height={112} />
          </div>

          <h1 className="hero__name" id="hero-name">
            {profile.name}
          </h1>
          <p className="hero__supporting">{profile.tagline}</p>

          <div className="chip-set">
            <span className="chip">
              <span className="icon chip__icon" aria-hidden="true">
                public
              </span>
              {profile.location}
            </span>
            <TimeZoneChip />
          </div>
        </section>

        <Socials />
      </div>

      <div className="column">
        <Clock />
        <Skills />
      </div>

      <Footer />
    </main>
  );
}
