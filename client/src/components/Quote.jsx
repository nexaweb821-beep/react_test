import { Label, Photo, Words } from './ui.jsx';

export default function Quote({ quote }) {
  return (
    <section className="section quote" id="words" data-theme="dark" aria-label="Client testimonial">
      <div className="container grid">
        <div className="col-label">
          <Label n={6}>Kind Words</Label>
        </div>
        <figure className="col-content quote__fig">
          <blockquote className="quote__text" data-words>
            <p>
              <Words text={`“${quote.text}”`} />
            </p>
          </blockquote>
          <figcaption className="quote__by" data-reveal>
            <span className="quote__avatar">
              <Photo image={quote.avatar} sizes="56px" widths={[112, 168]} w={168} />
            </span>
            <span>
              <strong>{quote.name}</strong>
              <span className="meta">{quote.project}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
