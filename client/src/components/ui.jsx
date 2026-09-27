import { img, srcSet } from '../lib/content.js';

/** Split "text <em>word</em> text" into [{text, em}] tokens (content only ever uses <em>). */
function tokens(str) {
  return str
    .split(/(<em>.*?<\/em>)/g)
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^<em>(.*)<\/em>$/);
      return m ? { text: m[1], em: true } : { text: part, em: false };
    });
}

/** Renders a string with its <em> accent word(s). */
export function Rich({ text }) {
  return tokens(text).map((t, i) => (t.em ? <em key={i}>{t.text}</em> : <span key={i}>{t.text}</span>));
}

/** Masked line reveal: each line is .line > span. Pair with data-lines on the heading. */
export function Lines({ lines }) {
  return lines.map((l, i) => (
    <span className="line" key={i}>
      <span>
        <Rich text={l} />
      </span>
    </span>
  ));
}

/** Word-by-word scrub reveal. Splits into .w spans and keeps <em>. */
export function Words({ text }) {
  const out = [];
  tokens(text).forEach((t, ti) => {
    t.text.split(/(\s+)/).forEach((w, wi) => {
      if (!w) return;
      if (/^\s+$/.test(w)) out.push(' ');
      else
        out.push(
          t.em ? (
            <em className="w" key={`${ti}-${wi}`}>
              {w}
            </em>
          ) : (
            <span className="w" key={`${ti}-${wi}`}>
              {w}
            </span>
          ),
        );
    });
  });
  return out;
}

export function Arrow({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowDiag({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M6 18 18 6M8.5 6H18v9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Pill button: accent fill slides up, label rolls to a duplicate (::after attr(data-text)),
 * two stacked arrows swap. Magnetic on fine pointers.
 */
export function Button({ as = 'a', variant = 'primary', children, className = '', magnetic = true, ...rest }) {
  const Tag = as;
  return (
    <Tag
      className={`btn btn--${variant} ${className}`}
      data-magnetic={magnetic ? '' : undefined}
      data-strength={magnetic ? '0.3' : undefined}
      {...rest}
    >
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__inner" data-magnetic-inner>
        <span className="btn__label">
          <span className="btn__text" data-text={children}>
            {children}
          </span>
        </span>
        <span className="btn__icon" aria-hidden="true">
          <Arrow className="btn__arrow btn__arrow--a" />
          <Arrow className="btn__arrow btn__arrow--b" />
        </span>
      </span>
    </Tag>
  );
}

/** Section label in the editorial numbering style: (01) — The Studio */
export function Label({ n, children, className = '' }) {
  return (
    <p className={`label section-label ${className}`}>
      <span className="section-label__n">({String(n).padStart(2, '0')})</span> — {children}
    </p>
  );
}

export function Photo({ image, sizes = '100vw', widths, className = '', eager = false, w = 1400 }) {
  return (
    <img
      className={className}
      src={img(image.id, w)}
      srcSet={srcSet(image.id, widths)}
      sizes={sizes}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={eager ? 'high' : undefined}
    />
  );
}
