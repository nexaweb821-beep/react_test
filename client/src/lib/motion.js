/**
 * Motion layer: Lenis smooth scroll driving the GSAP ticker, the curtain intro and
 * page transition, and every scroll-driven effect on the page.
 *
 * Everything here is progressive: React renders the final (static) state, and this
 * module only adds motion on top. Reduced motion → nothing here runs.
 * `?nosmooth` disables Lenis (native scroll) for debugging.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const state = { lenis: null, active: false, locks: 0, holds: new Set() };

/* ------------------------------------------------------------------ */
/* Scroll locking (menu, dialog, intro, transitions)                   */
/* ------------------------------------------------------------------ */

function syncLock() {
  document.documentElement.classList.toggle('is-locked', state.locks > 0);
  if (!state.lenis) return;
  if (state.locks > 0 || state.holds.size) state.lenis.stop();
  else state.lenis.start();
}
export function lockScroll() {
  state.locks++;
  syncLock();
}
export function unlockScroll() {
  state.locks = Math.max(0, state.locks - 1);
  syncLock();
}
const hold = (k) => (state.holds.add(k), syncLock());
const release = (k) => (state.holds.delete(k), syncLock());

export function refreshScroll() {
  if (state.active) ScrollTrigger.refresh();
}

export function hideCurtain() {
  document.documentElement.classList.remove('motion');
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Tween clip-path: inset() by interpolating four numbers ourselves.
 * Browsers collapse inset() shorthands (e.g. "inset(0% 27%)"), which breaks
 * GSAP's string interpolation — so we never let GSAP parse the string.
 */
function clipTween(el, from, to, vars = {}) {
  const o = { t: from[0], r: from[1], b: from[2], l: from[3] };
  const apply = () => {
    el.style.clipPath = `inset(${o.t}% ${o.r}% ${o.b}% ${o.l}%)`;
  };
  apply();
  const { onUpdate, ...rest } = vars;
  return gsap.to(o, {
    t: to[0],
    r: to[1],
    b: to[2],
    l: to[3],
    ...rest,
    onUpdate() {
      apply();
      onUpdate?.call(this);
    },
  });
}

/** Masked line reveals for headings (data-lines). */
function lineReveals(scope) {
  scope.querySelectorAll('[data-lines]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('.line > span'),
      // y:0 clears the px offset GSAP would otherwise read from the CSS pre-hide transform.
      { y: 0, yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });
}

/** Batched fade-ups (data-reveal). */
function fadeReveals(scope) {
  const els = scope.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y: 40 });
  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, overwrite: true }),
  });
}

/** Word-by-word scrubbed reveal (data-words). */
function wordReveals(scope) {
  scope.querySelectorAll('[data-words]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('.w'),
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
      },
    );
  });
}

function genericReveals(scope) {
  lineReveals(scope);
  wordReveals(scope);
  fadeReveals(scope);
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function heroSetup(mm) {
  const hero = document.querySelector('.hero');
  const lines = hero.querySelectorAll('.hero__title .line > span');
  const metas = hero.querySelectorAll('[data-hero-meta]');
  const copy = hero.querySelector('[data-hero-fade]');
  const cta = hero.querySelector('[data-hero-cta]');
  const frame = hero.querySelector('.hero__frame');
  const img = hero.querySelector('.hero__img');

  gsap.set(lines, { y: 0, yPercent: 110 });
  gsap.set(metas, { opacity: 0, y: 14 });
  gsap.set([copy, cta], { opacity: 0, y: 24 });
  gsap.set(img, { scale: 1.3 });

  const tl = gsap.timeline({ paused: true });
  tl.to(lines, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09 }, 0)
    .add(clipTween(frame, [100, 0, 0, 0], [0, 0, 0, 0], { duration: 1.35, ease: 'expo.inOut' }), 0.05)
    .to(img, { scale: 1, duration: 1.35, ease: 'expo.inOut' }, 0.05)
    .to(metas, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.35)
    .to(copy, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, 0.55)
    .to(cta, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, 0.7);

  // Scroll-out, desktop only, scrubbed over the hero's height.
  mm.add('(min-width: 901px)', () => {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(hero.querySelector('.hero__title'), { yPercent: -22, ease: 'none', scrollTrigger: st });
    gsap.to(hero.querySelector('.hero__bottom'), { y: -60, opacity: 0.2, ease: 'none', scrollTrigger: st });
    gsap.to(hero.querySelector('.hero__media'), { y: -90, ease: 'none', scrollTrigger: st });
    gsap.to(img, { yPercent: -10, ease: 'none', scrollTrigger: st });
  });

  return tl;
}

function expandSetup(mm) {
  const sec = document.querySelector('.expand');
  const media = sec.querySelector('.expand__media');
  const img = sec.querySelector('.expand__img');
  const shade = sec.querySelector('.expand__shade');
  const label = sec.querySelector('.expand__label');
  const lines = sec.querySelectorAll('.expand__statement .line > span');

  mm.add({ mobile: '(max-width: 900px)', desktop: '(min-width: 901px)' }, (ctx) => {
    const from = ctx.conditions.mobile ? [22, 8, 22, 8] : [16, 27, 16, 27];
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'top top', end: '+=130%', pin: true, scrub: 1, anticipatePin: 1 },
    });
    tl.add(clipTween(media, from, [0, 0, 0, 0], { duration: 1, ease: 'none' }), 0)
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1, ease: 'none' }, 0)
      .fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0.62)
      .fromTo(label, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.74)
      .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 0.3, stagger: 0.06, ease: 'power3.out' }, 0.78);
    return () => {
      media.style.clipPath = '';
    };
  });
}

function workSetup(mm) {
  const sec = document.querySelector('.work');
  const pinEl = sec.querySelector('.work__pin');
  const track = sec.querySelector('.work__track');
  const bar = sec.querySelector('.work__progress i');
  const cards = [...sec.querySelectorAll('.card')];

  mm.add('(min-width: 901px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      onUpdate() {
        bar.style.transform = `scaleX(${this.progress()})`;
      },
      scrollTrigger: {
        trigger: pinEl,
        start: 'center center',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card) => {
      const media = card.querySelector('.card__media');
      const img = card.querySelector('.card__img');
      const initiallyVisible = card.offsetLeft < window.innerWidth * 0.88;

      // Left-to-right clip wipe as the card enters.
      clipTween(media, [0, 100, 0, 0], [0, 0, 0, 0], {
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: initiallyVisible
          ? { trigger: pinEl, start: 'top 72%', once: true }
          : { trigger: card, containerAnimation: tween, start: 'left 88%', once: true },
      });

      // Subtle horizontal parallax inside the frame.
      gsap.fromTo(
        img,
        { xPercent: -10 },
        {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        },
      );
    });

    return () => {
      bar.style.transform = '';
      cards.forEach((c) => (c.querySelector('.card__media').style.clipPath = ''));
    };
  });
}

function approachSetup(mm) {
  const sec = document.querySelector('.approach');
  mm.add('(min-width: 901px)', () => {
    gsap.fromTo(
      sec.querySelector('.approach__frame'),
      { scale: 0.92 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: sec.querySelector('.approach__grid'), start: 'top bottom', end: 'top 25%', scrub: true },
      },
    );
  });
}

function numbersSetup() {
  const sec = document.querySelector('.numbers');
  const nums = [...sec.querySelectorAll('[data-count]')];
  nums.forEach((n) => (n.textContent = '0'));
  ScrollTrigger.create({
    trigger: sec.querySelector('.stats'),
    start: 'top 85%',
    once: true,
    onEnter() {
      nums.forEach((n) => {
        const o = { v: 0 };
        gsap.to(o, {
          v: Number(n.dataset.count),
          duration: 2,
          ease: 'power3.out',
          onUpdate: () => (n.textContent = Math.round(o.v)),
        });
      });
    },
  });
  return () => nums.forEach((n) => (n.textContent = n.dataset.count));
}

function journalSetup(mm) {
  const sec = document.querySelector('.journal');
  const list = sec.querySelector('.journal__list');
  const cards = [...list.querySelectorAll('.jcard')];

  // Sticky cards report their stuck position, so every trigger is measured from the
  // (non-sticky) list plus each card's natural offset in the flow.
  const naturalTop = (i) => {
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    let y = 0;
    for (let k = 0; k < i; k++) y += cards[k].offsetHeight + gap;
    return y;
  };

  cards.forEach((card, i) => {
    clipTween(card.querySelector('.jcard__media'), [0, 0, 100, 0], [0, 0, 0, 0], {
      duration: 1.4,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: list, start: () => `top+=${naturalTop(i)} 85%`, once: true, invalidateOnRefresh: true },
    });
  });

  mm.add('(min-width: 561px)', () => {
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      const next = cards[i + 1];
      gsap
        .timeline({
          scrollTrigger: {
            trigger: list,
            start: () => `top+=${naturalTop(i + 1)} bottom`,
            end: () => `top+=${naturalTop(i + 1)} ${parseFloat(getComputedStyle(next).top) || 0}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(card.querySelector('.jcard__inner'), { scale: 0.93, ease: 'none' }, 0)
        .to(card.querySelector('.jcard__shade'), { opacity: 0.18, ease: 'none' }, 0);
    });
  });
}

function footerSetup() {
  const footer = document.querySelector('.footer');
  gsap.fromTo(
    footer.querySelector('.footer__mark span'),
    { yPercent: 70 },
    { yPercent: 0, ease: 'none', scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true } },
  );
}

/* ------------------------------------------------------------------ */
/* Micro-interactions                                                  */
/* ------------------------------------------------------------------ */

function magnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};
  const offs = [];
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const inner = el.querySelector('[data-magnetic-inner]');
    const strength = parseFloat(el.dataset.strength) || 0.3;
    const q = { duration: 0.8, ease: 'power3.out' };
    const xTo = gsap.quickTo(el, 'x', q);
    const yTo = gsap.quickTo(el, 'y', q);
    const ixTo = inner && gsap.quickTo(inner, 'x', q);
    const iyTo = inner && gsap.quickTo(inner, 'y', q);
    let rect = null;

    const enter = () => {
      rect = el.getBoundingClientRect();
      // Remove the current offset so the centre stays stable while it moves.
      rect = { cx: rect.left + rect.width / 2 - gsap.getProperty(el, 'x'), cy: rect.top + rect.height / 2 - gsap.getProperty(el, 'y') };
    };
    const move = (e) => {
      if (!rect) enter();
      const dx = (e.clientX - rect.cx) * strength;
      const dy = (e.clientY - rect.cy) * strength;
      xTo(dx);
      yTo(dy);
      ixTo?.(dx * 0.4);
      iyTo?.(dy * 0.4);
    };
    const leave = () => {
      rect = null;
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    offs.push(() => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });
  return () => offs.forEach((f) => f());
}

/* ------------------------------------------------------------------ */
/* Curtain: intro + page transition                                    */
/* ------------------------------------------------------------------ */

function playIntro(curtain, heroTl) {
  const inner = curtain.querySelector('.curtain__inner');
  const count = curtain.querySelector('#curtain-count');
  const c = { v: 0 };

  hold('intro');
  gsap.set(curtain, { yPercent: 0 });

  return gsap
    .timeline()
    .fromTo(inner.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 })
    .to(c, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => (count.textContent = Math.round(c.v)) }, 0.1)
    .to(inner, { opacity: 0, y: -28, duration: 0.45, ease: 'power2.in' }, '+=0.05')
    .to(curtain, { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, '-=0.15')
    .add(() => heroTl.play(), '-=0.5')
    .add(() => {
      release('intro');
      gsap.set(inner, { opacity: 0, y: 0 });
    });
}

function makeTransition(curtain) {
  let busy = false;
  return (target) => {
    if (busy) return;
    busy = true;
    hold('transition');
    gsap.set(curtain, { yPercent: 100 });
    gsap
      .timeline({
        onComplete() {
          busy = false;
          release('transition');
        },
      })
      .to(curtain, { yPercent: 0, duration: 0.75, ease: 'expo.inOut' })
      .add(() => {
        if (state.lenis) state.lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
        ScrollTrigger.update();
      })
      .to(curtain, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, '+=0.1');
  };
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

export function initMotion() {
  const html = document.documentElement;
  const forced = /[?&]motion\b/.test(location.search); // debug: ignore reduced-motion
  if (!forced && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    html.classList.remove('motion');
    return null;
  }

  try {
    if (forced) Object.assign(window, { __ScrollTrigger: ScrollTrigger, __gsap: gsap });
    window.__motionReady = true;
    clearTimeout(window.__motionSafety);
    html.classList.add('motion');

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const smooth = !new URLSearchParams(location.search).has('nosmooth');
    let tick = null;
    if (smooth) {
      state.lenis = new Lenis({ duration: 1.15, easing: expoOut });
      state.lenis.on('scroll', ScrollTrigger.update);
      tick = (t) => state.lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    state.active = true;

    const curtain = document.getElementById('curtain');
    const cleanups = [];
    const mm = gsap.matchMedia();
    let heroTl;

    // Created in DOM order so ScrollTrigger measures pins before the triggers below them.
    const ctx = gsap.context(() => {
      heroTl = heroSetup(mm);
      expandSetup(mm);
      genericReveals(document.querySelector('.manifesto'));
      genericReveals(document.querySelector('.work'));
      workSetup(mm);
      genericReveals(document.querySelector('.approach'));
      approachSetup(mm);
      genericReveals(document.querySelector('.numbers'));
      cleanups.push(numbersSetup());
      genericReveals(document.querySelector('.services'));
      genericReveals(document.querySelector('.quote'));
      genericReveals(document.querySelector('.journal'));
      journalSetup(mm);
      genericReveals(document.querySelector('.contact'));
      footerSetup();
    });

    cleanups.push(magnetic());

    // In-page anchors: long jumps (or from the mobile menu) use the curtain; short ones glide.
    const transition = makeTransition(curtain);
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const far = Math.abs(target.getBoundingClientRect().top) > window.innerHeight * 2.5;
      if (a.closest('.menu') || far) transition(target);
      else if (state.lenis) state.lenis.scrollTo(target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: 'smooth' });
      if (e.detail === 0) {
        // keyboard activation: move focus along with the scroll
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    };
    document.addEventListener('click', onClick);

    const intro = playIntro(curtain, heroTl);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    if (document.readyState === 'complete') requestAnimationFrame(refresh);
    else window.addEventListener('load', refresh, { once: true });

    return {
      destroy() {
        document.removeEventListener('click', onClick);
        window.removeEventListener('load', refresh);
        cleanups.forEach((f) => f());
        intro.kill();
        mm.revert();
        ctx.revert();
        if (tick) gsap.ticker.remove(tick);
        state.lenis?.destroy();
        state.lenis = null;
        state.active = false;
        state.holds.clear();
      },
    };
  } catch (err) {
    console.error('[motion] disabled:', err);
    html.classList.remove('motion');
    return null;
  }
}
