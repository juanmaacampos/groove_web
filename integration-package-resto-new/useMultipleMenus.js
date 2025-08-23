/**
 * 🎯 HOOKS PARA MÚLTIPLES MENÚS
 * Hooks de React para manejar múltiples menús dentro de un negocio
 */
import { useState, useEffect } from 'react';
import { getTerminology } from './config.js';

/**
 * 📋 Hook para gestionar múltiples menús
 */
export function useMultipleMenus(menuSDK) {
  const [menus, setMenus] = useState([]);
  const [currentMenuId, setCurrentMenuId] = useState(null);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);

  // Cargar menús disponibles
  useEffect(() => {
    if (!menuSDK) return;

    let unsubscribeMenus = null;
    let unsubscribeBusiness = null;

    const setupListeners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar información del negocio
        const business = await menuSDK.getBusinessInfo();
        setBusinessInfo(business);

        // Suscribirse a cambios en menús
        unsubscribeMenus = menuSDK.onMenusChange((menusData, err) => {
          if (err) {
            setError(`Error al cargar menús: ${err.message}`);
            setLoading(false);
            return;
          }
          
          setMenus(menusData);
          
          // Si no hay menú seleccionado y hay menús disponibles, seleccionar el primero
          if (!currentMenuId && menusData.length > 0) {
            const firstMenu = menusData[0];
            setCurrentMenuId(firstMenu.id);
            menuSDK.switchToMenu(firstMenu.id);
          }
          
          setLoading(false);
        });

        // Suscribirse a cambios en información del negocio
        unsubscribeBusiness = menuSDK.onBusinessInfoChange((businessData) => {
          if (businessData) {
            setBusinessInfo(businessData);
          }
        });

      } catch (err) {
        setError(`Error al inicializar: ${err.message}`);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeMenus) unsubscribeMenus();
      if (unsubscribeBusiness) unsubscribeBusiness();
    };
  }, [menuSDK]);

  // Cargar menú actual cuando cambia el ID
  useEffect(() => {
    if (!menuSDK || !currentMenuId) {
      setCurrentMenu(null);
      return;
    }

    const unsubscribe = menuSDK.onMenuChange(currentMenuId, (menuData, err) => {
      if (err) {
        setError(`Error al cargar menú: ${err.message}`);
        return;
      }
      
      setCurrentMenu(menuData);
    });

    return () => unsubscribe();
  }, [menuSDK, currentMenuId]);

  // Función para cambiar de menú
  const switchToMenu = (menuId) => {
    setCurrentMenuId(menuId);
    menuSDK.switchToMenu(menuId);
  };

  // Obtener información de terminología
  const terminology = businessInfo ? getTerminology(businessInfo.businessType) : getTerminology('restaurant');

  return {
    menus,
    currentMenuId,
    currentMenu,
    businessInfo,
    loading,
    error,
    switchToMenu,
    terminology
  };
}

/**
 * 🛒 Hook para gestionar carrito con soporte para múltiples menús
 */
export function useCartWithMultipleMenus(persistBetweenMenus = true, showMenuOrigin = true) {
  const [cart, setCart] = useState([]);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    if (persistBetweenMenus) {
      const savedCart = localStorage.getItem('multi-menu-cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error al cargar carrito:', error);
        }
      }
    }
  }, [persistBetweenMenus]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (persistBetweenMenus) {
      localStorage.setItem('multi-menu-cart', JSON.stringify(cart));
    }
  }, [cart, persistBetweenMenus]);

  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.item.id === item.id && cartItem.item.menuId === item.menuId
      );

      if (existingItemIndex >= 0) {
        // Si el item ya existe, actualizar cantidad
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Agregar nuevo item
        return [...prevCart, { 
          item: {
            ...item,
            addedAt: new Date().toISOString()
          }, 
          quantity 
        }];
      }
    });
  };

  const removeFromCart = (itemId, menuId = null) => {
    setCart(prevCart => 
      prevCart.filter(cartItem => {
        if (menuId) {
          return !(cartItem.item.id === itemId && cartItem.item.menuId === menuId);
        }
        return cartItem.item.id !== itemId;
      })
    );
  };

  const updateQuantity = (itemId, newQuantity, menuId = null) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, menuId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(cartItem => {
        const matches = menuId 
          ? (cartItem.item.id === itemId && cartItem.item.menuId === menuId)
          : (cartItem.item.id === itemId);
        
        if (matches) {
          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearMenuFromCart = (menuId) => {
    setCart(prevCart => 
      prevCart.filter(cartItem => cartItem.item.menuId !== menuId)
    );
  };

  // Calcular totales
  const cartTotal = cart.reduce((total, cartItem) => {
    return total + (cartItem.item.price * cartItem.quantity);
  }, 0);

  const cartCount = cart.reduce((total, cartItem) => {
    return total + cartItem.quantity;
  }, 0);

  // Agrupar items por menú (si showMenuOrigin está habilitado)
  const cartByMenu = showMenuOrigin ? cart.reduce((groups, cartItem) => {
    const menuId = cartItem.item.menuId || 'unknown';
    const menuName = cartItem.item.menuName || 'Menú sin nombre';
    
    if (!groups[menuId]) {
      groups[menuId] = {
        menuId,
        menuName,
        items: [],
        total: 0
      };
    }
    
    groups[menuId].items.push(cartItem);
    groups[menuId].total += cartItem.item.price * cartItem.quantity;
    
    return groups;
  }, {}) : null;

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearMenuFromCart,
    cartTotal,
    cartCount,
    cartByMenu
  };
}

/**
 * 🎯 Hook para terminología adaptativa
 */
export function useBusinessTerminology(businessType = 'restaurant') {
  return getTerminology(businessType);
}

/**
 * 📜 Hook legacy para compatibilidad con versión anterior
 */
export function useMenu(menuSDK) {
  const [menu, setMenu] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuSDK) return;

    let unsubscribeBusiness = null;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar información del negocio
        const businessInfo = await menuSDK.getBusinessInfo();
        setBusiness(businessInfo);

        // Cargar menú (usando método legacy)
        const menuData = await menuSDK.getFullMenu();
        setMenu(menuData);

        // Suscribirse a cambios del negocio
        unsubscribeBusiness = menuSDK.onBusinessInfoChange((businessData) => {
          if (businessData) {
            setBusiness(businessData);
          }
        });

        setLoading(false);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeBusiness) unsubscribeBusiness();
    };
  }, [menuSDK]);

  // Obtener terminología
  const terminology = business ? getTerminology(business.businessType) : getTerminology('restaurant');

  return {
    menu,
    business,
    loading,
    error,
    terminology
  };
}

/**
 * 🛒 Hook legacy para carrito simple
 */
export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.item.id === item.id);

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { item, quantity }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, cartItem) => {
    return total + (cartItem.item.price * cartItem.quantity);
  }, 0);

  const cartCount = cart.reduce((total, cartItem) => {
    return total + cartItem.quantity;
  }, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount
  };
}
