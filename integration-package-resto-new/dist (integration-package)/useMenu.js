import { useState, useEffect } from 'react';

// Hook principal para usar el menú
export function useMenu(menuSDK) {
  const [business, setBusiness] = useState(null);
  const [restaurant, setRestaurant] = useState(null); // Mantener para compatibilidad
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [businessData, menuData] = await Promise.all([
          menuSDK.getBusinessInfo(),
          menuSDK.getFullMenu()
        ]);
        
        setBusiness(businessData);
        setRestaurant(businessData); // Para compatibilidad con código existente
        setMenu(menuData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    }

    if (menuSDK) {
      loadData();
    }
  }, [menuSDK]);

  return { 
    business, 
    restaurant, // Mantener para compatibilidad
    menu, 
    loading, 
    error 
  };
}

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
