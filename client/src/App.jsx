import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { loadContent } from './lib/content.js';
import { initMotion, hideCurtain } from './lib/motion.js';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Feature from './components/Feature.jsx';
import Manifesto from './components/Manifesto.jsx';
import Work from './components/Work.jsx';
import Approach from './components/Approach.jsx';
import Numbers from './components/Numbers.jsx';
import Services from './components/Services.jsx';
import Quote from './components/Quote.jsx';
import Journal from './components/Journal.jsx';
import { Contact, Footer } from './components/Contact.jsx';
import Inquiry from './components/Inquiry.jsx';

const THEME_COLOR = { light: '#F1EDE6', dark: '#121110' };

/** Each section declares data-theme; whichever crosses the viewport centre sets the root theme. */
function useSectionTheme(ready) {
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const theme = e.target.dataset.theme;
          if (root.dataset.theme !== theme) {
            root.dataset.theme = theme;
            meta?.setAttribute('content', THEME_COLOR[theme]);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    document.querySelectorAll('main > section[data-theme], .footer').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [ready]);
}

export default function App() {
  const [content, setContent] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    loadContent().then(setContent);
  }, []);

  useSectionTheme(!!content);

  // All GSAP / Lenis work lives in lib/motion.js and runs once the markup exists.
  useLayoutEffect(() => {
    if (!content) return;
    const motion = initMotion();
    if (!motion) hideCurtain();
    return () => motion?.destroy();
  }, [content]);

  const openInquiry = useCallback(() => setInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setInquiryOpen(false), []);

  if (!content) return null;
  const { brand } = content;

  return (
    <>
      <a className="skip" href="#studio">
        Skip to content
      </a>
      <Nav brand={brand} onStart={openInquiry} />
      <main>
        <Hero brand={brand} hero={content.hero} onStart={openInquiry} />
        <Feature feature={content.feature} />
        <Manifesto manifesto={content.manifesto} />
        <Work projects={content.projects} />
        <Approach steps={content.steps} />
        <Numbers stats={content.stats} />
        <Services services={content.services} />
        <Quote quote={content.quote} />
        <Journal journal={content.journal} />
        <Contact contact={content.contact} onStart={openInquiry} />
      </main>
      <Footer brand={brand} contact={content.contact} />
      <Inquiry open={inquiryOpen} onClose={closeInquiry} email={content.contact.email} />
    </>
  );
}
