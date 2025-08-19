import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';

/**
 * 🍽️ MENU SDK PARA GROOVE - Integración con Firebase
 * SDK para conectar la web de Groove con Firebase y obtener menús dinámicos
 */
export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.businessId = businessId;
  }

  /**
   * 🏢 Obtiene información básica del negocio
   */
  async getBusinessInfo() {
    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (!businessDoc.exists()) {
        throw new Error(`Negocio no encontrado con ID: ${this.businessId}`);
      }
      
      return businessDoc.data();
    } catch (error) {
      console.error('Error getting business info:', error);
      throw error;
    }
  }

  /**
   * 🔄 Escucha cambios en tiempo real de la información del negocio
   * @param {Function} callback - Función que se ejecutará cuando cambie la información
   * @returns {Function} - Función para desuscribirse del listener
   */
  onBusinessInfoChange(callback) {
    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      
      return onSnapshot(businessRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data(), null);
        } else {
          callback(null, new Error('Negocio no encontrado'));
        }
      }, (error) => {
        console.error('Error in business listener:', error);
        callback(null, error);
      });
    } catch (error) {
      console.error('Error setting up business info listener:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene el menú completo organizizado por categorías (solo items visibles)
   */
  async getFullMenu() {
    try {
      console.log('📋 MenuSDK: obteniendo menú completo para businessId:', this.businessId);
      
      // Obtener todos los menús disponibles primero
      console.log('📋 MenuSDK: obteniendo lista de menús...');
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      const menusSnapshot = await getDocs(menusRef);
      
      if (menusSnapshot.docs.length === 0) {
        console.log('📋 MenuSDK: no se encontraron menús');
        return [];
      }

      console.log('📋 MenuSDK: menús encontrados:', menusSnapshot.docs.length);
      
      // Retornar la información de cada menú (no las categorías)
      const menusList = menusSnapshot.docs.map(menuDoc => {
        const menuData = menuDoc.data();
        console.log('📋 MenuSDK: menú:', menuDoc.id, menuData);
        
        return {
          id: menuDoc.id,
          name: menuData.name || 'Menú sin nombre',
          description: menuData.description || '',
          order: menuData.order || 0,
          active: menuData.active !== false,
          ...menuData
        };
      });

      // Filtrar solo menús activos y ordenar
      const activeMenus = menusList
        .filter(menu => menu.active)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      console.log('✅ MenuSDK: menús activos obtenidos:', activeMenus);
      return activeMenus;
    } catch (error) {
      console.error('❌ Error getting full menu:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtiene múltiples menús disponibles para el negocio
   */
  async getAvailableMenus() {
    try {
      const menusRef = collection(this.db, 'businesses', this.businessId, 'menus');
      // Simplificar la query para evitar problemas de índices
      const menusSnapshot = await getDocs(menusRef);
      
      // Filtrar en el cliente por ahora
      return menusSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(menu => menu.active !== false) // Solo menús activos
        .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordenar por orden
    } catch (error) {
      console.error('Error getting available menus:', error);
      return [];
    }
  }

  /**
   * 📄 Obtiene un menú específico por su ID con todas sus categorías e items
   */
  async getMenuById(menuId) {
    try {
      console.log('📄 MenuSDK: obteniendo menú por ID:', menuId);
      
      // Obtener categorías del menú
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categories = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data();
        console.log('📄 MenuSDK: procesando categoría:', categoryDoc.id, categoryData);
        
        // Obtener items de la categoría
        const itemsRef = collection(this.db, 'businesses', this.businessId, 'menus', menuId, 'categories', categoryDoc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        const items = itemsSnapshot.docs
          .map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }))
          .filter(item => !item.isHidden); // Solo mostrar items no ocultos
        
        if (items.length > 0) {
          categories.push({
            id: categoryDoc.id,
            name: categoryData.name,
            description: categoryData.description || '',
            items
          });
        }
      }
      
      console.log('✅ MenuSDK: categorías obtenidas para menú', menuId, ':', categories);
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
      const term = searchTerm.toLowerCase();
      
      menu.forEach(category => {
        category.items.forEach(item => {
          const nameMatch = item.name.toLowerCase().includes(term);
          const descMatch = item.description && item.description.toLowerCase().includes(term);
          
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
}

/**
 * 🔧 Función helper para crear una instancia del SDK
 */
export function createMenuSDK(firebaseConfig, businessId) {
  return new MenuSDK(firebaseConfig, businessId);
}

export default MenuSDK;
