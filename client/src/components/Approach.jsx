import { useEffect, useRef, useState } from 'react';
import { Label, Lines, Photo } from './ui.jsx';

export default function Approach({ steps }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const stepsRef = useRef(null);

  // The step crossing the viewport centre becomes active.
  useEffect(() => {
    const els = stepsRef.current.querySelectorAll('.step');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number(e.target.dataset.step);
          setActive((cur) => {
            if (cur !== i) setPrev(cur);
            return i;
          });
        });
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const total = String(steps.length).padStart(2, '0');

  return (
    <section className="section approach" id="approach" data-theme="dark" aria-labelledby="approach-title">
      <div className="container grid approach__head">
        <div className="col-label">
          <Label n={3}>Approach</Label>
        </div>
        <div className="col-content">
          <h2 className="h2" id="approach-title" data-lines>
            <Lines lines={['Three quiet steps,', 'one <em>careful</em> team.']} />
          </h2>
        </div>
      </div>

      <div className="container approach__grid">
        <ol className="approach__steps" ref={stepsRef}>
          {steps.map((s, i) => (
            <li key={s.title} className={`step${active === i ? ' is-active' : ''}`} data-step={i}>
              <p className="label step__num">
                {String(i + 1).padStart(2, '0')} / {total}
              </p>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
              <figure className="step__media">
                <Photo image={s.image} sizes="100vw" widths={[480, 800, 1200]} w={900} />
              </figure>
            </li>
          ))}
        </ol>

        <div className="approach__aside" aria-hidden="true">
          <div className="approach__sticky">
            <div className="approach__frame">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`approach__img${active === i ? ' is-active' : ''}${prev === i && active !== i ? ' is-prev' : ''}`}
                >
                  <Photo image={s.image} sizes="40vw" widths={[640, 960, 1400]} w={1200} />
                </div>
              ))}
            </div>
            <div className="approach__dashes">
              {steps.map((s, i) => (
                <i key={s.title} className={active === i ? 'is-active' : undefined} />
              ))}
              <span className="meta">{steps[active].title}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
