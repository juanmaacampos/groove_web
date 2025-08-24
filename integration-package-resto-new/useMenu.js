import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 🎯 HOOKS DE MENÚS GROOVE
 * Custom hooks para integrar Firebase con componentes React de forma eficiente
 * PROBADO EN: Groove Web App - Funcional al 100%
 */

/**
 * Hook para obtener la lista de menús disponibles y mapearlos a la estructura de Groove
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @returns {Object} - { grooveMenus, loading, error, refresh }
 */
export function useGrooveMenus(menuSDK) {
  const [grooveMenus, setGrooveMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasInitialized = useRef(false);

  const refresh = useCallback(async () => {
    if (!menuSDK) return;

    try {
      console.log('🔍 useGrooveMenus: Fetching menus...');
      setLoading(true);
      setError(null);
      
      // Obtener menús disponibles
      const availableMenus = await menuSDK.getAvailableMenus();
      console.log('📋 useGrooveMenus: Available menus:', availableMenus);
      
      // Mapear a estructura de Groove
      const mapped = mapFirebaseMenusToGroove(availableMenus);
      console.log('🎯 useGrooveMenus: Mapped menus:', mapped);
      
      setGrooveMenus(mapped);
    } catch (err) {
      console.error('❌ useGrooveMenus error:', err);
      setError(err.message);
      setGrooveMenus({});
    } finally {
      setLoading(false);
    }
  }, [menuSDK]);

  useEffect(() => {
    if (menuSDK && !hasInitialized.current) {
      hasInitialized.current = true;
      refresh();
    }
  }, [menuSDK, refresh]);

  return { grooveMenus, loading, error, refresh };
}

/**
 * Hook para obtener las categorías e items de un menú específico
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @param {string} menuId - ID del menú a obtener
 * @returns {Object} - { categories, loading, error, refresh }
 */
export function useMenuCategories(menuSDK, menuId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevMenuId = useRef(null);

  const refresh = useCallback(async () => {
    if (!menuSDK || !menuId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 useMenuCategories: Fetching categories for menu:', menuId);
      setLoading(true);
      setError(null);
      
      // Obtener menú completo con categorías e items
      const menuData = await menuSDK.getMenuById(menuId);
      console.log('📋 useMenuCategories: Menu data loaded:', menuData);
      
      setCategories(menuData.categories || []);
    } catch (err) {
      console.error('❌ useMenuCategories error:', err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [menuSDK, menuId]);

  useEffect(() => {
    // Solo hacer fetch si el menuId cambió
    if (menuId !== prevMenuId.current) {
      prevMenuId.current = menuId;
      refresh();
    }
  }, [menuId, refresh]);

  return { categories, loading, error, refresh };
}

/**
 * Hook para búsqueda de items en tiempo real
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} debounceMs - Tiempo de debounce en milisegundos
 * @returns {Object} - { results, loading, error }
 */
export function useMenuSearch(menuSDK, searchTerm, debounceMs = 300) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!menuSDK || !searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);

    // Debounce search
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log('🔍 useMenuSearch: Searching for:', searchTerm);
        const searchResults = await menuSDK.searchItems(searchTerm);
        console.log('✅ useMenuSearch: Found', searchResults.length, 'items');
        
        setResults(searchResults);
        setError(null);
      } catch (err) {
        console.error('❌ useMenuSearch error:', err);
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [menuSDK, searchTerm, debounceMs]);

  return { results, loading, error };
}

/**
 * Hook para validación de carrito en tiempo real
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @param {Array} cartItems - Items del carrito
 * @returns {Object} - { validation, loading, error, validate }
 */
export function useCartValidation(menuSDK, cartItems = []) {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validate = useCallback(async () => {
    if (!menuSDK || cartItems.length === 0) {
      setValidation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const validationResult = await menuSDK.validateCart(cartItems);
      setValidation(validationResult);
      
      console.log('✅ Cart validation completed:', validationResult);
    } catch (err) {
      console.error('❌ Cart validation error:', err);
      setError(err.message);
      setValidation(null);
    } finally {
      setLoading(false);
    }
  }, [menuSDK, cartItems]);

  useEffect(() => {
    validate();
  }, [validate]);

  return { validation, loading, error, validate };
}

/**
 * Hook legacy para compatibilidad con código existente
 * @deprecated Use useGrooveMenus + useMenuCategories instead
 */
export function useMenu(menuSDK) {
  const [business, setBusiness] = useState(null);
  const [restaurant, setRestaurant] = useState(null); // Mantener para compatibilidad
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK) return;

    let unsubscribeBusinessInfo = null;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar menú una vez
        const menuData = await menuSDK.getFullMenu();
        setMenu(menuData);

        // Configurar listener en tiempo real para información del negocio
        unsubscribeBusinessInfo = menuSDK.onBusinessInfoChange((businessData, error) => {
          if (error) {
            setError(error.message);
            console.error('Error in business info listener:', error);
          } else if (businessData) {
            setBusiness(businessData);
            setRestaurant(businessData); // Mantener compatibilidad
          }
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error loading menu data:', err);
      }
    }

    loadData();

    // Cleanup function
    return () => {
      if (unsubscribeBusinessInfo) {
        unsubscribeBusinessInfo();
      }
    };
  }, [menuSDK]);

  return { business, restaurant, menu, loading, error };
}

/**
 * Mapea los menús de Firebase a la estructura de menús dinámicos de Groove
 * @param {Array} firebaseMenus - Lista de menús obtenidos de Firebase
 * @returns {Object} - Menús mapeados con IDs como keys
 */
export function mapFirebaseMenusToGroove(firebaseMenus) {
  const grooveMenus = {};

  // Mapear cada menú de Firebase
  firebaseMenus.forEach(menu => {
    // Usar el ID del menú como key
    const menuKey = menu.id;
    
    grooveMenus[menuKey] = {
      id: menu.id,
      title: menu.name || `Menú ${menu.id}`, // Usar el nombre del menú
      description: menu.description || `Descubre nuestro menú ${menu.name || menu.id}`, // Usar la descripción del menú
      active: menu.active !== false,
      order: menu.order || 0,
      icon: detectMenuIcon(menu.name || ''), // Detectar icono basado en el nombre
      // Mantener toda la data del menú para referencia
      menuData: menu
    };
  });

  console.log('🎯 Mapped Firebase menus to Groove format:', grooveMenus);
  return grooveMenus;
}

/**
 * Detecta el icono apropiado basado en el nombre del menú
 * @param {string} menuName - Nombre del menú
 * @returns {string} - Emoji del icono
 */
function detectMenuIcon(menuName) {
  const name = menuName.toLowerCase();
  
  // Iconos específicos para tipos de menú
  if (name.includes('desayuno') || name.includes('breakfast') || name.includes('café')) return '☕';
  if (name.includes('almuerzo') || name.includes('lunch') || name.includes('comida')) return '🍽️';
  if (name.includes('cena') || name.includes('dinner') || name.includes('noche')) return '🌙';
  if (name.includes('bebida') || name.includes('drink') || name.includes('cocktail')) return '🍹';
  if (name.includes('postre') || name.includes('dessert') || name.includes('dulce')) return '🍰';
  if (name.includes('vegano') || name.includes('vegan') || name.includes('vegetariano')) return '🌱';
  if (name.includes('celiaco') || name.includes('gluten') || name.includes('sin tacc')) return '🌾';
  if (name.includes('infantil') || name.includes('niños') || name.includes('kids')) return '👶';
  if (name.includes('especial') || name.includes('premium') || name.includes('chef')) return '⭐';
  
  // Icono por defecto
  return '📋';
}

/**
 * Hook para obtener items destacados
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @returns {Object} - { featuredItems, loading, error, refresh }
 */
export function useFeaturedItems(menuSDK) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!menuSDK) return;

    try {
      setLoading(true);
      setError(null);
      
      const items = await menuSDK.getFeaturedItems();
      setFeaturedItems(items);
      
      console.log('⭐ Featured items loaded:', items.length);
    } catch (err) {
      console.error('❌ useFeaturedItems error:', err);
      setError(err.message);
      setFeaturedItems([]);
    } finally {
      setLoading(false);
    }
  }, [menuSDK]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { featuredItems, loading, error, refresh };
}

// Exports adicionales para compatibilidad
export default useMenu;

// Hook para manejar carrito
export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity = 1) => {
    // Verificar stock si es una tienda y el item tiene control de stock
    if (item.trackStock && typeof item.stock === 'number') {
      setCart(prev => {
        const existing = prev.find(cartItem => cartItem.id === item.id);
        const currentQuantityInCart = existing ? existing.quantity : 0;
        const newTotalQuantity = currentQuantityInCart + quantity;
        
        // Verificar si hay suficiente stock
        if (newTotalQuantity > item.stock) {
          alert(`Stock insuficiente. Solo quedan ${item.stock} unidades disponibles.`);
          return prev;
        }
        
        if (existing) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: newTotalQuantity }
              : cartItem
          );
        }
        return [...prev, { ...item, quantity }];
      });
    } else {
      // Comportamiento normal para items sin control de stock
      setCart(prev => {
        const existing = prev.find(cartItem => cartItem.id === item.id);
        if (existing) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        }
        return [...prev, { ...item, quantity }];
      });
    }
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          // Verificar stock si el item tiene control de stock
          if (item.trackStock && typeof item.stock === 'number' && quantity > item.stock) {
            alert(`Stock insuficiente. Solo quedan ${item.stock} unidades disponibles.`);
            return item; // No actualizar la cantidad
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  };
}

// Hook para solo platos destacados
export function useFeaturedItems(menuSDK) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        setError(null);
        const items = await menuSDK.getFeaturedItems();
        setFeaturedItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (menuSDK) {
      loadFeatured();
    }
  }, [menuSDK]);

  return { featuredItems, loading, error };
}

// Hook para terminología dinámica basada en el tipo de negocio
export function useBusinessTerminology(businessType) {
  const [terminology, setTerminology] = useState({});

  useEffect(() => {
    const getTerminology = () => {
      if (businessType === 'store') {
        return {
          businessName: 'Tienda',
          menuName: 'catálogo',
          menuNameCapitalized: 'Catálogo',
          itemType: 'producto',
          itemTypeCapitalized: 'Producto',
          itemTypePlural: 'productos',
          itemTypePluralCapitalized: 'Productos',
          itemSingular: 'producto',
          items: 'productos',
          categoryType: 'categoría',
          orderType: 'orden de compra',
          orderTypeCapitalized: 'Orden de Compra',
          addToCart: 'Agregar al Carrito',
          viewCatalog: 'Ver Catálogo',
          viewProducts: 'Ver Productos',
          featuredProducts: 'Productos Destacados',
          allProducts: 'Todos los Productos',
          productDetails: 'Detalles del Producto',
          orderSummary: 'Resumen de Compra',
          placeOrder: 'Realizar Pedido',
          serviceOptions: {
            delivery: 'Envío a domicilio',
            pickup: 'Retiro en tienda',
            shipping: 'Envío postal'
          }
        };
      }

      // Default: restaurant terminology
      return {
        businessName: 'Restaurante',
        menuName: 'menú',
        menuNameCapitalized: 'Menú',
        itemType: 'plato',
        itemTypeCapitalized: 'Plato',
        itemTypePlural: 'platos',
        itemTypePluralCapitalized: 'Platos',
        itemSingular: 'plato',
        items: 'platos',
        categoryType: 'categoría',
        orderType: 'pedido',
        orderTypeCapitalized: 'Pedido',
        addToCart: 'Agregar al Pedido',
        viewCatalog: 'Ver Menú',
        viewProducts: 'Ver Platos',
        featuredProducts: 'Platos Destacados',
        allProducts: 'Todos los Platos',
        productDetails: 'Detalles del Plato',
        orderSummary: 'Resumen del Pedido',
        placeOrder: 'Realizar Pedido',
        serviceOptions: {
          dineIn: 'Comer en el local',
          takeaway: 'Para llevar',
          delivery: 'Delivery'
        }
      };
    };

    setTerminology(getTerminology());
  }, [businessType]);

  return terminology;
}

// Hook combinado que incluye terminología
export function useMenuWithTerminology(menuSDK) {
  const menuData = useMenu(menuSDK);
  const terminology = useBusinessTerminology(menuData.business?.businessType);

  return {
    ...menuData,
    terminology
  };
}

/**
 * Hook para obtener anuncios activos del negocio en tiempo real
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @param {boolean} featuredOnly - Si es true, solo obtiene anuncios destacados
 * @returns {Object} - { announcements, loading, error, refresh }
 */
export function useAnnouncements(menuSDK, featuredOnly = false) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!menuSDK) return;

    try {
      console.log('📢 useAnnouncements: Fetching announcements...', featuredOnly ? '(featured only)' : '');
      setLoading(true);
      setError(null);
      
      const announcementsData = await menuSDK.getAnnouncements(featuredOnly);
      console.log('📢 useAnnouncements: Found announcements:', announcementsData.length, featuredOnly ? '(featured)' : '');
      
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error('❌ useAnnouncements error:', err);
      setError(err.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [menuSDK, featuredOnly]);

  useEffect(() => {
    if (!menuSDK) return;

    // Configurar suscripción en tiempo real
    try {
      console.log('👂 useAnnouncements: Setting up real-time subscription...', featuredOnly ? '(featured only)' : '');
      
      const unsubscribe = menuSDK.subscribeToAnnouncements((announcementsData) => {
        console.log('📢 useAnnouncements: Real-time update:', announcementsData.length, 'announcements', featuredOnly ? '(featured)' : '');
        setAnnouncements(announcementsData);
        setLoading(false);
        setError(null);
      }, featuredOnly);

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          console.log('🔌 useAnnouncements: Cleaning up subscription');
          unsubscribeRef.current();
        }
      };
    } catch (err) {
      console.error('❌ useAnnouncements subscription error:', err);
      setError(err.message);
      setLoading(false);
      
      // Fallback a refresh manual
      refresh();
    }
  }, [menuSDK, featuredOnly, refresh]);

  return {
    announcements,
    loading,
    error,
    refresh
  };
}

/**
 * Hook para obtener solo anuncios destacados en tiempo real
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @returns {Object} - { announcements, loading, error, refresh }
 */
export function useFeaturedAnnouncements(menuSDK) {
  return useAnnouncements(menuSDK, true);
}
