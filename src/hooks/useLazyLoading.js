import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 🚀 HOOKS OPTIMIZADOS PARA LAZY LOADING - GROVE
 * Carga inteligente: primero categorías, luego items bajo demanda
 */

/**
 * Hook optimizado para cargar categorías sin items (solo nombres)
 * @param {Object} menuSDK - Instancia del MenuSDK  
 * @param {string} menuId - ID del menú
 */
export function useMenuCategoriesLazy(menuSDK, menuId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedCategories = useRef(new Set());
  const loadedSearchIndexes = useRef(new Set());

  // Función para cargar solo las categorías (sin items)
  const loadCategoryNames = useCallback(async () => {
    if (!menuSDK || !menuId) {
      setCategories([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Obtener solo información de categorías (sin items por ahora)
      const categoryNames = await menuSDK.getMenuCategoriesOnly(menuId);
      
      // Crear estructura de categorías vacías
      const emptyCategoriesStructure = categoryNames.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        order: cat.order || 0,
        items: [], // Vacío inicialmente
        itemsLoaded: false, // Flag para saber si ya se cargaron
        itemCount: cat.itemCount || 0, // Número aproximado de items
        loading: false // Flag individual de carga
      }));

      setCategories(emptyCategoriesStructure);
      loadedCategories.current.clear();
      loadedSearchIndexes.current.clear();
    } catch (err) {
      console.error('❌ Error loading category names:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [menuSDK, menuId]);

  // Función para cargar items de una categoría específica
  const loadCategoryItems = useCallback(async (categoryId) => {
    if (!menuSDK || !menuId || !categoryId) return;
    
    // Evitar cargas duplicadas
    if (loadedCategories.current.has(categoryId)) {
      return;
    }

    try {
      // Marcar categoría como cargando
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, loading: true }
          : cat
      ));

      // Cargar items de la categoría específica
      const categoryItems = await menuSDK.getCategoryItems(menuId, categoryId);
      
      // Mapear items al formato Groove
      const mappedItems = categoryItems.map(item => ({
        id: item.id,
        name: item.name,
        price: formatPrice(item.price),
        desc: item.description || '',
        img: item.image || item.images?.[0]?.url || null,
        featured: item.featured || false,
        stock: item.stock,
        trackStock: item.trackStock || false,
        isAvailable: item.isAvailable !== false
      }));

      // Actualizar solo la categoría específica
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { 
              ...cat, 
              items: mappedItems, 
              itemsLoaded: true,
              loading: false,
              itemCount: mappedItems.length 
            }
          : cat
      ));

      // Marcar como cargada
      loadedCategories.current.add(categoryId);
      
    } catch (err) {
      console.error(`❌ Error loading items for category ${categoryId}:`, err);
      
      // Marcar categoría como error
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, loading: false, error: err.message }
          : cat
      ));
    }
  }, [menuSDK, menuId]);

  // Carga solo nombre+descripción de los items de una categoría (índice de búsqueda ligero)
  const loadCategorySearchIndex = useCallback(async (categoryId) => {
    if (!menuSDK || !menuId || !categoryId) return;
    // Si ya están cargados los items completos o el índice ya existe, no hacer nada
    if (loadedCategories.current.has(categoryId)) return;
    if (loadedSearchIndexes.current.has(categoryId)) return;

    // Marcar inmediatamente para evitar llamadas duplicadas
    loadedSearchIndexes.current.add(categoryId);

    try {
      const nameItems = await menuSDK.getCategoryItemNamesOnly(menuId, categoryId);
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, searchIndex: nameItems }
          : cat
      ));
    } catch (err) {
      // Permitir reintento si falla
      loadedSearchIndexes.current.delete(categoryId);
      console.error(`❌ Error loading search index for category ${categoryId}:`, err);
    }
  }, [menuSDK, menuId]);

  // Cargar nombres de categorías al inicio
  useEffect(() => {
    loadCategoryNames();
  }, [loadCategoryNames]);

  return {
    categories,
    loading,
    error,
    loadCategoryItems,
    loadCategorySearchIndex,
    refreshCategories: loadCategoryNames
  };
}

/**
 * Función helper para formatear precios
 */
function formatPrice(price) {
  if (!price || isNaN(price)) return '$0';
  
  if (typeof price === 'number') {
    return `$${price.toLocaleString('es-AR')}`;
  }
  
  return price.toString();
}

/**
 * Hook para gestión inteligente de categorías expandidas con lazy loading
 * @param {Array} categories - Lista de categorías
 * @param {Function} loadCategoryItems - Función para cargar items de categoría
 * @param {string} menuType - Tipo de menú para persistencia
 */
export function useSmartCategoryExpansion(categories, loadCategoryItems, menuType) {
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Recuperar del localStorage
    const saved = localStorage.getItem(`groove-expanded-${menuType}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(
      `groove-expanded-${menuType}`, 
      JSON.stringify([...expandedCategories])
    );
  }, [expandedCategories, menuType]);

  const toggleCategory = useCallback(async (categoryId) => {
    const isCurrentlyExpanded = expandedCategories.has(categoryId);
    
    if (!isCurrentlyExpanded) {
      // Expandir: cargar items si no están cargados
      const category = categories.find(cat => cat.id === categoryId);
      if (category && !category.itemsLoaded && !category.loading) {
        await loadCategoryItems(categoryId);
      }
      
      // Expandir categoría
      setExpandedCategories(prev => {
        const newSet = new Set(prev);
        newSet.add(categoryId);
        return newSet;
      });
    } else {
      // Colapsar categoría
      setExpandedCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  }, [expandedCategories, categories, loadCategoryItems]);

  const isCategoryExpanded = useCallback((categoryId) => {
    return expandedCategories.has(categoryId);
  }, [expandedCategories]);

  // Auto-expandir categorías que estaban previamente expandidas
  useEffect(() => {
    if (categories.length > 0) {
      expandedCategories.forEach(categoryId => {
        const category = categories.find(cat => cat.id === categoryId);
        if (category && !category.itemsLoaded && !category.loading) {
          loadCategoryItems(categoryId);
        }
      });
    }
  }, [categories, expandedCategories, loadCategoryItems]);

  return {
    expandedCategories,
    toggleCategory,
    isCategoryExpanded
  };
}

/**
 * Hook para estadísticas de rendimiento del lazy loading
 */
export function useLazyLoadingStats(categories) {
  const stats = {
    totalCategories: categories.length,
    loadedCategories: categories.filter(cat => cat.itemsLoaded).length,
    loadingCategories: categories.filter(cat => cat.loading).length,
    totalItems: categories.reduce((sum, cat) => sum + cat.itemCount, 0),
    loadedItems: categories.reduce((sum, cat) => sum + (cat.itemsLoaded ? cat.items.length : 0), 0),
    loadingProgress: categories.length > 0 ? 
      (categories.filter(cat => cat.itemsLoaded).length / categories.length * 100).toFixed(1) : 0
  };

  return stats;
}

export default {
  useMenuCategoriesLazy,
  useSmartCategoryExpansion,
  useLazyLoadingStats
};
