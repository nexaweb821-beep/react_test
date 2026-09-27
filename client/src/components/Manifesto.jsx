import { Label, Words } from './ui.jsx';

export default function Manifesto({ manifesto }) {
  return (
    <section className="section manifesto" id="studio" data-theme="dark" aria-labelledby="studio-label">
      <div className="container grid">
        <div className="col-label">
          <Label n={1}>
            <span id="studio-label">The Studio</span>
          </Label>
        </div>
        <div className="col-content">
          <p className="manifesto__text" data-words>
            <Words text={manifesto.text} />
          </p>
          <hr className="rule" data-reveal />
          <div className="manifesto__foot" data-reveal>
            <p className="manifesto__note">{manifesto.note}</p>
            <a href="#approach" className="link">
              How we work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
