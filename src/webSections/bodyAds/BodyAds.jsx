import React, { useEffect, useRef, useState } from 'react';
import PremiumCard from '../../components/PremiumCard/PremiumCard.jsx';
import './bodyAds.css';
import { MenuSDK } from '../../firebase/menuSDK.js';
import { MENU_CONFIG } from '../../firebase/config.js';
import { useAnnouncementsOptimized } from '../../firebase/useMenuOptimized.js';

// Imagen por defecto para anuncios sin imagen
import defaultAnnouncementImg from '../../assets/img/header_img_4.webp';

// Inicializar SDK de Firebase
const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

// Función para validar y normalizar URLs de imágenes
const validateImageUrl = (imageData) => {
  // Si es un string, validar directamente
  if (typeof imageData === 'string') {
    const trimmed = imageData.trim();
    if (trimmed === '') {
      return { valid: false, error: 'URL vacía' };
    }
    
    try {
      new URL(trimmed);
      return { valid: true, url: trimmed };
    } catch (e) {
      if (trimmed.includes('firebase') || trimmed.includes('storage') || trimmed.startsWith('/')) {
        return { valid: true, url: trimmed };
      }
      return { valid: false, error: 'URL string no válida', originalError: e.message };
    }
  }
  
  // Si es un objeto, buscar la URL en las propiedades
  if (typeof imageData === 'object' && imageData !== null) {
    const url = imageData.url || imageData.src || imageData.downloadURL;
    if (url && typeof url === 'string') {
      const trimmed = url.trim();
      if (trimmed === '') {
        return { valid: false, error: 'URL en objeto vacía' };
      }
      
      try {
        new URL(trimmed);
        return { valid: true, url: trimmed };
      } catch (e) {
        return { valid: false, error: 'URL en objeto no válida', originalError: e.message };
      }
    }
    return { valid: false, error: 'Objeto no contiene URL válida' };
  }
  
  return { valid: false, error: 'Tipo de imagen no soportado' };
};

const BodyAds = () => {
  const sectionRef = useRef(null);
  // Usar hook optimizado (reduce lecturas Firebase)
  const { announcements, loading, error } = useAnnouncementsOptimized(menuSDK, {
    enableRealtime: false,   // No necesita tiempo real en esta sección
    cacheOnly: false,       // Permite carga inicial
    maxAge: 10 * 60 * 1000  // Cache por 10 minutos
  });
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});

  // Auto-rotar imágenes para cada anuncio individualmente
  useEffect(() => {
    if (announcements.length === 0) return;

    // Configurar intervalos para cada anuncio con múltiples imágenes
    const intervals = [];

    announcements.forEach((announcement, announcementIndex) => {
      if (!announcement || !announcement.images || announcement.images.length <= 1) {
        return;
      }

      // Solo rotar si hay múltiples imágenes válidas
      const validImages = announcement.images.filter(img => {
        const validation = validateImageUrl(img);
        return validation.valid;
      });

      if (validImages.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentImageIndexes(prev => ({
          ...prev,
          [announcement.id]: ((prev[announcement.id] || 0) + 1) % validImages.length
        }));
      }, 3000 + (announcementIndex * 500)); // Desfase para que no cambien todas al mismo tiempo

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [announcements]);

  // Debug log para ver los anuncios
  useEffect(() => {
    console.log('🔍 BodyAds: Anuncios cargados:', announcements);
    if (announcements.length > 0) {
      announcements.forEach((announcement, index) => {
        console.log(`📋 Anuncio ${index}:`, {
          id: announcement.id,
          title: announcement.title,
          isFeatured: announcement.isFeatured,
          images: announcement.images,
          imagesType: typeof announcement.images,
          hasImages: announcement.images && Array.isArray(announcement.images) && announcement.images.length > 0
        });
      });
    }
  }, [announcements]);

  // Mostrar estado de carga
  if (loading) {
    console.log('⏳ BodyAds: Cargando anuncios...');
  }

  // Mostrar error si existe
  if (error) {
    console.error('❌ BodyAds: Error cargando anuncios:', error);
  }

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

  // Función para manejar click en anuncios con URL
  const handleAnnouncementClick = (url) => {
    if (url && url.trim()) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section 
      id="nosotros" 
      ref={sectionRef} 
      className={`highlights-grid ${announcements.length === 0 ? 'empty-state' : ''}`} 
      aria-label="Conocé más sobre nosotros"
    >
      <div className="highlights-grid__inner">
        <div className="stack">
          {/* Anuncios de Firebase dinámicos - Mostrar todos */}
          {announcements.length > 0 && (() => {
            try {
              return announcements.map((announcement, index) => {
                // Mostrar todas las cards, no solo la actual
                
                // Determinar las imágenes válidas para cada card
                let validImages = [defaultAnnouncementImg]; // Imagen por defecto como fallback
                console.log('🔍 BodyAds: Procesando imágenes del anuncio:', {
                  announcementId: announcement.id,
                  images: announcement.images,
                  imagesType: typeof announcement.images,
                  imagesLength: announcement.images ? announcement.images.length : 0
                });
                
                if (announcement.images && Array.isArray(announcement.images) && announcement.images.length > 0) {
                  // Obtener todas las imágenes válidas
                  const processedImages = [];
                  announcement.images.forEach((img, imgIndex) => {
                    const validation = validateImageUrl(img);
                    console.log(`🖼️ Validando imagen ${imgIndex}:`, img, 'resultado:', validation);
                    if (validation.valid) {
                      processedImages.push(validation.url);
                    }
                  });
                  
                  if (processedImages.length > 0) {
                    validImages = processedImages;
                    console.log(`✅ BodyAds: ${processedImages.length} imágenes válidas encontradas`);
                  } else {
                    console.log('❌ BodyAds: No se encontraron imágenes válidas, usando imagen por defecto');
                  }
                } else {
                  console.log('❌ BodyAds: Sin imágenes o formato inválido, usando imagen por defecto');
                }
                
                console.log('🖼️ BodyAds: Anuncio', announcement.id, 'con', validImages.length, 'imágenes válidas');
                
                // Procesar badges
                console.log('🏷️ Badges raw:', announcement.badges);
                const badges = announcement.badges?.filter(badge => {
                  console.log('🏷️ Procesando badge:', badge, 'tipo:', typeof badge);
                  return badge && typeof badge === 'string' && badge.trim() !== '';
                }) || [];
                console.log('🏷️ Badges procesadas:', badges);
                
                // Asignar clases de stack apropiadas
                let stackClass = 'stack-item';
                if (index === 0) stackClass += ' is-first';
                else if (index === 1) stackClass += ' is-second'; 
                else if (index === 2) stackClass += ' is-third';
                
                // Agregar clase featured si corresponde
                if (announcement.isFeatured) {
                  stackClass += ' featured';
                }
                
                return (
                  <div key={`announcement-${announcement.id}`} className={stackClass}>
                    <PremiumCard
                      title={announcement.title || "Anuncio especial"}
                      subtitle={announcement.description || "Descubre más sobre esta oferta especial"}
                      badges={badges}
                      bullets={[]} // No usamos bullets para anuncios, solo badges
                      isFeatured={announcement.isFeatured || false}
                      ctaLabel={announcement.urlText || "Ver más"}
                      ctaHref={announcement.url || '#'}
                      imageSrc={validImages}
                      imageAlt={announcement.title || "Anuncio"}
                      currentImageIndex={(currentImageIndexes[announcement.id] || 0) % validImages.length}
                    />
                  </div>
                );
              });
            } catch (err) {
              console.error('❌ BodyAds: Error renderizando anuncios:', err);
              return null;
            }
          })()}


          {/* Indicador de carga */}
          {loading && (
            <div className="stack-item is-first">
              <div className="grid-loading">
                <div className="loading-spinner"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BodyAds;
