import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { firebaseCache } from './cache.js';
import { smartListenerManager } from './smartListener.js';

/**
 * 🍽️ MENU SDK OPTIMIZADO PARA GROOVE - Integración con Firebase con Cache
 * SDK para conectar la web de Groove con Firebase minimizando el consumo de cuota
 */
export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.businessId = businessId;
  }

  /**
   * 🏢 Obtiene información básica del negocio (CON CACHE)
   */
  async getBusinessInfo() {
    const cacheKey = firebaseCache.generateKey('businesses', this.businessId);
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (!businessDoc.exists()) {
        throw new Error(`Negocio no encontrado con ID: ${this.businessId}`);
      }
      
      const businessData = businessDoc.data();
      
      // Guardar en cache por 30 minutos
      firebaseCache.set(cacheKey, businessData, 30 * 60 * 1000);
      
      return businessData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔄 Escucha cambios en tiempo real de la información del negocio (OPTIMIZADO)
   * @param {Function} callback - Función que se ejecutará cuando cambie la información
   * @returns {Function} - Función para desuscribirse del listener
   */
  onBusinessInfoChange(callback) {
    const listenerKey = `business-info-${this.businessId}`;
    
    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      
      const unsubscribe = onSnapshot(businessRef, (doc) => {
        // Actualizar uso del listener
        smartListenerManager.updateUsage(listenerKey);
        
        if (doc.exists()) {
          const businessData = doc.data();
          // Actualizar cache cuando lleguen datos en tiempo real
          const cacheKey = firebaseCache.generateKey('businesses', this.businessId);
          firebaseCache.set(cacheKey, businessData, 30 * 60 * 1000);
          
          callback(businessData, null);
        } else {
          callback(null, new Error('Negocio no encontrado'));
        }
      }, (error) => {
        console.error('Error in business listener:', error);
        callback(null, error);
      });
      
      // Registrar el listener para auto-limpieza
      smartListenerManager.registerListener(listenerKey, unsubscribe, {
        autoCleanup: true,
        priority: 'high' // Info del negocio es crítica
      });
      
      return () => smartListenerManager.removeListener(listenerKey);
    } catch (error) {
      console.error('Error setting up business info listener:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene el menú completo organizizado por categorías (OPTIMIZADO CON CACHE)
   */
  async getFullMenu() {
    const cacheKey = firebaseCache.generateKey('menus', this.businessId, { type: 'full' });
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Obtener todos los menús disponibles
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      const menusSnapshot = await getDocs(menusRef);
      
      if (menusSnapshot.docs.length === 0) {
        return [];
      }
      
      // Procesar menús sin logs excesivos
      const menusList = menusSnapshot.docs.map(menuDoc => {
        const menuData = menuDoc.data();
        
        return {
          id: menuDoc.id,
          name: menuData.name || 'Menú sin nombre',
          description: menuData.description || '',
          order: menuData.order || 0,
          active: menuData.active !== false,
          ...menuData
        };
      });

      // Filtrar solo menús activos y ordenar (en cliente para reducir queries)
      const activeMenus = menusList
        .filter(menu => menu.active)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Guardar en cache por 15 minutos
      firebaseCache.set(cacheKey, activeMenus, 15 * 60 * 1000);
      
      return activeMenus;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 📋 Obtiene múltiples menús disponibles para el negocio (CON CACHE)
   */
  async getAvailableMenus() {
    const cacheKey = firebaseCache.generateKey('menus', this.businessId, { type: 'available' });
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      const menusSnapshot = await getDocs(menusRef);
      
      // Filtrar y ordenar en el cliente
      const activeMenus = menusSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(menu => menu.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Guardar en cache por 15 minutos
      firebaseCache.set(cacheKey, activeMenus, 15 * 60 * 1000);
      
      return activeMenus;
    } catch (error) {
      console.error('Error getting available menus:', error);
      return [];
    }
  }

  /**
   * 📄 Obtiene solo los nombres de categorías de un menú (SIN items)
   * OPTIMIZACIÓN: Para lazy loading - solo carga estructura básica
   */
  async getMenuCategoriesOnly(menuId) {
    const cacheKey = firebaseCache.generateKey('menu-categories-only', menuId);
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Obtener solo las categorías, sin sus items
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      
      const categoryNames = categoriesSnapshot.docs.map(categoryDoc => {
        const categoryData = categoryDoc.data();
        return {
          id: categoryDoc.id,
          name: categoryData.name || 'Categoría sin nombre',
          description: categoryData.description || '',
          order: categoryData.order || 0,
          // Estimación aproximada del número de items (opcional)
          itemCount: categoryData.itemCount || 0
        };
      });

      // Ordenar por orden
      categoryNames.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Guardar en cache por 20 minutos (las categorías cambian poco)
      firebaseCache.set(cacheKey, categoryNames, 20 * 60 * 1000);
      
      return categoryNames;
    } catch (error) {
      console.error('❌ Error getting menu categories only:', error);
      throw error;
    }
  }

  /**
   * � Obtiene solo nombre y descripción de los items de una categoría (para búsqueda)
   * Reutiliza el caché de getCategoryItems para no duplicar lecturas de Firestore
   */
  async getCategoryItemNamesOnly(menuId, categoryId) {
    const cacheKey = firebaseCache.generateKey('category-items', `${menuId}-${categoryId}`);
    let rawItems = firebaseCache.get(cacheKey);

    if (!rawItems) {
      const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories', categoryId, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      rawItems = itemsSnapshot.docs
        .map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }))
        .filter(item => !item.isHidden);
      // Guardar en el mismo caché que getCategoryItems para no re-fetchear
      firebaseCache.set(cacheKey, rawItems, 10 * 60 * 1000);
    }

    return rawItems.map(item => ({
      id: item.id,
      name: item.name || '',
      description: item.description || ''
    }));
  }

  /**
   * �📦 Obtiene solo los items de una categoría específica
   * OPTIMIZACIÓN: Para lazy loading - carga items bajo demanda
   */
  async getCategoryItems(menuId, categoryId) {
    const cacheKey = firebaseCache.generateKey('category-items', `${menuId}-${categoryId}`);
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Obtener solo los items de esta categoría específica
      const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories', categoryId, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      
      const items = itemsSnapshot.docs
        .map(itemDoc => ({
          id: itemDoc.id,
          ...itemDoc.data()
        }))
        .filter(item => !item.isHidden) // Solo items visibles
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Ordenar por nombre

      // Guardar en cache por 10 minutos (items pueden cambiar más frecuentemente)
      firebaseCache.set(cacheKey, items, 10 * 60 * 1000);
      
      return items;
    } catch (error) {
      console.error(`❌ Error getting category items for ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * 📄 Obtiene un menú específico por su ID con todas sus categorías e items (CON CACHE)
   */
  async getMenuById(menuId) {
    const cacheKey = firebaseCache.generateKey('menu-details', menuId);
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Obtener categorías del menú - SIN orderBy para reducir costo
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      
      const categories = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data();
        
        // Obtener items de la categoría - SIN orderBy para reducir costo
        const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories', categoryDoc.id, 'items');
        const itemsSnapshot = await getDocs(itemsRef);
        
        const items = itemsSnapshot.docs
          .map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }))
          .filter(item => !item.isHidden) // Solo mostrar items no ocultos
          .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Ordenar en cliente
        
        if (items.length > 0) {
          categories.push({
            id: categoryDoc.id,
            name: categoryData.name,
            description: categoryData.description || '',
            order: categoryData.order || 0,
            items
          });
        }
      }
      
      // Ordenar categorías en cliente
      categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Guardar en cache por 10 minutos
      firebaseCache.set(cacheKey, categories, 10 * 60 * 1000);
      
      return categories;
    } catch (error) {
      console.error('❌ Error getting menu by id:', error);
      throw error;
    }
  }

  /**
   * ⭐ Obtiene solo los platos destacados
   */
  async getFeaturedItems() {
    try {
      const menu = await this.getFullMenu();
      const featuredItems = [];
      
      menu.forEach(category => {
        category.items.forEach(item => {
          if (item.featured === true) {
            featuredItems.push({
              ...item,
              categoryName: category.name
            });
          }
        });
      });
      
      return featuredItems;
    } catch (error) {
      console.error('Error getting featured items:', error);
      throw error;
    }
  }

  /**
   * 🔍 Busca items por nombre o descripción
   */
  async searchItems(searchTerm) {
    try {
      const menu = await this.getFullMenu();
      const results = [];
      const normalizeText = (str) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const term = normalizeText(searchTerm);
      
      menu.forEach(category => {
        category.items.forEach(item => {
          const nameMatch = normalizeText(item.name).includes(term);
          const descMatch = item.description && normalizeText(item.description).includes(term);
          
          if (nameMatch || descMatch) {
            results.push({
              ...item,
              categoryName: category.name
            });
          }
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }

  /**
   * 📦 Valida si un item tiene suficiente stock
   */
  validateStock(item, requestedQuantity = 1) {
    // Si el item no tiene control de stock, siempre está disponible
    if (!item.trackStock) {
      return {
        isValid: true,
        availableStock: null,
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
   * 📊 Obtiene el estado del stock de un item específico
   */
  getStockStatus(item) {
    if (!item.trackStock) {
      return {
        status: 'unlimited',
        level: 'unlimited',
        message: 'Siempre disponible',
        cssClass: 'stock-unlimited'
      };
    }

    const stock = item.stock || 0;
    
    if (stock <= 0 || item.isAvailable === false) {
      return {
        status: 'out_of_stock',
        level: 'empty',
        message: 'Sin stock',
        cssClass: 'stock-empty'
      };
    }
    
    if (stock <= 5) {
      return {
        status: 'low_stock',
        level: 'low',
        message: `¡Quedan pocos! (${stock})`,
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
   * 🛒 Valida un carrito completo contra el stock disponible
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
      const currentItem = itemsById[cartItem.id];
      
      if (!currentItem) {
        validation.errors.push(`Item no encontrado: ${cartItem.name}`);
        validation.isValid = false;
        continue;
      }
      
      const stockValidation = this.validateStock(currentItem, cartItem.quantity);
      
      if (!stockValidation.isValid) {
        validation.errors.push(`${currentItem.name}: ${stockValidation.message}`);
        validation.isValid = false;
      } else if (currentItem.trackStock && currentItem.stock <= 5) {
        validation.warnings.push(`${currentItem.name}: Quedan pocos en stock`);
      }
    }

    return validation;
  }

  /**
   * 📢 Obtiene anuncios activos del negocio (OPTIMIZADO)
   * @returns {Promise<Array>} Lista de anuncios activos
   */
  async getAnnouncements() {
    const cacheKey = firebaseCache.generateKey('announcements', this.businessId);
    
    // Intentar obtener del cache primero
    const cachedData = firebaseCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const announcementsRef = collection(this.db, 'businesses', this.businessId, 'announcements');
      // QUERY SIMPLIFICADA: Solo filtro isActive, sin orderBy para reducir costo
      const q = query(
        announcementsRef,
        where('isActive', '==', true),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const announcements = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        announcements.push({
          id: doc.id,
          ...data,
          title: data.title || '',
          description: data.description || '',
          images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
          badges: Array.isArray(data.badges) ? data.badges : [],
          url: data.url || '',
          urlText: data.urlText || 'Ver más',
          isActive: data.isActive === true,
          isFeatured: data.isFeatured === true
        });
      });
      
      // Ordenar en cliente para reducir costo de Firebase
      announcements.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        
        return 0;
      });
      
      // Guardar en cache por 5 minutos (anuncios se actualizan más frecuentemente)
      firebaseCache.set(cacheKey, announcements, 5 * 60 * 1000);
      
      return announcements;
    } catch (error) {
      console.error('❌ Error getting announcements:', error);
      throw error;
    }
  }

  /**
   * 🔄 Escucha cambios en tiempo real de los anuncios (OPTIMIZADO)
   * @param {Function} callback - Función que se ejecutará cuando cambien los anuncios
   * @returns {Function} - Función para desuscribirse del listener
   */
  subscribeToAnnouncements(callback) {
    const listenerKey = `announcements-${this.businessId}`;
    
    try {
      const announcementsRef = collection(this.db, 'businesses', this.businessId, 'announcements');
      // QUERY SIMPLIFICADA: sin orderBy para reducir costo
      const q = query(
        announcementsRef,
        where('isActive', '==', true),
        limit(10)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Actualizar uso del listener
        smartListenerManager.updateUsage(listenerKey);
        
        const announcements = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          announcements.push({
            id: doc.id,
            ...data,
            title: data.title || '',
            description: data.description || '',
            images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
            badges: Array.isArray(data.badges) ? data.badges : [],
            url: data.url || '',
            urlText: data.urlText || 'Ver más',
            isActive: data.isActive === true,
            isFeatured: data.isFeatured === true
          });
        });
        
        // Ordenar en cliente
        announcements.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          
          return 0;
        });
        
        // Actualizar cache con datos en tiempo real
        const cacheKey = firebaseCache.generateKey('announcements', this.businessId);
        firebaseCache.set(cacheKey, announcements, 5 * 60 * 1000);
        
        callback(announcements);
      }, (error) => {
        console.error('❌ Error in announcements subscription:', error);
        callback([]);
      });
      
      // Registrar el listener para auto-limpieza
      smartListenerManager.registerListener(listenerKey, unsubscribe, {
        autoCleanup: true,
        priority: 'normal'
      });
      
      return () => smartListenerManager.removeListener(listenerKey);
    } catch (error) {
      console.error('❌ Error setting up announcements subscription:', error);
      throw error;
    }
  }
}

/**
 * 🔧 Función helper para crear una instancia del SDK
 */
export function createMenuSDK(firebaseConfig, businessId) {
  return new MenuSDK(firebaseConfig, businessId);
}

export default MenuSDK;
