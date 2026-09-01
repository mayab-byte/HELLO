import { about } from '@/content/site';

export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container about-inner">
        <div className="about-media">
          <img src={about.image.src} alt={about.image.alt} width={900} height={600} loading="lazy" />
        </div>
        <div className="about-text">
          <span className="section-eyebrow">{about.eyebrow}</span>
          <h2 id="about-title" className="section-title">{about.title}</h2>
          {about.paragraphs.map((p, i) => <p key={i} className="about-paragraph">{p}</p>)}
          <ul className="about-list">
            {about.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
