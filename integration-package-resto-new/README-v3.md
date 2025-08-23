# 🍽️ Integration Package Resto v3.0 - Groove Edition

**La versión definitiva del Integration Package, actualizada con todo lo aprendido del proyecto Groove real.**

## 🚀 ¿Qué hay de nuevo en v3.0?

### ✅ Probado en producción
- **Proyecto real**: Implementado y funcionando en el proyecto Groove
- **Business ID real**: `0X2PjjSrO8hZmq2wZtREoKR9gej1` (funcional)
- **Estructura Firebase**: Compatible con `businesses/{id}/menus/{menuId}/categories/{categoryId}/items`

### 🏆 Características principales

#### 📋 Soporte completo para múltiples menús
- ✅ Detección automática de estructura (legacy vs nueva)
- ✅ Múltiples menús por negocio (Ej: "Almuerzo", "Cena", "Bebidas")
- ✅ Fallback inteligente a estructura legacy
- ✅ API unificada que funciona con ambas estructuras

#### 🔄 Real-time updates
- ✅ Información del negocio en tiempo real
- ✅ Actualizaciones automáticas sin recargar página
- ✅ Listeners optimizados con cleanup automático

#### 🎯 Hooks especializados
```javascript
useGrooveMenus()      // Lista de menús disponibles
useMenuCategories()   // Categorías e items de un menú específico
useCart()             // Carrito con validación de stock
useMenuSearch()       // Búsqueda inteligente
```

#### 📱 Diseño responsivo
- ✅ CSS Grid y Flexbox modernos
- ✅ Mobile-first approach
- ✅ Adaptable a cualquier tema

#### 🛒 Gestión de stock avanzada
- ✅ Validación en tiempo real
- ✅ Indicadores visuales de stock
- ✅ Prevención de overselling
- ✅ Alertas de stock bajo

## 📦 Instalación rápida

### 1. Copiar archivos al proyecto
```bash
cp -r integration-package-resto-new/* tu-proyecto/src/groove-menu/
```

### 2. Instalar dependencias
```bash
npm install firebase react
```

### 3. Configuración
```javascript
// src/groove-menu/config.js
export const MENU_CONFIG = {
  firebaseConfig: {
    // Tu configuración de Firebase
  },
  businessId: "TU_BUSINESS_ID_AQUI"
};
```

## 🎯 Uso básico

### Menú simple (compatible con legacy)
```jsx
import { createMenuSDK } from './groove-menu/menu-sdk-v3';
import { useMenu, useCart } from './groove-menu/useMenu-v3';

function RestaurantApp() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { business, menu, loading } = useMenu(menuSDK);
  const { cart, addToCart, cartTotal } = useCart(menuSDK);

  if (loading) return <div>Cargando menú...</div>;

  return (
    <div>
      <h1>{business.name}</h1>
      {menu.map(category => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          {category.items.map(item => (
            <div key={item.id}>
              <h3>{item.name}</h3>
              <p>${item.price}</p>
              <button onClick={() => addToCart(item)}>
                Agregar
              </button>
            </div>
          ))}
        </div>
      ))}
      <div>Total: ${cartTotal}</div>
    </div>
  );
}
```

### Múltiples menús (nueva funcionalidad)
```jsx
import { useGrooveMenus, useMenuCategories } from './groove-menu/useMenu-v3';

function MultiMenuApp() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { menus, loading: menusLoading } = useGrooveMenus(menuSDK);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const { categories, loading: categoriesLoading } = useMenuCategories(menuSDK, selectedMenu);

  if (menusLoading) return <div>Cargando menús...</div>;

  return (
    <div>
      {/* Selector de menús */}
      <div>
        {menus.map(menu => (
          <button 
            key={menu.id} 
            onClick={() => setSelectedMenu(menu.id)}
            className={selectedMenu === menu.id ? 'active' : ''}
          >
            {menu.name}
          </button>
        ))}
      </div>

      {/* Contenido del menú seleccionado */}
      {selectedMenu && !categoriesLoading && (
        <div>
          {categories.map(category => (
            <div key={category.id}>
              <h2>{category.name}</h2>
              {category.items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🛠️ API Reference

### MenuSDK v3.0

#### Métodos principales
```javascript
// Información del negocio
await menuSDK.getBusinessInfo()
menuSDK.onBusinessInfoChange(callback)

// Múltiples menús (nueva funcionalidad)
await menuSDK.getAvailableMenus()      // Lista de menús
await menuSDK.getMenuById(menuId)      // Menú específico

// Legacy (compatible)
await menuSDK.getFullMenu()            // Menú completo
await menuSDK.getFeaturedItems()       // Items destacados
await menuSDK.searchItems(term)        // Búsqueda

// Stock y validaciones
menuSDK.validateStock(item, quantity)
menuSDK.getStockStatus(item)
await menuSDK.validateCart(cartItems)
```

### Hooks v3.0

#### useGrooveMenus(menuSDK)
Obtiene la lista de menús disponibles.
```javascript
const { menus, loading, error } = useGrooveMenus(menuSDK);
// menus: Array de menús disponibles
// loading: boolean de estado de carga
// error: string con error si ocurre
```

#### useMenuCategories(menuSDK, menuType)
Obtiene categorías e items de un menú específico.
```javascript
const { categories, loading, error } = useMenuCategories(menuSDK, 'almuerzo');
// categories: Array de categorías con items
// loading: boolean de estado de carga
// error: string con error si ocurre
```

#### useCart(menuSDK)
Carrito con validación de stock integrada.
```javascript
const { 
  cart, 
  addToCart, 
  removeFromCart, 
  cartTotal, 
  cartCount,
  validationErrors,
  validateCartStock 
} = useCart(menuSDK);
```

## 🏗️ Estructura de archivos

```
integration-package-resto-new/
├── menu-sdk-v3.js          # SDK principal actualizado
├── useMenu-v3.js           # Hooks actualizados
├── config.js               # Configuración con ID real
├── MenuComponents.jsx      # Componentes UI
├── MenuComponents.css      # Estilos responsive
├── PaymentFlow.jsx         # Flujo de pago (opcional)
├── examples/               # Ejemplos de uso
│   ├── basic-usage.jsx
│   ├── multiple-menus.jsx
│   └── advanced-features.jsx
└── README.md               # Este archivo
```

## 🔧 Configuración avanzada

### Firebase estructura esperada
```
businesses/
  {businessId}/
    name: "Nombre del negocio"
    businessType: "restaurant" | "store" | "bakery"
    
    menus/                    # Nueva estructura
      {menuId}/
        name: "Nombre del menú"
        description: "Descripción"
        categories/
          {categoryId}/
            name: "Categoría"
            order: 1
            items/
              {itemId}/
                name: "Producto"
                price: 15.99
                description: "Descripción"
                images: ["url1", "url2"]
                stock: 10
                trackStock: true
                isAvailable: true
                isHidden: false
    
    menu/                     # Estructura legacy (compatible)
      {categoryId}/
        items/
          {itemId}/
```

### Configuración personalizada
```javascript
export const MENU_CONFIG = {
  firebaseConfig: { /* Tu config */ },
  businessId: "tu-business-id",
  
  multipleMenus: {
    enabled: true,
    showMenuSelector: true,
    defaultMenuId: null,
    ui: {
      showMenuDescriptions: true,
      menuCardStyle: "modern",
      categoryAccordion: true,
      showProductImages: true,
      compactMode: false
    }
  },
  
  cart: {
    persistBetweenMenus: true,
    showMenuOrigin: true,
    allowMixedMenus: true,
    stockValidation: true
  },
  
  features: {
    realTimeUpdates: true,
    stockTracking: true,
    searchFunctionality: true,
    featuredItems: true,
    imageGalleries: true
  }
};
```

## 🧪 Testing

### Usar con datos de ejemplo
```javascript
// Usar el business ID de ejemplo (datos reales)
const EXAMPLE_BUSINESS_ID = "0X2PjjSrO8hZmq2wZtREoKR9gej1";

const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, EXAMPLE_BUSINESS_ID);
```

### Verificar conexión
```javascript
async function testConnection() {
  try {
    const businessInfo = await menuSDK.getBusinessInfo();
    console.log('✅ Conectado:', businessInfo.name);
    
    const menus = await menuSDK.getAvailableMenus();
    console.log('📋 Menús disponibles:', menus.length);
    
    if (menus.length > 0) {
      const menuData = await menuSDK.getMenuById(menus[0].id);
      console.log('🍽️ Primer menú:', menuData.name, menuData.categories.length, 'categorías');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

## 🚀 Migración desde versiones anteriores

### Desde v2.x
1. Reemplazar `menu-sdk.js` con `menu-sdk-v3.js`
2. Reemplazar `useMenu.js` con `useMenu-v3.js`
3. Actualizar imports:
```javascript
// Antes
import { useMenu } from './menu-sdk/useMenu';

// Después
import { useMenu } from './groove-menu/useMenu-v3';
```

### Cambios de API
- `getRestaurantInfo()` → `getBusinessInfo()` (compatible)
- Nuevos métodos: `getAvailableMenus()`, `getMenuById()`
- Nuevos hooks: `useGrooveMenus()`, `useMenuCategories()`

## 🤝 Contribución

### Para reportar issues
1. Incluir versión del SDK
2. Describir estructura de Firebase
3. Código mínimo para reproducir
4. Console logs relevantes

### Para proponer mejoras
1. Describir el caso de uso
2. Proponer API si es necesario
3. Considerar retrocompatibilidad

## 📄 License

MIT License - Proyecto Groove Team

---

## 🎯 Casos de uso reales

### Restaurante simple
- Usar `useMenu()` para menú legacy
- Ideal para restaurantes con un solo menú

### Restaurante con múltiples menús
- Usar `useGrooveMenus()` + `useMenuCategories()`
- Ejemplos: Menú almuerzo, cena, bebidas, postres

### Tienda/E-commerce
- Usar terminología de "tienda"
- Tracking de stock activado
- Búsqueda de productos

### Panadería
- Horarios específicos por producto
- Stock limitado por día
- Productos estacionales

**¡El Integration Package v3.0 está listo para producción!** 🚀
