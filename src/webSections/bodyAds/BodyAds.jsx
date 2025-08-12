import React, { useEffect, useRef } from 'react';
import PremiumCard from '../../components/PremiumCard/PremiumCard.jsx';
import './bodyAds.css';

// Temporary images: reusing header images as placeholders until real photos
import headerImg1 from '../../assets/img/eventos.png';
import headerImg2 from '../../assets/img/panaderia.png';

const BodyAds = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Progress: start unfolding when section top reaches ~25% of viewport
      // and finish by the time it reaches the top.
      const raw = 1 - (rect.top - vh * 0.25) / (vh * 0.75);
      const p = Math.max(0, Math.min(1, raw));
      el.style.setProperty('--p', p.toFixed(3));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Initial compute
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="nosotros" ref={sectionRef} className="body-ads" aria-label="Conocé más sobre nosotros">
      <div className="body-ads__inner">
        <div className="stack">
          <div className="stack-item is-first">
            <PremiumCard
              title="Tu evento, con sabor a casa."
              subtitle="Un espacio íntimo y versátil para celebrar como quieras."
              bullets={["Hasta 60 personas", "Casamientos", "Cumpleaños", "Catering propio"]}
              ctaLabel="Habla con nosotros"
              ctaHref="https://www.instagram.com/groove_cafe/" // TODO: add WhatsApp link or internal form
              imageSrc={headerImg1}
              imageAlt="Eventos y mas"
            />
          </div>

          <div className="stack-item is-second">
            <PremiumCard
              title="Panadería artesanal con pasión por la calidad"
              subtitle="Delivery de Lun-Vie hasta las 15 hs. Abierto todos los días de 7:00 a 20:30 hs"
              bullets={["Croissants", "Ideal para eventos", "Tortas"]}
              ctaLabel="Mira más en Instagram"
              ctaHref="https://www.instagram.com/groove_casadepan/" // TODO: route or section
              imageSrc={headerImg2}
              imageAlt="Pan artesano recién horneado"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodyAds;
