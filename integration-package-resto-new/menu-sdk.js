/**
 * 🍽️ MENU SDK PARA GROOVE - Integración con Firebase
 * SDK actualizado que soporta tanto estructura legacy como múltiples menús
 * 
 * VERSIÓN: 4.0.0 - Actualizada con lo aprendido del proyecto Groove
 * SOPORTE: Estructura legacy (businesses/{id}/menu) y nueva (businesses/{id}/menus/{menuId})
 * FEATURES: Real-time updates, stock validation, search, multiple menu support
 * PROBADO EN: Groove Web App - Funcional al 100%
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';

export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    // Crear app con timestamp único para evitar conflictos
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.businessId = businessId;
    
    console.log('🔥 MenuSDK initialized for business:', businessId);
    console.log('🔧 Firebase config:', firebaseConfig?.projectId || 'config provided');
  }

  /**
   * 🏢 Obtiene información básica del negocio
   * Compatible con both restaurant y business types
   */
  async getBusinessInfo() {
    try {
      console.log('📋 Getting business info for:', this.businessId);
      
      const businessRef = doc(this.db, 'businesses', this.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (!businessDoc.exists()) {
        throw new Error(`Business not found: ${this.businessId}`);
      }
      
      const data = businessDoc.data();
      console.log('✅ Business info loaded:', data.name || data.businessName);
      
      return data;
    } catch (error) {
      console.error('❌ Error getting business info:', error);
      throw error;
    }
  }

  /**
   * 📢 Obtiene todos los anuncios activos del negocio
   * @param {boolean} featuredOnly - Si es true, solo obtiene anuncios destacados
   * @returns {Promise<Array>} Array de anuncios con imágenes y datos
   */
  async getAnnouncements(featuredOnly = false) {
    try {
      console.log('📢 Getting announcements for business:', this.businessId, featuredOnly ? '(featured only)' : '');
      
      const announcementsRef = collection(this.db, 'businesses', this.businessId, 'announcements');
      let announcementsQuery = query(
        announcementsRef, 
        where('isActive', '==', true)
      );

      if (featuredOnly) {
        announcementsQuery = query(
          announcementsRef,
          where('isActive', '==', true),
          where('isFeatured', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        announcementsQuery = query(
          announcementsRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }
      
      const announcementsSnapshot = await getDocs(announcementsQuery);
      
      const announcements = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Found ${announcements.length} active announcements${featuredOnly ? ' (featured)' : ''}`);
      return announcements;
    } catch (error) {
      console.error('❌ Error getting announcements:', error);
      throw error;
    }
  }

  /**
   * ⭐ Obtiene solo los anuncios destacados activos
   * @returns {Promise<Array>} Array de anuncios destacados
   */
  async getFeaturedAnnouncements() {
    return this.getAnnouncements(true);
  }

  /**
   * 📢 Escucha cambios en tiempo real de los anuncios
   * @param {function} callback - Función que recibe los anuncios actualizados
   * @param {boolean} featuredOnly - Si es true, solo escucha anuncios destacados
   * @returns {function} Función para cancelar la suscripción
   */
  subscribeToAnnouncements(callback, featuredOnly = false) {
    try {
      console.log('👂 Subscribing to announcements for business:', this.businessId, featuredOnly ? '(featured only)' : '');
      
      const announcementsRef = collection(this.db, 'businesses', this.businessId, 'announcements');
      let announcementsQuery;

      if (featuredOnly) {
        announcementsQuery = query(
          announcementsRef,
          where('isActive', '==', true),
          where('isFeatured', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        announcementsQuery = query(
          announcementsRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }
      
      return onSnapshot(announcementsQuery, (snapshot) => {
        const announcements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📢 Announcements updated: ${announcements.length} active${featuredOnly ? ' (featured)' : ''}`);
        callback(announcements);
      });
    } catch (error) {
      console.error('❌ Error subscribing to announcements:', error);
      throw error;
    }
  }

  /**
   * ⭐ Escucha cambios en tiempo real solo de los anuncios destacados
   * @param {function} callback - Función que recibe los anuncios destacados actualizados
   * @returns {function} Función para cancelar la suscripción
   */
  subscribeToFeaturedAnnouncements(callback) {
    return this.subscribeToAnnouncements(callback, true);
  }

  /**
   * 🔄 Escucha cambios en tiempo real de la información del negocio
   * @param {Function} callback - Función que se ejecutará cuando cambie la información
   * @returns {Function} - Función para desuscribirse del listener
   */
  onBusinessInfoChange(callback) {
    try {
      console.log('👂 Setting up real-time listener for business info');
      
      const businessRef = doc(this.db, 'businesses', this.businessId);
      
      return onSnapshot(businessRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log('🔄 Business info updated:', data.name || data.businessName);
          callback(data);
        } else {
          console.log('❌ Business not found in real-time update');
          callback(null);
        }
      }, (error) => {
        console.error('❌ Error in business info listener:', error);
        callback(null, error);
      });
    } catch (error) {
      console.error('❌ Error setting up business info listener:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene múltiples menús disponibles (nueva estructura)
   * Returns list of available menus for businesses with multiple menus
   */
  async getAvailableMenus() {
    try {
      console.log('📋 Getting available menus for business:', this.businessId);
      
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      const menusSnapshot = await getDocs(menusRef);
      
      if (menusSnapshot.empty) {
        console.log('📝 No menus found, trying legacy structure...');
        return [];
      }
      
      const menus = menusSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Found ${menus.length} menus:`, menus.map(m => m.name || m.id));
      
      return menus;
    } catch (error) {
      console.error('❌ Error getting available menus:', error);
      throw error;
    }
  }

  /**
   * 📄 Obtiene un menú específico por su ID con todas sus categorías e items
   * @param {string} menuId - ID del menú a obtener
   */
  async getMenuById(menuId) {
    try {
      console.log('📄 Getting menu by ID:', menuId);
      
      // Obtener información del menú
      const menuRef = doc(this.db, 'businesses', this.businessId, 'menus', menuId);
      const menuDoc = await getDoc(menuRef);
      
      if (!menuDoc.exists()) {
        throw new Error(`Menu not found: ${menuId}`);
      }
      
      const menuInfo = menuDoc.data();
      console.log('📋 Menu info loaded:', menuInfo.name);
      
      // Obtener categorías del menú
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categories = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        // Obtener items de esta categoría
        const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories', categoryDoc.id, 'items');
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
          categories.push(categoryData);
        }
      }
      
      console.log(`✅ Menu loaded with ${categories.length} categories`);
      
      return {
        ...menuInfo,
        id: menuId,
        categories: categories
      };
    } catch (error) {
      console.error('❌ Error getting menu by ID:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene el menú completo (estructura legacy para compatibilidad)
   * Para negocios con estructura antigua: businesses/{id}/menu/{categoryId}/items
   */
  async getFullMenu() {
    try {
      console.log('📋 Getting full menu (legacy structure)');
      
      // Primero intentar la nueva estructura de múltiples menús
      const availableMenus = await this.getAvailableMenus();
      
      if (availableMenus.length > 0) {
        console.log('🔄 Multiple menus detected. Use getAvailableMenus() and getMenuById() instead');
        
        // Si solo hay un menú, devolverlo directamente por compatibilidad
        if (availableMenus.length === 1) {
          const singleMenu = await this.getMenuById(availableMenus[0].id);
          return singleMenu.categories || [];
        }
        
        throw new Error('Multiple menus found. Use getAvailableMenus() to get menu list and getMenuById() to get specific menu');
      }
      
      // Usar estructura legacy
      console.log('📝 Using legacy menu structure');
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
      
      
      console.log(`✅ Legacy menu loaded with ${menu.length} categories`);
      return menu;
    } catch (error) {
      console.error('❌ Error getting full menu:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene información básica del restaurante (alias para compatibilidad)
   * @deprecated Use getBusinessInfo() instead
   */
  async getRestaurantInfo() {
    console.log('⚠️ getRestaurantInfo() is deprecated, use getBusinessInfo() instead');
    return this.getBusinessInfo();
  }

  /**
   * ⭐ Obtiene solo los platos destacados
   * Compatible con ambas estructuras (legacy y múltiples menús)
   */
  async getFeaturedItems() {
    try {
      console.log('⭐ Getting featured items');
      
      // Intentar estructura de múltiples menús primero
      const availableMenus = await this.getAvailableMenus();
      let allCategories = [];
      
      if (availableMenus.length > 0) {
        // Nueva estructura: recorrer todos los menús
        for (const menu of availableMenus) {
          const menuData = await this.getMenuById(menu.id);
          allCategories.push(...(menuData.categories || []));
        }
      } else {
        // Estructura legacy
        allCategories = await this.getFullMenu();
      }
      
      const featuredItems = [];
      
      allCategories.forEach(category => {
        const featured = category.items.filter(item => 
          item.isFeatured && 
          item.isAvailable && 
          !item.isHidden
        );
        featuredItems.push(...featured.map(item => ({
          ...item,
          categoryName: category.name
        })));
      });
      
      console.log(`✅ Found ${featuredItems.length} featured items`);
      return featuredItems;
    } catch (error) {
      console.error('❌ Error getting featured items:', error);
      throw error;
    }
  }

  /**
   * 🔍 Busca items por nombre o descripción
   * Compatible con ambas estructuras
   */
  async searchItems(searchTerm) {
    try {
      console.log('🔍 Searching items for:', searchTerm);
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }
      
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // Intentar estructura de múltiples menús primero
      const availableMenus = await this.getAvailableMenus();
      let allCategories = [];
      
      if (availableMenus.length > 0) {
        for (const menu of availableMenus) {
          const menuData = await this.getMenuById(menu.id);
          allCategories.push(...(menuData.categories || []));
        }
      } else {
        allCategories = await this.getFullMenu();
      }
      
      const searchResults = [];
      
      allCategories.forEach(category => {
        const matchingItems = category.items.filter(item => {
          if (item.isHidden) return false; // Excluir items ocultos
          
          const nameMatch = item.name.toLowerCase().includes(searchTermLower);
          const descriptionMatch = item.description && 
            item.description.toLowerCase().includes(searchTermLower);
          
          return nameMatch || descriptionMatch;
        });
        
        searchResults.push(...matchingItems.map(item => ({
          ...item,
          categoryName: category.name
        })));
      });
      
      console.log(`✅ Found ${searchResults.length} items matching "${searchTerm}"`);
      return searchResults;
    } catch (error) {
      console.error('❌ Error searching items:', error);
      throw error;
    }
  }

  /**
   * Valida si un item tiene suficiente stock
   */
  validateStock(item, requestedQuantity = 1) {
    // Si el item no tiene control de stock, siempre está disponible
    if (!item.trackStock) {
      return {
        isValid: true,
        availableStock: Infinity,
        message: 'Stock ilimitado'
      };
    }

    // Verificar si hay stock suficiente
    const hasStock = item.stock >= requestedQuantity;
    
    return {
      isValid: hasStock && item.isAvailable !== false,
      availableStock: item.stock,
      message: hasStock 
        ? `Stock disponible: ${item.stock}`
        : `Stock insuficiente. Disponible: ${item.stock}`
    };
  }

  /**
   * Obtiene el estado del stock de un item específico
   */
  getStockStatus(item) {
    if (!item.trackStock) {
      return {
        status: 'unlimited',
        level: 'normal',
        message: 'Stock ilimitado',
        cssClass: 'stock-unlimited'
      };
    }

    const stock = item.stock || 0;
    
    if (stock <= 0 || item.isAvailable === false) {
      return {
        status: 'out_of_stock',
        level: 'critical',
        message: 'Sin stock',
        cssClass: 'stock-out'
      };
    }
    
    if (stock <= 5) {
      return {
        status: 'low_stock',
        level: 'warning',
        message: `Últimas ${stock} unidades`,
        cssClass: 'stock-low'
      };
    }
    
    return {
      status: 'in_stock',
      level: 'normal',
      message: `${stock} disponibles`,
      cssClass: 'stock-normal'
    };
  }

  /**
   * Valida un carrito completo contra el stock disponible
   */
  async validateCart(cartItems) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      totalItems: cartItems.length
    };

    // Obtener información actualizada del menú
    const menu = await this.getFullMenu();
    const itemsById = {};
    
    // Crear un índice de items por ID
    menu.forEach(category => {
      category.items.forEach(item => {
        itemsById[item.id] = item;
      });
    });

    // Validar cada item del carrito
    for (const cartItem of cartItems) {
      const menuItem = itemsById[cartItem.id];
      
      if (!menuItem) {
        validation.isValid = false;
        validation.errors.push({
          itemId: cartItem.id,
          message: 'Producto no encontrado'
        });
        continue;
      }

      const stockValidation = this.validateStock(menuItem, cartItem.quantity);
      
      if (!stockValidation.isValid) {
        validation.isValid = false;
        validation.errors.push({
          itemId: cartItem.id,
          itemName: menuItem.name,
          requestedQuantity: cartItem.quantity,
          availableStock: stockValidation.availableStock,
          message: stockValidation.message
        });
      } else if (menuItem.trackStock && menuItem.stock <= 5) {
        validation.warnings.push({
          itemId: cartItem.id,
          itemName: menuItem.name,
          message: `Stock bajo: ${menuItem.stock} disponibles`
        });
      }
    }

    return validation;
  }

  /**
   * Obtiene solo los items disponibles (con stock y no ocultos)
   */
  async getAvailableItems() {
    try {
      const menu = await this.getFullMenu();
      const availableItems = [];
      
      menu.forEach(category => {
        const available = category.items.filter(item => {
          // Si está oculto, no incluirlo
          if (item.isHidden) return false;
          
          // Si no tiene control de stock, siempre está disponible
          if (!item.trackStock) {
            return item.isAvailable !== false;
          }
          
          // Si tiene control de stock, verificar que tenga stock y esté disponible
          return item.stock > 0 && item.isAvailable !== false;
        });
        
        availableItems.push(...available.map(item => ({
          ...item,
          categoryName: category.name,
          categoryId: category.id,
          stockStatus: this.getStockStatus(item)
        })));
      });
      
      return availableItems;
    } catch (error) {
      console.error('Error getting available items:', error);
      throw error;
    }
  }
}

/**
 * Función helper para crear una instancia del SDK
 */
export function createMenuSDK(firebaseConfig, businessId) {
  return new MenuSDK(firebaseConfig, businessId);
}

export default MenuSDK;
