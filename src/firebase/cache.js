/**
 * 💾 FIREBASE CACHE MANAGER - Reduce Firebase Calls
 * Sistema de caché inteligente para minimizar lecturas de Firestore
 */

class FirebaseCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutos
  }

  /**
   * Generar clave única para cache
   */
  generateKey(collection, docId, params = {}) {
    const paramString = Object.keys(params).length > 0 
      ? JSON.stringify(params) 
      : '';
    return `${collection}:${docId}:${paramString}`;
  }

  /**
   * Obtener datos del cache
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Verificar si ha expirado
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Guardar datos en cache
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  /**
   * Limpiar cache expirado
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidar cache específico
   */
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpiar todo el cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    return {
      totalItems: this.cache.size,
      memoryUsage: JSON.stringify([...this.cache.entries()]).length,
      oldestItem: Math.min(...[...this.cache.values()].map(item => item.timestamp)),
      newestItem: Math.max(...[...this.cache.values()].map(item => item.timestamp))
    };
  }
}

// Instancia global del cache
export const firebaseCache = new FirebaseCache();

// Auto-cleanup cada 5 minutos
setInterval(() => {
  firebaseCache.cleanup();
}, 5 * 60 * 1000);

export default FirebaseCache;
