/** Consistent section shell: id anchor, vertical rhythm, optional heading. */
export default function Section({ id, eyebrow, title, intro, children, className = '', innerRef }) {
  return (
    <section id={id} ref={innerRef} className={`section-pad relative px-5 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {(eyebrow || title) && (
          <header className="mb-12 max-w-3xl">
            {eyebrow && <p data-reveal className="eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 data-reveal className="text-3xl font-bold sm:text-4xl md:text-5xl">
                <span className="text-gradient">{title}</span>
              </h2>
            )}
            {intro && <p data-reveal className="mt-4 text-base text-text-muted sm:text-lg">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
