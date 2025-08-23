/**
 * 🎣 HOOKS PARA MENU SDK v3.0 - Basado en la implementación de Groove
 * Hooks de React actualizados con todo lo aprendido del proyecto real
 * 
 * SOPORTE: Estructura legacy y múltiples menús
 * FEATURES: Real-time updates, terminología dinámica, validación de stock
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 📋 Hook principal para usar el menú (compatible con legacy)
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK
 * @returns {Object} - Estado del menú con business info, menú y loading states
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
            setRestaurant(businessData); // Para compatibilidad con código existente
          } else {
            setBusiness(null);
            setRestaurant(null);
            setError('Business not found');
          }
        });

      } catch (err) {
        setError(err.message);
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
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

  return { 
    business, 
    restaurant, // Mantener para compatibilidad
    menu, 
    loading, 
    error 
  };
}

/**
 * 🍽️ Hook para obtener múltiples menús disponibles (nueva funcionalidad)
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK
 * @returns {Object} - Lista de menús disponibles y loading states
 */
export function useGrooveMenus(menuSDK) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK) {
      setLoading(false);
      return;
    }

    async function loadMenus() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🍽️ Loading available menus...');
        const availableMenus = await menuSDK.getAvailableMenus();
        
        if (availableMenus.length === 0) {
          // Fallback a estructura legacy
          const legacyMenu = await menuSDK.getFullMenu();
          if (legacyMenu.length > 0) {
            setMenus([{
              id: 'default',
              name: 'Menú Principal',
              description: 'Menú del restaurante',
              categories: legacyMenu
            }]);
          }
        } else {
          setMenus(availableMenus);
        }
        
        console.log('✅ Menus loaded:', availableMenus.length);
      } catch (err) {
        console.error('❌ Error loading menus:', err);
        setError(err.message || 'Error loading menus');
      } finally {
        setLoading(false);
      }
    }

    loadMenus();
  }, [menuSDK]);

  return { menus, loading, error };
}

/**
 * 🎯 Hook para obtener categorías y items de un menú específico
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK
 * @param {string} menuType - Tipo/ID del menú a cargar
 * @returns {Object} - Categorías e items del menú seleccionado
 */
export function useMenuCategories(menuSDK, menuType) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK || !menuType) {
      setLoading(false);
      return;
    }

    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎯 Loading categories for menu:', menuType);
        
        // Intentar cargar como menú específico
        try {
          const menuData = await menuSDK.getMenuById(menuType);
          setCategories(menuData.categories || []);
          console.log('✅ Categories loaded for menu:', menuType, menuData.categories?.length);
        } catch (menuError) {
          // Fallback: usar getFullMenu si falla getMenuById
          console.log('📝 Fallback to getFullMenu');
          const legacyMenu = await menuSDK.getFullMenu();
          setCategories(legacyMenu);
          console.log('✅ Legacy menu loaded:', legacyMenu.length);
        }
        
      } catch (err) {
        console.error('❌ Error loading categories:', err);
        setError(err.message || 'Error loading categories');
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [menuSDK, menuType]);

  return { categories, loading, error };
}

/**
 * 🛒 Hook para manejar carrito con validación de stock
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK para validar stock
 * @returns {Object} - Estado del carrito y funciones para manipularlo
 */
export function useCart(menuSDK = null) {
  const [cart, setCart] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  const addToCart = useCallback(async (item, quantity = 1) => {
    try {
      // Validar stock si tenemos SDK
      if (menuSDK) {
        const stockValidation = menuSDK.validateStock(item, quantity);
        if (!stockValidation.isValid) {
          console.warn('Stock validation failed:', stockValidation.message);
          setValidationErrors(prev => [...prev, {
            itemId: item.id,
            message: stockValidation.message
          }]);
          return false;
        }
      }

      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex > -1) {
          // Actualizar cantidad del item existente
          const newCart = [...prevCart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantity
          };
          return newCart;
        } else {
          // Agregar nuevo item
          return [...prevCart, {
            ...item,
            quantity: quantity,
            addedAt: new Date().toISOString()
          }];
        }
      });

      // Limpiar errores de validación para este item
      setValidationErrors(prev => prev.filter(error => error.itemId !== item.id));
      
      console.log('✅ Item added to cart:', item.name, 'qty:', quantity);
      return true;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      return false;
    }
  }, [menuSDK]);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    // Limpiar errores de validación para este item
    setValidationErrors(prev => prev.filter(error => error.itemId !== itemId));
    console.log('🗑️ Item removed from cart:', itemId);
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const newCart = prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: quantity }
          : item
      );
      
      // Validar stock para el item actualizado si tenemos SDK
      if (menuSDK) {
        const cartItem = newCart.find(item => item.id === itemId);
        if (cartItem) {
          const stockValidation = menuSDK.validateStock(cartItem, quantity);
          if (!stockValidation.isValid) {
            setValidationErrors(prev => [...prev.filter(e => e.itemId !== itemId), {
              itemId: itemId,
              message: stockValidation.message
            }]);
          } else {
            setValidationErrors(prev => prev.filter(e => e.itemId !== itemId));
          }
        }
      }
      
      return newCart;
    });
    
    console.log('🔄 Cart quantity updated:', itemId, 'new qty:', quantity);
  }, [menuSDK, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setValidationErrors([]);
    console.log('🧹 Cart cleared');
  }, []);

  const validateCartStock = useCallback(async () => {
    if (!menuSDK || cart.length === 0) return { isValid: true, errors: [] };

    try {
      const validation = await menuSDK.validateCart(cart);
      setValidationErrors(validation.errors || []);
      return validation;
    } catch (error) {
      console.error('❌ Error validating cart:', error);
      return { isValid: false, errors: [{ message: 'Error validating cart' }] };
    }
  }, [menuSDK, cart]);

  // Calcular totales
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    validationErrors,
    validateCartStock
  };
}

/**
 * ⭐ Hook para obtener solo platos destacados
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK
 * @returns {Object} - Items destacados y loading states
 */
export function useFeaturedItems(menuSDK) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK) {
      setLoading(false);
      return;
    }

    async function loadFeaturedItems() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('⭐ Loading featured items...');
        const featured = await menuSDK.getFeaturedItems();
        setFeaturedItems(featured);
        console.log('✅ Featured items loaded:', featured.length);
      } catch (err) {
        console.error('❌ Error loading featured items:', err);
        setError(err.message || 'Error loading featured items');
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedItems();
  }, [menuSDK]);

  return { featuredItems, loading, error };
}

/**
 * 🎨 Hook para obtener terminología dinámica basada en el tipo de negocio
 * @param {string} businessType - Tipo de negocio ('restaurant', 'store', etc.)
 * @returns {Object} - Objeto con terminología adaptada
 */
export function useBusinessTerminology(businessType = 'restaurant') {
  const terminology = {
    restaurant: {
      menuSingular: 'menú',
      menuPlural: 'menús',
      itemSingular: 'plato',
      itemPlural: 'platos',
      categorySingular: 'categoría',
      categoryPlural: 'categorías',
      cartName: 'pedido',
      addToCartText: 'Agregar al pedido',
      businessType: 'Restaurante'
    },
    store: {
      menuSingular: 'catálogo',
      menuPlural: 'catálogos',
      itemSingular: 'producto',
      itemPlural: 'productos',
      categorySingular: 'categoría',
      categoryPlural: 'categorías',
      cartName: 'carrito',
      addToCartText: 'Agregar al carrito',
      businessType: 'Tienda'
    },
    bakery: {
      menuSingular: 'menú',
      menuPlural: 'menús',
      itemSingular: 'producto',
      itemPlural: 'productos',
      categorySingular: 'categoría',
      categoryPlural: 'categorías',
      cartName: 'pedido',
      addToCartText: 'Agregar al pedido',
      businessType: 'Panadería'
    }
  };

  return terminology[businessType] || terminology.restaurant;
}

/**
 * 🏪 Hook combinado que incluye menú y terminología automática
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK
 * @returns {Object} - Estado completo del menú con terminología
 */
export function useMenuWithTerminology(menuSDK) {
  const menuState = useMenu(menuSDK);
  const businessType = menuState.business?.businessType || 'restaurant';
  const terminology = useBusinessTerminology(businessType);

  return {
    ...menuState,
    terminology,
    businessType
  };
}

/**
 * 🔍 Hook para búsqueda de items
 * @param {MenuSDK} menuSDK - Instancia del MenuSDK
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Object} - Resultados de búsqueda y estados
 */
export function useMenuSearch(menuSDK, searchTerm) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK || !searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    async function performSearch() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Searching for:', searchTerm);
        const results = await menuSDK.searchItems(searchTerm);
        setSearchResults(results);
        console.log('✅ Search completed:', results.length, 'results');
      } catch (err) {
        console.error('❌ Search error:', err);
        setError(err.message || 'Error searching items');
      } finally {
        setLoading(false);
      }
    }

    const debounceTimer = setTimeout(performSearch, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [menuSDK, searchTerm]);

  return { searchResults, loading, error };
}

// Exports para compatibilidad con versiones anteriores
export { useMenu as useMenuLegacy };
export { useCart as useCartLegacy };
