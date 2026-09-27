import { Label, Lines, Photo, Rich } from './ui.jsx';

export default function Work({ projects }) {
  return (
    <section className="section work" id="work" data-theme="dark" aria-labelledby="work-title">
      <div className="container grid work__head">
        <div className="col-label">
          <Label n={2}>Selected Work</Label>
        </div>
        <div className="col-content work__head-main">
          <h2 className="h2" id="work-title" data-lines>
            <Lines lines={['Selected <em>work</em>']} />
          </h2>
          <p className="meta" data-reveal>
            ({String(projects.length).padStart(2, '0')}) Projects — 2019 / 2025
          </p>
        </div>
      </div>

      <div className="work__pin">
        <div className="work__viewport">
          <ul className="work__track">
            {projects.map((p, i) => (
              <li key={p.name} className={`card card--${p.shape}${p.low ? ' card--low' : ''}`}>
                <a href="#contact" className="card__link" aria-label={`${p.name}, ${p.place}, ${p.year} — enquire about similar work`}>
                  <div className="card__media">
                    <div className="card__zoom">
                      <Photo
                        image={p.image}
                        className="card__img"
                        sizes="(max-width: 900px) 80vw, 45vw"
                        widths={[480, 800, 1200, 1600]}
                        w={1200}
                      />
                    </div>
                  </div>
                  <div className="card__info">
                    <span className="card__index meta">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="card__title">{p.name}</h3>
                    <span className="meta card__meta">
                      {p.type} · {p.place} · {p.year}
                    </span>
                  </div>
                </a>
              </li>
            ))}
            <li className="work__end">
              <p className="h3">
                <Rich text="Every project starts with a <em>conversation</em>." />
              </p>
              <a href="#contact" className="link">
                Tell us about yours
              </a>
            </li>
          </ul>
        </div>
        <div className="container">
          <div className="work__progress" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
