import { useState } from 'react';
import { Label } from './ui.jsx';
import { refreshScroll } from '../lib/motion.js';

export default function Services({ services }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="section services" id="services" data-theme="dark" aria-labelledby="services-title">
      <div className="container grid">
        <div className="col-label services__side">
          <Label n={5}>Services</Label>
          <p className="services__note" id="services-title" data-reveal>
            One studio, from the first site visit to the last light switch.
          </p>
        </div>
        <div className="col-content">
          <ul className="acc">
            {services.map((s, i) => {
              const isOpen = open === i;
              const id = `svc-${i}`;
              return (
                <li key={s.title} className={`acc__item${isOpen ? ' is-open' : ''}`} data-reveal>
                  <h3 className="acc__heading">
                    <button
                      type="button"
                      className="acc__btn"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                      id={`${id}-btn`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="acc__num meta">{String(i + 1).padStart(2, '0')}</span>
                      <span className="acc__title">{s.title}</span>
                      <span className="acc__icon" aria-hidden="true">
                        <i />
                        <i />
                      </span>
                    </button>
                  </h3>
                  <div
                    className="acc__panel"
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    inert={isOpen ? undefined : ''}
                    onTransitionEnd={(e) => e.target === e.currentTarget && e.propertyName === 'grid-template-rows' && refreshScroll()}
                  >
                    <div className="acc__clip">
                      <div className="acc__content">
                        <p>{s.text}</p>
                        <ul className="acc__tags">
                          {s.tags.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
