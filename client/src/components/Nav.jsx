import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './ui.jsx';
import { lockScroll, unlockScroll } from '../lib/motion.js';

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'approach', label: 'Approach' },
  { id: 'studio', label: 'Studio' },
  { id: 'journal', label: 'Journal' },
];

/** Tracks which nav section is in view (runs on IntersectionObserver, no GSAP needed). */
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    // Sections outside the nav set clear the indicator.
    const all = document.querySelectorAll('main > section[id], .footer');
    all.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return ids.includes(active) ? active : null;
}

export default function Nav({ brand, onStart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(LINKS.map((l) => l.id));
  const [hover, setHover] = useState(null);

  const linksRef = useRef(null);
  const indicatorRef = useRef(null);
  const toggleRef = useRef(null);

  /* hide on scroll down, show on scroll up; background after 40px */
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        if (Math.abs(y - last) > 4) {
          setHidden(y > last && y > window.innerHeight * 0.6);
          last = y;
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* underline indicator: follows hover, otherwise returns to the active link */
  useLayoutEffect(() => {
    const place = () => {
      const bar = indicatorRef.current;
      const wrap = linksRef.current;
      if (!bar || !wrap) return;
      const id = hover || active;
      const link = id && wrap.querySelector(`[data-id="${id}"]`);
      if (!link) {
        bar.style.opacity = '0';
        return;
      }
      bar.style.opacity = '1';
      // Indicator is 100px wide; scaleX keeps the motion transform-only.
      bar.style.transform = `translateX(${link.offsetLeft}px) scaleX(${link.offsetWidth / 100})`;
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [hover, active]);

  /* mobile menu: Escape closes, scroll locked while open */
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const cls = ['nav', hidden && !menuOpen && 'is-hidden', scrolled && 'is-scrolled', menuOpen && 'is-open']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={cls}>
        <div className="container nav__bar">
          <a href="#top" className="nav__logo" aria-label={`${brand.name} — back to top`}>
            {brand.name}
            <sup>®</sup>
          </a>

          <nav className="nav__right" aria-label="Primary">
            <ul className="nav__links" ref={linksRef} onMouseLeave={() => setHover(null)}>
              {LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    data-id={l.id}
                    className={active === l.id ? 'is-active' : undefined}
                    aria-current={active === l.id ? 'location' : undefined}
                    onMouseEnter={() => setHover(l.id)}
                    onFocus={() => setHover(l.id)}
                    onBlur={() => setHover(null)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="nav__indicator" ref={indicatorRef} aria-hidden="true" />
            </ul>
            <Button as="button" type="button" variant="ghost" className="nav__cta" onClick={onStart}>
              Start a project
            </Button>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav__toggle-label">
              <span className={menuOpen ? 'is-out' : ''}>Menu</span>
              <span className={menuOpen ? '' : 'is-out'} aria-hidden={!menuOpen}>
                Close
              </span>
            </span>
            <span className="nav__toggle-lines" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`menu ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : ''}
      >
        <div className="container menu__inner">
          <p className="label">Menu</p>
          <ul className="menu__links">
            {LINKS.map((l, i) => (
              <li key={l.id} className="menu__item" style={{ '--i': i }}>
                <a href={`#${l.id}`} onClick={() => setMenuOpen(false)}>
                  <span>{l.label}</span>
                  <sup>0{i + 1}</sup>
                </a>
              </li>
            ))}
            <li className="menu__item" style={{ '--i': LINKS.length }}>
              <a href="#contact" onClick={() => setMenuOpen(false)}>
                <span>
                  Contact<em>.</em>
                </span>
                <sup>0{LINKS.length + 1}</sup>
              </a>
            </li>
          </ul>
          <div className="menu__foot">
            <button
              type="button"
              className="link"
              onClick={() => {
                setMenuOpen(false);
                onStart();
              }}
            >
              Start a project
            </button>
            <span className="meta">
              {brand.cities.join(' — ')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
