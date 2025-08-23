// Menu SDK para integración con sitios externos - VERSION MÚLTIPLES MENÚS
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.businessId = businessId;
    this.currentMenuId = null; // Para múltiples menús
  }

  /**
   * 🏪 Obtiene información básica del negocio
   */
  async getBusinessInfo() {
    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (!businessDoc.exists()) {
        throw new Error('Business not found');
      }
      
      return businessDoc.data();
    } catch (error) {
      console.error('Error getting business info:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene todos los menús disponibles del negocio
   */
  async getAvailableMenus() {
    try {
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      const menusQuery = query(menusRef, orderBy('order', 'asc'));
      const menusSnapshot = await getDocs(menusQuery);
      
      const menus = [];
      for (const menuDoc of menusSnapshot.docs) {
        const menuData = {
          id: menuDoc.id,
          ...menuDoc.data()
        };
        
        // Solo incluir menús activos
        if (menuData.active !== false) {
          // Obtener conteo de categorías
          try {
            const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuDoc.id, 'categories');
            const categoriesSnapshot = await getDocs(categoriesRef);
            menuData.categoriesCount = categoriesSnapshot.size;
          } catch (error) {
            menuData.categoriesCount = 0;
          }
          
          menus.push(menuData);
        }
      }
      
      return menus;
    } catch (error) {
      console.error('Error getting available menus:', error);
      throw error;
    }
  }

  /**
   * 🔄 Cambia al menú especificado
   */
  switchToMenu(menuId) {
    this.currentMenuId = menuId;
    console.log(`📋 Cambiado al menú: ${menuId}`);
    return this;
  }

  /**
   * 📋 Obtiene el ID del menú actual
   */
  getCurrentMenuId() {
    return this.currentMenuId;
  }

  /**
   * 🍽️ Obtiene el menú completo de un menú específico (solo items visibles)
   * @param {string} menuId - ID del menú. Si no se proporciona, usa el actual
   */
  async getMenuById(menuId = null) {
    const targetMenuId = menuId || this.currentMenuId;
    
    if (!targetMenuId) {
      throw new Error('No menu ID specified and no current menu set');
    }

    try {
      // Primero verificar que el menú existe y está activo
      const menuRef = doc(this.db, 'businesses', this.businessId, 'menus', targetMenuId);
      const menuDoc = await getDoc(menuRef);
      
      if (!menuDoc.exists()) {
        throw new Error(`Menu ${targetMenuId} not found`);
      }
      
      const menuInfo = menuDoc.data();
      if (menuInfo.active === false) {
        throw new Error(`Menu ${targetMenuId} is not active`);
      }

      // Obtener categorías del menú
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', targetMenuId, 'categories');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const menu = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          menuId: targetMenuId, // Agregar referencia al menú
          menuName: menuInfo.name,
          items: []
        };
        
        // Obtener items de esta categoría
        const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', targetMenuId, 'categories', categoryDoc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        // Filtrar items que no estén ocultos del público
        categoryData.items = itemsSnapshot.docs
          .map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data(),
            categoryId: categoryDoc.id,
            menuId: targetMenuId,
            menuName: menuInfo.name
          }))
          .filter(item => !item.isHidden); // Solo mostrar items no ocultos
        
        // Solo incluir categorías que tengan items visibles
        if (categoryData.items.length > 0) {
          menu.push(categoryData);
        }
      }
      
      return {
        menuInfo,
        categories: menu
      };
    } catch (error) {
      console.error('Error getting menu by ID:', error);
      throw error;
    }
  }

  /**
   * 🍽️ Obtiene el menú completo organizizado por categorías (LEGACY - para compatibilidad)
   * Si hay múltiples menús, devuelve error sugiriendo usar getAvailableMenus()
   */
  async getFullMenu() {
    try {
      // Primero verificar si el negocio usa múltiples menús
      const availableMenus = await this.getAvailableMenus();
      
      if (availableMenus.length > 1) {
        console.warn('⚠️ Este negocio tiene múltiples menús. Usa getAvailableMenus() y getMenuById() en su lugar.');
        
        // Retornar el primer menú como fallback
        if (availableMenus.length > 0) {
          const firstMenu = await this.getMenuById(availableMenus[0].id);
          return firstMenu.categories;
        }
      } else if (availableMenus.length === 1) {
        // Si solo hay un menú, devolverlo directamente
        const singleMenu = await this.getMenuById(availableMenus[0].id);
        return singleMenu.categories;
      }

      // Fallback a estructura legacy (sin menús)
      return await this.getLegacyMenu();
    } catch (error) {
      console.error('Error getting full menu:', error);
      throw error;
    }
  }

  /**
   * 📜 Obtiene menú con estructura legacy (businesses/{id}/menu)
   */
  async getLegacyMenu() {
    try {
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const menu = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        // Obtener items de esta categoría
        const itemsRef = collection(this.db, 'businesses', this.businessId, 'menu', categoryDoc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        // Filtrar items que no estén ocultos del público
        categoryData.items = itemsSnapshot.docs
          .map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }))
          .filter(item => !item.isHidden);
        
        // Solo incluir categorías que tengan items visibles
        if (categoryData.items.length > 0) {
          menu.push(categoryData);
        }
      }
      
      return menu;
    } catch (error) {
      console.error('Error getting legacy menu:', error);
      throw error;
    }
  }

  /**
   * 👂 Escucha cambios en tiempo real de los menús disponibles
   */
  onMenusChange(callback) {
    try {
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      const menusQuery = query(menusRef, orderBy('order', 'asc'));
      
      return onSnapshot(menusQuery, async (snapshot) => {
        const menus = [];
        
        for (const menuDoc of snapshot.docs) {
          const menuData = {
            id: menuDoc.id,
            ...menuDoc.data()
          };
          
          if (menuData.active !== false) {
            // Obtener conteo de categorías
            try {
              const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuDoc.id, 'categories');
              const categoriesSnapshot = await getDocs(categoriesRef);
              menuData.categoriesCount = categoriesSnapshot.size;
            } catch (error) {
              menuData.categoriesCount = 0;
            }
            
            menus.push(menuData);
          }
        }
        
        callback(menus);
      }, (error) => {
        console.error('Error in menus listener:', error);
        callback([], error);
      });
    } catch (error) {
      console.error('Error setting up menus listener:', error);
      throw error;
    }
  }

  /**
   * 👂 Escucha cambios en tiempo real de un menú específico
   */
  onMenuChange(menuId, callback) {
    if (!menuId) {
      throw new Error('Menu ID is required');
    }

    try {
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      
      return onSnapshot(categoriesQuery, async (snapshot) => {
        const menu = [];
        
        // Obtener info del menú
        const menuRef = doc(this.db, 'businesses', this.businessId, 'menus', menuId);
        const menuDoc = await getDoc(menuRef);
        const menuInfo = menuDoc.exists() ? menuDoc.data() : null;
        
        for (const categoryDoc of snapshot.docs) {
          const categoryData = {
            id: categoryDoc.id,
            ...categoryDoc.data(),
            menuId: menuId,
            menuName: menuInfo?.name,
            items: []
          };
          
          // Obtener items de la categoría
          const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories', categoryDoc.id, 'items');
          const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
          const itemsSnapshot = await getDocs(itemsQuery);
          
          categoryData.items = itemsSnapshot.docs
            .map(itemDoc => ({
              id: itemDoc.id,
              ...itemDoc.data(),
              categoryId: categoryDoc.id,
              menuId: menuId,
              menuName: menuInfo?.name
            }))
            .filter(item => !item.isHidden);
          
          if (categoryData.items.length > 0) {
            menu.push(categoryData);
          }
        }
        
        callback({
          menuInfo,
          categories: menu
        });
      }, (error) => {
        console.error('Error in menu listener:', error);
        callback({ menuInfo: null, categories: [] }, error);
      });
    } catch (error) {
      console.error('Error setting up menu listener:', error);
      throw error;
    }
  }

  /**
   * 👂 Escucha cambios en tiempo real de la información del negocio
   */
  onBusinessInfoChange(callback) {
    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      
      return onSnapshot(businessRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error in business info listener:', error);
        callback(null, error);
      });
    } catch (error) {
      console.error('Error setting up business info listener:', error);
      throw error;
    }
  }

  /**
   * 💰 Valida si un item tiene suficiente stock
   */
  validateStock(item, requestedQuantity = 1) {
    if (!item.trackStock || !item.hasStock) {
      return { isValid: true, message: "" };
    }
    
    const available = item.stock || 0;
    const isValid = available >= requestedQuantity;
    
    return {
      isValid,
      message: isValid ? "" : `Solo quedan ${available} unidades disponibles`,
      availableStock: available
    };
  }

  /**
   * 🛒 Valida un carrito completo contra el stock disponible
   */
  async validateCart(cartItems) {
    const errors = [];
    const warnings = [];
    
    for (const cartItem of cartItems) {
      const validation = this.validateStock(cartItem.item, cartItem.quantity);
      if (!validation.isValid) {
        errors.push({
          itemId: cartItem.item.id,
          message: validation.message,
          menuId: cartItem.item.menuId,
          menuName: cartItem.item.menuName
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===== MÉTODOS LEGACY PARA COMPATIBILIDAD =====
  
  /**
   * @deprecated Use getBusinessInfo() instead
   */
  async getRestaurantInfo() {
    return this.getBusinessInfo();
  }
}

/**
 * 🏭 Factory function para crear instancia del SDK
 */
export function createMenuSDK(firebaseConfig, businessId) {
  return new MenuSDK(firebaseConfig, businessId);
}

/**
 * 🎯 Factory function para crear SDK con configuración predefinida
 */
export function createMenuSDKFromConfig(config) {
  return new MenuSDK(config.firebaseConfig, config.businessId);
}
