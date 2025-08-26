/**
 * 🎯 SMART LISTENER MANAGER - Control inteligente de listeners Firebase
 * Gestiona listeners de Firebase de manera eficiente para reducir costos
 */

class SmartListenerManager {
  constructor() {
    this.activeListeners = new Map();
    this.listenerUsage = new Map();
    this.maxIdleTime = 5 * 60 * 1000; // 5 minutos de inactividad
    this.cleanupInterval = 2 * 60 * 1000; // Cleanup cada 2 minutos
    
    this.startCleanupTimer();
  }

  /**
   * Registra un listener con auto-limpieza
   */
  registerListener(key, unsubscribeFunction, options = {}) {
    // Si ya existe un listener para esta key, limpiarlo primero
    if (this.activeListeners.has(key)) {
      this.removeListener(key);
    }
    
    this.activeListeners.set(key, {
      unsubscribe: unsubscribeFunction,
      lastUsed: Date.now(),
      autoCleanup: options.autoCleanup !== false,
      priority: options.priority || 'normal' // 'high', 'normal', 'low'
    });
    
    this.updateUsage(key);
  }

  /**
   * Actualiza el timestamp de uso de un listener
   */
  updateUsage(key) {
    const listener = this.activeListeners.get(key);
    if (listener) {
      listener.lastUsed = Date.now();
    }
    
    const usage = this.listenerUsage.get(key) || { count: 0, totalTime: 0, avgTime: 0 };
    usage.count += 1;
    this.listenerUsage.set(key, usage);
  }

  /**
   * Remover un listener específico
   */
  removeListener(key) {
    const listener = this.activeListeners.get(key);
    if (listener && typeof listener.unsubscribe === 'function') {
      listener.unsubscribe();
      this.activeListeners.delete(key);
    }
  }

  /**
   * Cleanup automático de listeners inactivos
   */
  cleanup() {
    const now = Date.now();
    const toRemove = [];

    for (const [key, listener] of this.activeListeners.entries()) {
      const idleTime = now - listener.lastUsed;
      
      // Solo limpiar listeners con autoCleanup habilitado y que estén inactivos
      if (listener.autoCleanup && idleTime > this.maxIdleTime) {
        toRemove.push(key);
      }
    }

    toRemove.forEach(key => {
      this.removeListener(key);
    });

    this.lastCleanup = now;
  }

  /**
   * Iniciar timer de limpieza automática
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Obtener estadísticas de uso
   */
  getStats() {
    return {
      activeListeners: this.activeListeners.size,
      totalUsage: [...this.listenerUsage.values()].reduce((sum, usage) => sum + usage.count, 0),
      mostUsedListener: this.getMostUsedListener(),
      oldestListener: this.getOldestListener()
    };
  }

  /**
   * Obtener el listener más usado
   */
  getMostUsedListener() {
    let maxUsage = 0;
    let mostUsedKey = null;
    
    for (const [key, usage] of this.listenerUsage.entries()) {
      if (usage.count > maxUsage) {
        maxUsage = usage.count;
        mostUsedKey = key;
      }
    }
    
    return { key: mostUsedKey, usage: maxUsage };
  }

  /**
   * Obtener el listener más antiguo
   */
  getOldestListener() {
    let oldestTime = Date.now();
    let oldestKey = null;
    
    for (const [key, listener] of this.activeListeners.entries()) {
      if (listener.lastUsed < oldestTime) {
        oldestTime = listener.lastUsed;
        oldestKey = key;
      }
    }
    
    return { key: oldestKey, age: Date.now() - oldestTime };
  }

  /**
   * Limpiar todos los listeners
   */
  shutdown() {
    for (const key of this.activeListeners.keys()) {
      this.removeListener(key);
    }
    this.listenerUsage.clear();
  }
}

// Instancia global del manager
export const smartListenerManager = new SmartListenerManager();

// Cleanup al cerrar la ventana
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    smartListenerManager.shutdown();
  });
}

export default SmartListenerManager;
