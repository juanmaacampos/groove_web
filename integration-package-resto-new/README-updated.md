# 🍽️ Integration Package Resto - Groove Firebase SDK

> **VERSIÓN 4.0.0** - Actualizada con los aprendizajes del proyecto Groove Web App  
> **Estado:** ✅ Completamente funcional y probado en producción  
> **Soporte:** Múltiples menús dinámicos + estructura legacy compatible

## 🎯 ¿Qué hace este paquete?

Este paquete permite conectar cualquier sitio web de restaurante con Firebase para tener **menús completamente dinámicos**. Sin más código hardcodeado, sin más actualizar archivos manualmente.

### ✨ Características principales

- 🔥 **Conexión Firebase** completamente configurada
- 📋 **Múltiples menús** (desayuno, almuerzo, cena, etc.)
- 🎠 **Carrusel interactivo** de menús con touch/swipe
- 🔍 **Búsqueda en tiempo real** de platos
- 📦 **Control de stock** inteligente
- 🎨 **Componentes React listos** para usar
- 📱 **Completamente responsive**
- ⚡ **Real-time updates** cuando cambias el menú

## 🚀 Instalación rápida

### 1. Copia los archivos
```bash
# Copia estos archivos a tu proyecto:
menu-sdk.js          # SDK principal de Firebase
useMenu.js           # Custom hooks de React
MenuComponents.jsx   # Componentes visuales
MenuComponents.css   # Estilos
config.js            # Configuración
```

### 2. Instala dependencias
```bash
npm install firebase
```

### 3. Configura Firebase
Edita `config.js` con tus datos:

```javascript
export const MENU_CONFIG = {
  firebaseConfig: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    // ... resto de config
  },
  businessId: "tu-business-id"  // ID de tu restaurante en Firestore
};
```

### 4. Usa en tu React app
```jsx
import React, { useState } from 'react';
import { MenuSlider, MenuDropdown } from './MenuComponents';
import { createMenuSDK } from './menu-sdk';
import { MENU_CONFIG } from './config';

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

  return (
    <div>
      <h1>Nuestros Menús</h1>
      
      {/* Carrusel de menús */}
      <MenuSlider 
        menuSDK={menuSDK}
        onSelect={(menuId) => setSelectedMenu(menuId)}
      />
      
      {/* Vista detallada del menú seleccionado */}
      {selectedMenu && (
        <MenuDropdown
          menuSDK={menuSDK}
          menuType={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
}
```

## 📋 Estructura de datos en Firebase

### Firestore Collections:
```
businesses/
  {businessId}/
    menus/           # ← Aquí van tus menús
      {menuId}/
        name: "Menú Desayuno"
        description: "Empezá tu día con energía"
        active: true
        order: 1
        
        categories/   # ← Categorías del menú
          {categoryId}/
            name: "Cafés"
            order: 1
            
            items/    # ← Platos/productos
              {itemId}/
                name: "Café Americano"
                description: "Café negro intenso"
                price: 2500
                isAvailable: true
                isFeatured: false
                stock: 50
                trackStock: true
                image: "https://..."
```

### Ejemplo de menús múltiples:
- `menu1`: "Desayuno" ☕
- `menu2`: "Almuerzo" 🍽️  
- `menu3`: "Menú Celíaco" 🌾
- `menu4`: "Bebidas" 🍹

## 🎮 Componentes disponibles

### `MenuSlider`
Carrusel interactivo con los menús disponibles:
```jsx
<MenuSlider 
  menuSDK={menuSDK}
  onSelect={(menuId) => console.log('Menú seleccionado:', menuId)}
/>
```

### `MenuDropdown` 
Vista detallada con categorías e items:
```jsx
<MenuDropdown
  menuSDK={menuSDK}
  menuType="menu1"  // ID del menú
  onClose={() => setShowMenu(false)}
/>
```

### `MenuSearch`
Buscador con resultados en tiempo real:
```jsx
<MenuSearch
  menuSDK={menuSDK}
  onItemSelect={(item) => console.log('Item:', item)}
/>
```

## 🔧 Hooks disponibles

### `useGrooveMenus(menuSDK)`
Obtiene la lista de menús disponibles:
```jsx
const { grooveMenus, loading, error } = useGrooveMenus(menuSDK);
```

### `useMenuCategories(menuSDK, menuId)`
Obtiene categorías e items de un menú específico:
```jsx
const { categories, loading, error } = useMenuCategories(menuSDK, 'menu1');
```

### `useMenuSearch(menuSDK, searchTerm)`
Búsqueda en tiempo real:
```jsx
const { results, loading, error } = useMenuSearch(menuSDK, 'café');
```

## 🎨 Personalización de estilos

El CSS usa custom properties que puedes sobrescribir:

```css
:root {
  --groove-primary-color: #your-color;
  --groove-secondary-color: #your-color;
  --groove-border-radius: 8px;
  --groove-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Clases CSS principales:
- `.menu-carousel` - Contenedor del carrusel
- `.carousel-slide` - Cada slide del carrusel  
- `.menu-card` - Tarjeta de menú individual
- `.menu-dropdown` - Vista detallada del menú
- `.category-section` - Sección de categoría
- `.menu-item` - Item individual del menú

## 🔍 Funcionalidades avanzadas

### Control de stock
```javascript
// El SDK detecta automáticamente items sin stock
const stockStatus = menuSDK.getStockStatus(item);
// Retorna: 'in_stock', 'low_stock', 'out_of_stock', 'unlimited'
```

### Validación de carrito
```javascript
const validation = await menuSDK.validateCart(cartItems);
// Verifica stock disponible para todo el carrito
```

### Items destacados
```javascript
const featured = await menuSDK.getFeaturedItems();
// Obtiene todos los platos marcados como destacados
```

### Tiempo real
```javascript
// Los cambios en Firebase se reflejan automáticamente
// Sin necesidad de recargar la página
```

## 📱 Responsive & Mobile

- ✅ Touch/swipe en el carrusel
- ✅ Diseño adaptable mobile-first  
- ✅ Imágenes optimizadas con lazy loading
- ✅ Botones táctiles apropiados

## 🚀 Performance

- ⚡ Carga solo los datos necesarios
- 🔄 Cache inteligente con React hooks
- 📦 Bundle pequeño (solo dependencia: Firebase)
- 🎯 Debounce en búsquedas
- 🖼️ Lazy loading de imágenes

## 🔒 Compatibilidad

### Firebase versions
- ✅ Firebase v9+ (modular SDK)
- ❌ Firebase v8 (legacy) - no soportado

### React versions  
- ✅ React 16.8+ (hooks)
- ✅ React 17
- ✅ React 18+

### Browsers
- ✅ Chrome, Firefox, Safari, Edge modernos
- ✅ iOS Safari, Chrome Mobile
- ❌ IE 11 (no soportado)

## 🛠️ Troubleshooting

### Error: "Business not found"
- Verifica que `businessId` en config.js sea correcto
- Confirma que existe el documento en Firestore

### Error: "No menus found"
- Verifica la estructura: `businesses/{businessId}/menus/`
- Confirma que los menús tengan `active: true`

### Carrusel no funciona
- Verifica que hay más de un menú
- Revisa que MenuComponents.css esté importado

### Búsqueda no funciona
- Confirma que los items tengan `name` y `description`
- Verifica que `isHidden: false` o no exista el campo

## 💡 Ejemplos de uso

### Restaurante simple (1 menú)
El sistema funciona perfectamente con un solo menú también.

### Restaurante múltiples menús
Desayuno, almuerzo, cena, vegano, sin gluten, etc.

### Cafetería con stock
Control automático de disponibilidad de productos.

### Food truck
Menú dinámico que se actualiza según disponibilidad diaria.

## 🤝 Soporte

¿Necesitas ayuda? El código está completamente documentado y probado en producción. Todos los componentes incluyen logs detallados para debug.

### Logs útiles:
```javascript
// Activa logs detallados en desarrollo
localStorage.setItem('groove-debug', 'true');
```

## 📄 Licencia

MIT - Úsalo como quieras, modifícalo, distribúyelo.

---

**🎉 ¡Listo para usar!** - Este paquete está probado y funcionando al 100% en la web de Groove.

*Última actualización: Agosto 2025 - Versión 4.0.0*
