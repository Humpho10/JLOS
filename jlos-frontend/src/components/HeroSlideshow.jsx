import React, { useEffect, useState } from 'react';

// ============================================================
// Auto-rotating hero background — crossfades between real photos
// from the JLOS institutions instead of one static image. Purely
// decorative background layer: the existing .hero-web::after
// gradient still sits on top of it so hero text stays readable
// against whichever slide is showing.
// ============================================================

const INTERVAL_MS = 5500;

export default function HeroSlideshow({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Force every slide's full-size image to actually decode up front,
  // instead of only whenever its <div> first becomes visible. A
  // background-image on an opacity:0 element still gets *fetched* right
  // away, but the browser can defer the (comparatively expensive) decode
  // of a large photo until the moment it's about to be painted — which is
  // exactly the moment it's due to fade in, so that decode cost showed up
  // as a visible pause before each slide.
  useEffect(() => {
    let cancelled = false;
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.decode?.().catch(() => {
        // Decoding can reject (e.g. the image errors, or the browser
        // doesn't support decode()) — either way there's nothing to do
        // beyond letting the browser fall back to its normal paint path.
        if (cancelled) return;
      });
    });
    return () => { cancelled = true; };
  }, [slides]);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div
      className="hero-slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.credit}
          className={`hero-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          role="img"
          aria-label={slide.alt}
          aria-hidden={i === index ? undefined : true}
        />
      ))}

      <div className="hero-slide-dots" role="tablist" aria-label="Featured institutions">
        {slides.map((slide, i) => (
          <button
            type="button"
            key={slide.credit}
            className={`hero-slide-dot ${i === index ? 'active' : ''}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${slide.credit}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
