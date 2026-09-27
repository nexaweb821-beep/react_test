import { Button, Lines, Photo } from './ui.jsx';

export default function Hero({ brand, hero, onStart }) {
  return (
    <section className="hero" id="top" data-theme="dark" aria-label="Introduction">
      <div className="container hero__grid">
        <div className="hero__meta">
          <span className="label" data-hero-meta>
            {brand.discipline} · Est. {brand.founded}
          </span>
          <span className="label hero__meta-mid" data-hero-meta>
            Studio for calm, material-led buildings
          </span>
          <span className="label" data-hero-meta>
            {brand.cities.join(' / ')}
          </span>
        </div>

        <h1 className="display hero__title" aria-label={hero.lines.join(' ').replace(/<\/?em>/g, '')}>
          <span aria-hidden="true">
            <Lines lines={hero.lines} />
          </span>
        </h1>

        <figure className="hero__media">
          <div className="hero__frame">
            <Photo image={hero.image} eager className="hero__img" sizes="(max-width: 900px) 100vw, 34vw" widths={[640, 960, 1400]} />
          </div>
          <figcaption className="meta hero__caption" data-hero-meta>
            {hero.caption}
          </figcaption>
        </figure>

        <div className="hero__bottom">
          <p className="hero__copy" data-hero-fade>
            {hero.copy}
          </p>
          <div className="hero__ctas" data-hero-cta>
            <Button as="button" type="button" onClick={onStart}>
              Start a project
            </Button>
            <a href="#work" className="link">
              View selected work
            </a>
          </div>
        </div>

        <div className="hero__scroll" data-hero-meta aria-hidden="true">
          <span className="label">Scroll</span>
          <span className="hero__scroll-line">
            <i />
          </span>
        </div>
      </div>
    </section>
  );
}
