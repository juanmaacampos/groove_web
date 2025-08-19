// Menu SDK para integración con sitios externos
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.businessId = businessId;
  }

  /**
   * Obtiene información básica del negocio
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
   * Obtiene información básica del restaurante (alias para compatibilidad)
   * @deprecated Use getBusinessInfo() instead
   */
  async getRestaurantInfo() {
    return this.getBusinessInfo();
  }

  /**
   * Escucha cambios en tiempo real de la información del negocio
   * @param {Function} callback - Función que se ejecutará cuando cambie la información
   * @returns {Function} - Función para desuscribirse del listener
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
   * Obtiene el menú completo organizizado por categorías (solo items visibles)
   */
  async getFullMenu() {
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
          .filter(item => !item.isHidden); // Solo mostrar items no ocultos
        
        // Solo incluir categorías que tengan items visibles
        if (categoryData.items.length > 0) {
          menu.push(categoryData);
        }
      }
      
      return menu;
    } catch (error) {
      console.error('Error getting full menu:', error);
      throw error;
    }
  }

  /**
   * Obtiene el menú completo incluyendo items ocultos (para uso administrativo)
   */
  async getFullMenuWithHidden() {
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
        
        categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
          id: itemDoc.id,
          ...itemDoc.data()
        }));
        
        menu.push(categoryData);
      }
      
      return menu;
    } catch (error) {
      console.error('Error getting full menu with hidden items:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los platos destacados (excluye items ocultos)
   */
  async getFeaturedItems() {
    try {
      const menu = await this.getFullMenu();
      const featuredItems = [];
      
      menu.forEach(category => {
        const featured = category.items.filter(item => 
          item.isFeatured && 
          item.isAvailable && 
          !item.isHidden // Excluir items ocultos
        );
        featuredItems.push(...featured.map(item => ({
          ...item,
          categoryName: category.name
        })));
      });
      
      return featuredItems;
    } catch (error) {
      console.error('Error getting featured items:', error);
      throw error;
    }
  }

  /**
   * Obtiene una categoría específica con sus items
   */
  async getCategory(categoryId) {
    try {
      const categoryRef = doc(this.db, 'businesses', this.businessId, 'menu', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (!categoryDoc.exists()) {
        throw new Error('Category not found');
      }
      
      const categoryData = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
        items: []
      };
      
      // Obtener items de esta categoría
      const itemsRef = collection(this.db, 'businesses', this.businessId, 'menu', categoryId, 'items');
      const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
        id: itemDoc.id,
        ...itemDoc.data()
      }));
      
      return categoryData;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  /**
   * Busca items por nombre o descripción (excluye items ocultos)
   */
  async searchItems(searchTerm) {
    try {
      const menu = await this.getFullMenu();
      const allItems = [];
      
      menu.forEach(category => {
        category.items.forEach(item => {
          // Solo incluir items no ocultos
          if (!item.isHidden) {
            allItems.push({
              ...item,
              categoryName: category.name,
              categoryId: category.id
            });
          }
        });
      });
      
      const searchTermLower = searchTerm.toLowerCase();
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchTermLower) ||
        (item.description && item.description.toLowerCase().includes(searchTermLower))
      );
    } catch (error) {
      console.error('Error searching items:', error);
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
