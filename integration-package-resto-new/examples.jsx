// Ejemplos de uso del SDK de menú CMS
import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuDisplay, MenuItem, FeaturedItems, CartComponent, AnnouncementsSection } from './MenuComponents.jsx';
import { useMenu, useCart, useAnnouncements } from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import { QuickMercadoPagoTest, MercadoPagoTester } from './MercadoPagoTester.jsx';
import { CheckoutFlow } from './PaymentFlow.jsx';
import { isTestingMode } from './mercadopago-test-config.js';
import './MenuComponents.css';

// ========================================
// EJEMPLO 1: Página completa con menú y carrito
// ========================================
export function RestaurantPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item);
    console.log('Item agregado al carrito:', item.name);
  };

  if (loading) return <div className="menu-loading">🍽️ Cargando menú...</div>;
  if (error) return <div className="menu-error">❌ Error: {error}</div>;

  return (
    <div className="menu-with-cart">
      <div className="menu-section">
        {restaurant && (
          <div className="restaurant-header">
            <h1>{restaurant.name}</h1>
            {restaurant.description && (
              <p className="restaurant-description">{restaurant.description}</p>
            )}
          </div>
        )}

        {/* Sección de anuncios */}
        <AnnouncementsSection menuSDK={menuSDK} />
        
        <MenuDisplay
          menu={menu}
          onAddToCart={handleAddToCart}
          loading={loading}
          error={error}
          showImages={true}
          showPrices={true}
          showDescription={true}
        />
      </div>

      <div className="cart-section">
        <CartComponent
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onClear={clearCart}
          totalPrice={getTotalPrice()}
        />
        
        {/* Agregar componente de checkout si hay items en el carrito */}
        {cart.length > 0 && (
          <CheckoutFlow
            cart={cart}
            cartTotal={getTotalPrice()}
            restaurant={restaurant}
            onOrderComplete={(orderId) => {
              console.log('Pedido completado:', orderId);
              clearCart();
              alert(`¡Pedido ${orderId} enviado correctamente!`);
            }}
          />
        )}
      </div>
      
      {/* Mostrar testing de MercadoPago en modo development */}
      {isTestingMode() && (
        <div className="testing-section" style={{ marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
          <h3>🧪 Testing de MercadoPago</h3>
          <QuickMercadoPagoTest />
        </div>
      )}
    </div>
  );
}

// ========================================
// EJEMPLO 2: Solo platos destacados
// ========================================
export function FeaturedPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const [featuredItems, setFeaturedItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function loadFeatured() {
      try {
        const featured = await menuSDK.getFeaturedItems();
        setFeaturedItems(featured);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadFeatured();
  }, [menuSDK]);

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
    // Aquí integrarías con tu sistema de carrito
  };

  return (
    <div className="menu-display">
      <h2 className="featured-title">🌟 Platos Destacados</h2>
      <FeaturedItems
        featuredItems={featuredItems}
        onAddToCart={handleAddToCart}
        loading={loading}
        error={error}
      />
    </div>
  );
}

// ========================================
// EJEMPLO 3: Menú compacto (sin imágenes)
// ========================================
export function CompactMenu() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { menu, loading, error } = useMenu(menuSDK);

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
    // Aquí puedes integrar con tu propio sistema de carrito
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Nuestro Menú</h2>
      <MenuDisplay
        menu={menu}
        onAddToCart={handleAddToCart}
        loading={loading}
        error={error}
        showImages={false}  // Sin imágenes para vista compacta
        showPrices={true}
        showDescription={false}  // Sin descripciones para vista compacta
      />
    </div>
  );
}

// ========================================
// EJEMPLO 4: Todo-en-uno más simple
// ========================================
export function SimpleRestaurantMenu() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { menu, loading, error } = useMenu(menuSDK);

  if (loading) return <div>Cargando menú...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="menu-display">
      <h1>Nuestro Menú</h1>
      {menu.map(category => (
        <div key={category.id} className="menu-category">
          <h2>{category.name}</h2>
          <div className="menu-items">
            {category.items.map(item => (
              <div key={item.id} className="menu-item">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="item-image" />
                )}
                <div className="item-content">
                  <h3>{item.name} - ${item.price}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// EJEMPLO 5: Solo menú sin carrito
// ========================================
export function MenuOnly() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { menu, loading, error } = useMenu(menuSDK);

  return (
    <MenuDisplay
      menu={menu}
      loading={loading}
      error={error}
      showImages={true}
      showPrices={true}
      showDescription={true}
      // Sin onAddToCart para no mostrar botones
    />
  );
}

// ========================================
// EJEMPLO 6: Testing completo de MercadoPago
// ========================================
export function MercadoPagoTestingPage() {
  return (
    <div className="testing-page">
      <div className="testing-header">
        <h1>🧪 Testing de MercadoPago</h1>
        <p>Página completa para probar la integración con MercadoPago</p>
        
        {isTestingMode() ? (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
            ✅ Modo Testing Activado - Credenciales de prueba detectadas
          </div>
        ) : (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
            ⚠️ Modo Producción - Usa con cuidado
          </div>
        )}
      </div>

      <MercadoPagoTester />
    </div>
  );
}

// ========================================
// EJEMPLO 7: Restaurante con testing integrado
// ========================================
export function RestaurantWithTesting() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item);
    console.log('Item agregado al carrito:', item.name);
  };

  if (loading) return <div className="menu-loading">🍽️ Cargando menú...</div>;
  if (error) return <div className="menu-error">❌ Error: {error}</div>;

  return (
    <div className="restaurant-with-testing">
      <header className="restaurant-header">
        {restaurant && (
          <div>
            <h1>🍽️ {restaurant.name}</h1>
            {restaurant.description && (
              <p className="restaurant-description">{restaurant.description}</p>
            )}
          </div>
        )}
        
        {/* Indicador de testing y controles rápidos */}
        {isTestingMode() && (
          <div className="testing-controls" style={{ 
            background: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '8px', 
            margin: '10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <span>🧪 Modo Testing:</span>
            <QuickMercadoPagoTest />
            <button 
              onClick={() => window.open('mercadopago-testing.html', '_blank')}
              style={{
                padding: '8px 16px',
                background: '#009ee3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🚀 Testing Suite Completo
            </button>
          </div>
        )}
      </header>

      <div className="main-content" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="menu-section" style={{ flex: '1', minWidth: '300px' }}>
          <MenuDisplay
            menu={menu}
            onAddToCart={handleAddToCart}
            loading={loading}
            error={error}
            showImages={true}
            showPrices={true}
            showDescription={true}
          />
        </div>

        <div className="cart-section" style={{ flex: '0 0 350px' }}>
          <CartComponent
            cart={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClear={clearCart}
            totalPrice={getTotalPrice()}
          />
          
          {/* Checkout flow */}
          {cart.length > 0 && (
            <CheckoutFlow
              cart={cart}
              cartTotal={getTotalPrice()}
              restaurant={restaurant}
              onOrderComplete={(orderId) => {
                console.log('✅ Pedido completado:', orderId);
                clearCart();
                alert(`¡Pedido ${orderId} enviado correctamente!`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO: Página solo con anuncios
// ========================================
export function AnnouncementsOnlyPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { announcements, loading, error } = useAnnouncements(menuSDK);

  if (loading) {
    return (
      <div className="announcements-demo">
        <div className="demo-header">
          <h1>🍽️ Promociones y Ofertas</h1>
          <p>Descubre nuestras últimas novedades</p>
        </div>
        <div className="announcements-loading">
          <div className="loading-spinner"></div>
          <p>Cargando promociones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Error loading announcements:', error);
    return (
      <div className="announcements-demo">
        <div className="demo-header">
          <h1>🍽️ Promociones y Ofertas</h1>
          <p>Pronto tendremos nuevas promociones para ti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-demo">
      <div className="demo-header">
        <h1>🍽️ Promociones y Ofertas</h1>
        <p>Descubre nuestras últimas novedades</p>
        {announcements.length > 0 && (
          <small>📢 {announcements.length} promoción(es) activa(s)</small>
        )}
      </div>

      {/* Componente de anuncios */}
      <AnnouncementsSection menuSDK={menuSDK} />

      {announcements.length === 0 && (
        <div className="no-announcements">
          <h3>🎉 ¡Próximamente nuevas promociones!</h3>
          <p>Mantente atento a nuestras redes sociales para no perderte ninguna oferta.</p>
        </div>
      )}
    </div>
  );
}

// ========================================
// EJEMPLO: Hook personalizado de anuncios
// ========================================
export function CustomAnnouncementsDisplay() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { announcements, loading, error, refresh } = useAnnouncements(menuSDK);

  const handleAnnouncementClick = (announcement) => {
    console.log('Anuncio clickeado:', announcement.title);
    
    if (announcement.url) {
      // Analytics o tracking personalizado aquí
      window.gtag && window.gtag('event', 'click_announcement', {
        announcement_id: announcement.id,
        announcement_title: announcement.title,
        destination_url: announcement.url
      });
      
      // Abrir URL
      const url = announcement.url.startsWith('http') ? announcement.url : `https://${announcement.url}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) return <div>Cargando anuncios personalizados...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="custom-announcements">
      <h2>🎯 Implementación personalizada</h2>
      <button onClick={refresh}>🔄 Actualizar anuncios</button>
      
      <div className="custom-announcements-grid">
        {announcements.map(announcement => (
          <div 
            key={announcement.id} 
            className="custom-announcement-card"
            onClick={() => handleAnnouncementClick(announcement)}
            style={{ cursor: announcement.url ? 'pointer' : 'default' }}
          >
            {announcement.images && announcement.images[0] && (
              <img 
                src={announcement.images[0]} 
                alt={announcement.title}
                className="custom-announcement-image"
              />
            )}
            
            <div className="custom-announcement-content">
              <h3>{announcement.title}</h3>
              <p>{announcement.description}</p>
              
              {announcement.badges && announcement.badges.length > 0 && (
                <div className="custom-badges">
                  {announcement.badges.slice(0, 2).map((badge, index) => (
                    <span key={index} className="custom-badge">
                      {badge.text}
                    </span>
                  ))}
                </div>
              )}
              
              {announcement.urlText && (
                <div className="custom-link">
                  {announcement.urlText} →
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Exportar como default el ejemplo principal
export default RestaurantPage;
