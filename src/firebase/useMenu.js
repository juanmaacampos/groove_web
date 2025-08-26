import { useState, useEffect } from 'react';

/**
 * 🍽️ HOOKS PARA GROOVE - Gestión de menús con Firebase
 */

/**
 * 📋 Hook principal para usar el menú
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
            console.error('Error in business listener:', error);
            setError(error.message);
            return;
          }
          
          setBusiness(businessData);
          setRestaurant(businessData); // Para compatibilidad
        });

      } catch (err) {
        setError(err.message);
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
 * 🛒 Hook para manejar carrito
 */
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
          alert(`Solo hay ${item.stock} unidades disponibles de ${item.name}`);
          return prev;
        }
        
        if (existing) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
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
            alert(`Solo hay ${item.stock} unidades disponibles de ${item.name}`);
            return item;
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

/**
 * ⭐ Hook para solo platos destacados
 */
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

/**
 * 🏢 Hook para terminología dinámica basada en el tipo de negocio
 */
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
          orderType: 'carrito',
          orderTypeCapitalized: 'Carrito',
          addToCart: 'Agregar al Carrito',
          viewCatalog: 'Ver Catálogo',
          viewProducts: 'Ver Productos',
          featuredProducts: 'Productos Destacados',
          allProducts: 'Todos los Productos',
          productDetails: 'Detalles del Producto',
          orderSummary: 'Resumen del Carrito',
          placeOrder: 'Realizar Compra',
          serviceOptions: {
            pickup: 'Retiro en tienda',
            delivery: 'Envío a domicilio'
          }
        };
      }

      // Default: restaurant terminology para Groove
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

/**
 * 🔄 Hook combinado que incluye terminología
 */
export function useMenuWithTerminology(menuSDK) {
  const menuData = useMenu(menuSDK);
  const terminology = useBusinessTerminology(menuData.business?.businessType);

  return {
    ...menuData,
    terminology
  };
}

/**
 * 📢 Hook para gestionar anuncios activos
 * Obtiene anuncios desde Firebase con actualizaciones en tiempo real
 * @param {MenuSDK} menuSDK - Instancia del SDK de menús
 * @returns {Object} - { announcements, loading, error, refresh }
 */
export function useAnnouncements(menuSDK) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK) {
      setLoading(false);
      return;
    }

    let unsubscribe = null;

    const setupSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar si el SDK tiene el método para anuncios
        if (typeof menuSDK.subscribeToAnnouncements === 'function') {
          unsubscribe = menuSDK.subscribeToAnnouncements((announcementsData) => {
            setAnnouncements(announcementsData || []);
            setLoading(false);
            setError(null);
          });
        } else if (typeof menuSDK.getAnnouncements === 'function') {
          // Fallback: carga única sin tiempo real
          const announcementsData = await menuSDK.getAnnouncements();
          setAnnouncements(announcementsData || []);
          setLoading(false);
        } else {
          // El SDK no tiene soporte para anuncios
          setAnnouncements([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('useAnnouncements error:', err);
        setError(err.message);
        setAnnouncements([]);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [menuSDK]);

  const refresh = async () => {
    if (!menuSDK || typeof menuSDK.getAnnouncements !== 'function') return;

    try {
      setLoading(true);
      setError(null);
      const announcementsData = await menuSDK.getAnnouncements();
      setAnnouncements(announcementsData || []);
    } catch (err) {
      console.error('❌ useAnnouncements refresh error:', err);
      setError(err.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    announcements,
    loading,
    error,
    refresh
  };
}
