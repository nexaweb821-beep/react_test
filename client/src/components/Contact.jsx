import { ArrowDiag, Label, Lines } from './ui.jsx';

export function Contact({ contact, onStart }) {
  return (
    <section className="section contact" id="contact" data-theme="dark" aria-labelledby="contact-title">
      <div className="container">
        <Label n={8}>Contact</Label>
        <h2 className="display contact__title" id="contact-title" data-lines>
          <Lines lines={["Let's make", 'something <em>quiet</em>.']} />
        </h2>

        <div className="contact__row">
          <button type="button" className="contact__cta" data-magnetic data-strength="0.4" onClick={onStart}>
            <span className="contact__cta-fill" aria-hidden="true" />
            <span className="contact__cta-inner" data-magnetic-inner>
              <span>Start a project</span>
              <ArrowDiag className="contact__cta-arrow" />
            </span>
          </button>

          <div className="contact__details">
            <div className="contact__col" data-reveal>
              <p className="label">New projects</p>
              <a className="link contact__email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </div>
            {contact.studios.map((s) => (
              <address className="contact__col" key={s.city} data-reveal>
                <p className="label">{s.city} studio</p>
                <p>
                  {s.lines.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </p>
                <a className="link meta" href={`tel:${s.phone.replace(/\s/g, '')}`}>
                  {s.phone}
                </a>
              </address>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ brand, contact }) {
  return (
    <footer className="footer" data-theme="dark">
      <div className="container footer__row">
        <p className="meta">
          © {new Date().getFullYear()} {brand.legal}. All rights reserved.
        </p>
        <ul className="footer__social">
          {contact.social.map((s) => (
            <li key={s.label}>
              <a className="link meta" href={s.href} target="_blank" rel="noreferrer noopener">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#top" className="link meta">
          Back to top
        </a>
      </div>
      <div className="footer__mark" aria-hidden="true">
        <span>{brand.name}</span>
      </div>
    </footer>
  );
}
