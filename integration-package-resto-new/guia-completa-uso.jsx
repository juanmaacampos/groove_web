/**
 * 🆕 GUÍA COMPLETA - Uso del Integration Package con Business System
 * Esta guía muestra todas las formas de usar el integration package actualizado
 */

// ==========================================
// 1️⃣ CONFIGURACIÓN INICIAL
// ==========================================

// 1.1 Importar el SDK y componentes
import { createMenuSDK } from './menu-sdk.js';
import { 
  MenuDisplay, 
  CategoryNav, 
  FeaturedItems, 
  MenuItem, 
  Cart,
  MenuWithCart 
} from './MenuComponents.jsx';
import { 
  useMenu, 
  useMenuWithTerminology, 
  useCart, 
  useFeaturedItems,
  useBusinessTerminology 
} from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// 1.2 Configurar el SDK (funciona con businessId o restaurantId)
const businessId = MENU_CONFIG.businessId || MENU_CONFIG.restaurantId;
const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, businessId);

// ==========================================
// 2️⃣ EJEMPLOS DE USO BÁSICO
// ==========================================

// 2.1 🚀 OPCIÓN MÁS FÁCIL - Todo incluido con terminología automática
function PaginaModernaCompleta() {
  const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();

  if (loading) return <div>Cargando {terminology.menuName}...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="business-page">
      {/* Header adaptativo */}
      <BusinessHeader business={business} terminology={terminology} />
      
      {/* Navegación de categorías */}
      <CategoryNav categories={menu} terminology={terminology} />
      
      {/* Productos/Platos destacados */}
      <FeaturedItems 
        menu={menu} 
        onAddToCart={addToCart}
        terminology={terminology}
      />
      
      {/* Menú completo */}
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        terminology={terminology}
      />
      
      {/* Carrito flotante */}
      <CartResumen 
        cart={cart} 
        cartTotal={cartTotal}
        cartCount={cartCount}
        onRemoveItem={removeFromCart}
        terminology={terminology}
      />
    </div>
  );
}

// 2.2 🔧 OPCIÓN PERSONALIZABLE - Control total
function PaginaPersonalizada() {
  const { business, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart } = useCart();
  const terminology = useBusinessTerminology(business?.businessType);

  return (
    <div className="mi-diseno-personalizado">
      <h1>Mi {terminology.businessName}</h1>
      
      {/* Solo destacados en la parte superior */}
      <section className="seccion-destacados">
        <FeaturedItems 
          menu={menu}
          onAddToCart={addToCart}
          title={`🌟 ${terminology.featuredProducts}`}
          terminology={terminology}
        />
      </section>
      
      {/* Menú completo con diseño personalizado */}
      <section className="seccion-menu">
        <h2>🔄 {terminology.allProducts}</h2>
        <MenuDisplay 
          menu={menu}
          onAddToCart={addToCart}
          showImages={true}
          terminology={terminology}
        />
      </section>
    </div>
  );
}

// 2.3 ⚡ OPCIÓN SÚPER RÁPIDA - Un solo componente
function PaginaRapida() {
  return (
    <div>
      <h1>Mi Negocio</h1>
      <MenuWithCart 
        menuSDK={menuSDK} 
        terminology={{ /* opcional */ }}
      />
    </div>
  );
}

// ==========================================
// 3️⃣ COMPONENTES AUXILIARES PERSONALIZADOS
// ==========================================

// 3.1 Header adaptativo para cualquier tipo de negocio
function BusinessHeader({ business, terminology }) {
  const isStore = business?.businessType === 'store';
  const icon = isStore ? '🏪' : '🍽️';
  
  return (
    <header className="business-header">
      <h1>{icon} {business?.name}</h1>
      <p className="business-type">{terminology.businessName}</p>
      {business?.address && <p>📍 {business.address}</p>}
      
      {/* Opciones de servicio adaptables */}
      <div className="service-options">
        <h3>{isStore ? '🚚 Opciones de Envío' : '🍽️ Opciones de Servicio'}</h3>
        {Object.entries(business?.serviceOptions || {}).map(([key, enabled]) => {
          if (!enabled) return null;
          const label = terminology.serviceOptions?.[key] || key;
          return <span key={key}>✅ {label}</span>;
        })}
      </div>
    </header>
  );
}

// 3.2 Carrito con resumen inteligente
function CartResumen({ cart, cartTotal, cartCount, onRemoveItem, terminology }) {
  if (cartCount === 0) return null;

  return (
    <div className="cart-flotante">
      <h3>
        {terminology.orderSummary} ({cartCount} {cartCount === 1 ? terminology.itemSingular : terminology.items})
      </h3>
      
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <span>{item.name} x{item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => onRemoveItem(item.id)}>❌</button>
        </div>
      ))}
      
      <div className="cart-total">
        <strong>Total: ${cartTotal.toFixed(2)}</strong>
      </div>
      
      <button className="btn-pedido">
        {terminology.placeOrder} →
      </button>
    </div>
  );
}

// ==========================================
// 4️⃣ MIGRACIÓN DESDE CÓDIGO EXISTENTE
// ==========================================

// 4.1 ✅ ANTES (código existente) - Sigue funcionando igual
function RestauranteExistente() {
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart } = useCart();

  return (
    <div>
      <h1>🍽️ {restaurant?.name}</h1>
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        loading={loading}
        error={error}
      />
    </div>
  );
}

// 4.2 🚀 DESPUÉS (código mejorado) - Con terminología dinámica
function NegocioModerno() {
  const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);
  const { cart, addToCart } = useCart();

  return (
    <div>
      <BusinessHeader business={business} terminology={terminology} />
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        loading={loading}
        error={error}
        terminology={terminology}
      />
    </div>
  );
}

// ==========================================
// 5️⃣ CASOS DE USO ESPECIALES
// ==========================================

// 5.1 Solo productos destacados (para landing page)
function LandingConDestacados() {
  const { menu, loading } = useMenu(menuSDK);
  const { addToCart } = useCart();
  const terminology = useBusinessTerminology('store'); // Forzar tipo store

  return (
    <section className="hero-destacados">
      <h2>🌟 {terminology.featuredProducts}</h2>
      <FeaturedItems 
        menu={menu}
        onAddToCart={addToCart}
        terminology={terminology}
        loading={loading}
      />
    </section>
  );
}

// 5.2 Navegación separada (para sitios con sidebar)
function MenuConNavegacion() {
  const { menu, loading } = useMenu(menuSDK);
  const { addToCart } = useCart();
  
  return (
    <div className="layout-con-sidebar">
      <aside className="sidebar">
        <CategoryNav categories={menu} />
      </aside>
      
      <main className="contenido-principal">
        <MenuDisplay 
          menu={menu}
          onAddToCart={addToCart}
          loading={loading}
        />
      </main>
    </div>
  );
}

// 5.3 Buscar productos (ejemplo avanzado)
function BuscadorProductos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { addToCart } = useCart();
  
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await menuSDK.searchItems(searchTerm);
      setSearchResults(results);
    }
  };

  return (
    <div className="buscador">
      <div className="search-box">
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos..."
        />
        <button onClick={handleSearch}>🔍 Buscar</button>
      </div>
      
      <div className="resultados-busqueda">
        {searchResults.map(item => (
          <MenuItem 
            key={item.id}
            item={item}
            onAddToCart={addToCart}
            showImage={true}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6️⃣ EJEMPLOS DE EXPORTACIÓN
// ==========================================

export default PaginaModernaCompleta;
export { 
  PaginaPersonalizada,
  PaginaRapida,
  RestauranteExistente,
  NegocioModerno,
  LandingConDestacados,
  MenuConNavegacion,
  BuscadorProductos
};
