import { Label, Lines } from './ui.jsx';

export default function Numbers({ stats }) {
  return (
    <section className="section numbers" id="numbers" data-theme="dark" aria-labelledby="numbers-title">
      <div className="container grid">
        <div className="col-label">
          <Label n={4}>In Numbers</Label>
        </div>
        <div className="col-content">
          <h2 className="h2" id="numbers-title" data-lines>
            <Lines lines={['Fourteen years of', '<em>patient</em> work.']} />
          </h2>
        </div>
      </div>
      <div className="container">
        <dl className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label} data-reveal>
              <dt className="stat__label">{s.label}</dt>
              <dd className="stat__value">
                <span data-count={s.value}>{s.value}</span>
                {s.suffix && <span className="stat__suffix">{s.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
