import React, { useState, useEffect } from 'react';

/**
 * 🎛️ Control de Configuración Firebase
 * Permite al administrador ajustar la configuración de optimización
 */
const FirebaseConfigControl = () => {
  const [config, setConfig] = useState({
    cacheEnabled: true,
    realtimeMode: 'smart', // 'always', 'smart', 'never'
    cacheTTL: 15, // minutos
    autoCleanup: true,
    showStats: false
  });

  // Cargar configuración desde localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('groove-firebase-config');
    if (savedConfig) {
      try {
        setConfig({...config, ...JSON.parse(savedConfig)});
      } catch (e) {
        console.error('Error parsing saved config:', e);
      }
    }
  }, []);

  // Guardar configuración
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('groove-firebase-config', JSON.stringify(newConfig));
    
    // Aplicar cambios dinámicamente
    window.grooveFirebaseConfig = newConfig;
    
    // Forzar refresh de componentes si es necesario
    window.dispatchEvent(new CustomEvent('groove-config-change', {
      detail: newConfig
    }));
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    saveConfig(newConfig);
  };

  // Solo mostrar en modo desarrollo o para administradores
  if (process.env.NODE_ENV === 'production' && !config.showInProduction) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 10000,
      backgroundColor: 'white',
      border: '2px solid #4285f4',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      minWidth: '280px'
    }}>
      <h4 style={{ 
        margin: '0 0 15px 0', 
        color: '#4285f4',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🔥 Firebase Config
      </h4>
      
      {/* Cache Settings */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={config.cacheEnabled}
            onChange={(e) => handleConfigChange('cacheEnabled', e.target.checked)}
          />
          <span>💾 Habilitar Cache</span>
        </label>
      </div>

      {/* Realtime Mode */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          👂 Modo Tiempo Real:
        </label>
        <select
          value={config.realtimeMode}
          onChange={(e) => handleConfigChange('realtimeMode', e.target.value)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="always">Siempre Activo (+ costo)</option>
          <option value="smart">Inteligente (recomendado)</option>
          <option value="never">Solo Cache (- costo)</option>
        </select>
      </div>

      {/* Cache TTL */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          ⏱️ Cache TTL (minutos):
        </label>
        <input
          type="range"
          min="1"
          max="60"
          value={config.cacheTTL}
          onChange={(e) => handleConfigChange('cacheTTL', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>
          {config.cacheTTL} minutos
        </div>
      </div>

      {/* Auto Cleanup */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={config.autoCleanup}
            onChange={(e) => handleConfigChange('autoCleanup', e.target.checked)}
          />
          <span>🧹 Auto-limpieza</span>
        </label>
      </div>

      {/* Show Stats */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={config.showStats}
            onChange={(e) => handleConfigChange('showStats', e.target.checked)}
          />
          <span>📊 Mostrar Estadísticas</span>
        </label>
      </div>

      {/* Cost Estimation */}
      <div style={{
        borderTop: '1px solid #eee',
        paddingTop: '10px',
        fontSize: '11px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '4px' }}>💰 Reducción de costos estimada:</div>
        <div style={{ 
          fontWeight: 'bold',
          color: config.realtimeMode === 'never' ? '#34a853' : 
                config.realtimeMode === 'smart' ? '#fbbc04' : '#ea4335'
        }}>
          {config.realtimeMode === 'never' && '~85% menos lecturas 🎯'}
          {config.realtimeMode === 'smart' && '~75% menos lecturas ⚡'}
          {config.realtimeMode === 'always' && '~50% menos lecturas 💸'}
        </div>
      </div>
    </div>
  );
};

export default FirebaseConfigControl;
