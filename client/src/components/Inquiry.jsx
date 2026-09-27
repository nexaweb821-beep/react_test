import { useEffect, useRef, useState } from 'react';
import { Button } from './ui.jsx';
import { submitInquiry } from '../lib/content.js';
import { lockScroll, unlockScroll } from '../lib/motion.js';

const BUDGETS = ['< €250k', '€250k – 750k', '€750k – 2M', '> €2M', 'Not sure yet'];
const EMPTY = { name: '', email: '', company: '', budget: '', message: '', website: '' };

export default function Inquiry({ open, onClose, email }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');
  const panelRef = useRef(null);
  const firstRef = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    lockScroll();
    const t = setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 450);

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      // Keep Tab inside the dialog.
      if (e.key === 'Tab') {
        const f = panelRef.current.querySelectorAll('button, input, textarea, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      unlockScroll();
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  // Reset a finished form shortly after closing.
  useEffect(() => {
    if (open || status !== 'sent') return;
    const t = setTimeout(() => {
      setForm(EMPTY);
      setStatus('idle');
    }, 1000);
    return () => clearTimeout(t);
  }, [open, status]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const local = {};
    if (form.name.trim().length < 2) local.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) local.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) local.message = 'A few words about the project, please (10+ characters).';
    if (Object.keys(local).length) {
      setErrors(local);
      panelRef.current.querySelector(`[name="${Object.keys(local)[0]}"]`)?.focus();
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      await submitInquiry(form);
      setStatus('sent');
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(
        err.message === 'Failed to fetch'
          ? `We couldn't reach the studio server. Please email ${email} instead.`
          : err.message,
      );
      setStatus('error');
    }
  };

  const field = (name, label, props = {}) => (
    <div className={`field${errors[name] ? ' has-error' : ''}`}>
      <label htmlFor={`f-${name}`} className="label">
        {label}
      </label>
      {props.as === 'textarea' ? (
        <textarea id={`f-${name}`} name={name} rows={4} value={form[name]} onChange={set(name)} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `f-${name}-err` : undefined} placeholder={props.placeholder} />
      ) : (
        <input ref={props.inputRef} id={`f-${name}`} name={name} type={props.type || 'text'} autoComplete={props.autoComplete} value={form[name]} onChange={set(name)} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `f-${name}-err` : undefined} placeholder={props.placeholder} />
      )}
      {errors[name] && (
        <p className="field__error" id={`f-${name}-err`}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div
      className={`inquiry ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
      aria-hidden={!open}
      inert={open ? undefined : ''}
      ref={panelRef}
      data-theme="dark"
    >
      <div className="inquiry__scroll" data-lenis-prevent>
        <div className="container inquiry__grid">
          <div className="inquiry__side">
            <p className="label">(—) New project</p>
            <h2 className="h2 inquiry__title" id="inquiry-title">
              Tell us about your <em>place</em>.
            </h2>
            <p className="inquiry__lede">
              A few lines is plenty. We read every message ourselves and reply within two working days.
            </p>
            <a className="link meta" href={`mailto:${email}`}>
              Or write to {email}
            </a>
          </div>

          <div className="inquiry__main">
            {status === 'sent' ? (
              <div className="inquiry__done" role="status">
                <p className="h3">
                  Thank you, {form.name.split(' ')[0]}. <em>We'll be in touch.</em>
                </p>
                <p className="meta">Your message has reached the studio. Expect a reply within two working days.</p>
                <Button as="button" type="button" variant="ghost" onClick={onClose}>
                  Back to the site
                </Button>
              </div>
            ) : (
              <form className="inquiry__form" onSubmit={onSubmit} noValidate>
                <div className="inquiry__row">
                  {field('name', 'Your name', { autoComplete: 'name', inputRef: firstRef })}
                  {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
                </div>
                {field('company', 'Company (optional)', { autoComplete: 'organization' })}

                <fieldset className="field budget">
                  <legend className="label">Estimated budget</legend>
                  <div className="budget__opts">
                    {BUDGETS.map((b) => (
                      <label key={b} className={`chip${form.budget === b ? ' is-on' : ''}`}>
                        <input type="radio" name="budget" value={b} checked={form.budget === b} onChange={set('budget')} />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {field('message', 'The project', { as: 'textarea', placeholder: 'Where is it, what is it, and when would you like to begin?' })}

                {/* honeypot */}
                <div className="hp" aria-hidden="true">
                  <label>
                    Website <input tabIndex={-1} name="website" value={form.website} onChange={set('website')} autoComplete="off" />
                  </label>
                </div>

                <div className="inquiry__submit">
                  <Button as="button" type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                  </Button>
                  <p className={`inquiry__msg${status === 'error' ? ' is-error' : ''}`} role="alert">
                    {message}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <button type="button" className="inquiry__close" onClick={onClose}>
        <span>Close</span>
        <span className="inquiry__x" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
    </div>
  );
}
