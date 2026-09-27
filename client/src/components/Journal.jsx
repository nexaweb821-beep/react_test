import { Label, Lines, Photo } from './ui.jsx';

export default function Journal({ journal }) {
  return (
    <section className="section journal" id="journal" data-theme="dark" aria-labelledby="journal-title">
      <div className="container">
        <div className="grid journal__head">
          <div className="col-label">
            <Label n={7}>Journal</Label>
          </div>
          <div className="col-content journal__head-main">
            <h2 className="h2" id="journal-title" data-lines>
              <Lines lines={['<em>Journal</em>']} />
            </h2>
            <p className="journal__intro" data-reveal>
              {journal.intro}
            </p>
          </div>
        </div>
        <hr className="rule" data-reveal />

        <ol className="journal__list">
          {journal.posts.map((p, i) => (
            <li className="jcard" key={p.title} style={{ '--i': i }}>
              <article className="jcard__inner">
                <a href="#journal" className="jcard__link" aria-label={`${p.title} — ${p.read}`}>
                  <div className="jcard__media">
                    <div className="jcard__zoom">
                      <Photo image={p.image} sizes="(max-width: 900px) 100vw, 55vw" widths={[640, 960, 1400]} w={1200} />
                    </div>
                  </div>
                  <div className="jcard__body">
                    <p className="label jcard__cat">
                      {p.category} <span>·</span> {p.date}
                    </p>
                    <h3 className="jcard__title">{p.title}</h3>
                    <p className="jcard__excerpt">{p.excerpt}</p>
                    <span className="link jcard__more">Read — {p.read}</span>
                  </div>
                </a>
                <div className="jcard__shade" aria-hidden="true" />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
