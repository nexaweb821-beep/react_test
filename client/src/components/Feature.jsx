import { Lines, Photo } from './ui.jsx';

/** Pinned full-bleed image that opens from a small centred frame. */
export default function Feature({ feature }) {
  return (
    <section className="expand" data-theme="dark" aria-label="Featured project">
      <div className="expand__media">
        <Photo image={feature.image} className="expand__img" sizes="100vw" widths={[960, 1400, 2000, 2600]} w={2000} />
        <div className="expand__shade" aria-hidden="true" />
      </div>
      <div className="container expand__caption">
        <p className="label expand__label">{feature.label}</p>
        <p className="h2 expand__statement">
          <Lines lines={feature.lines} />
        </p>
      </div>
    </section>
  );
}
