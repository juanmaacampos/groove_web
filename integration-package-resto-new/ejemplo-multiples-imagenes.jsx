/**
 * 📸 EJEMPLO: Múltiples Imágenes por Producto
 * Demuestra cómo el integration package maneja automáticamente productos con múltiples imágenes
 */

import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuDisplay, MenuItem, MenuWithCart } from './MenuComponents.jsx';
import { useMenu } from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// ==========================================
// 🎯 EJEMPLO 1: Menú completo con múltiples imágenes
// ==========================================
export function MenuWithMultipleImages() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { menu, loading, error } = useMenu(menuSDK);

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
    // Tu lógica de carrito aquí
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🍽️ Nuestro Menú</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        ✨ Los productos con múltiples imágenes mostrarán una galería interactiva automáticamente
      </p>
      
      <MenuDisplay
        menu={menu}
        onAddToCart={handleAddToCart}
        loading={loading}
        error={error}
        showImages={true}
        showPrices={true}
        showDescription={true}
      />
    </div>
  );
}

// ==========================================
// 🎯 EJEMPLO 2: Item individual con galería
// ==========================================
export function SingleItemWithGallery() {
  // Ejemplo de item con múltiples imágenes
  const sampleItem = {
    id: 'sample-pizza',
    name: 'Pizza Margherita Especial',
    description: 'Deliciosa pizza con tomate, mozzarella fresca, albahaca y aceite de oliva',
    price: 18.99,
    isAvailable: true,
    isFeatured: true,
    // Múltiples imágenes - el componente las manejará automáticamente
    images: [
      { id: '1', url: 'https://example.com/pizza-1.jpg' },
      { id: '2', url: 'https://example.com/pizza-2.jpg' },
      { id: '3', url: 'https://example.com/pizza-3.jpg' },
      { id: '4', url: 'https://example.com/pizza-4.jpg' }
    ]
  };

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>📸 Item con Galería de Imágenes</h2>
      <MenuItem
        item={sampleItem}
        onAddToCart={handleAddToCart}
        showImage={true}
        showPrice={true}
        showDescription={true}
      />
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h4>🎮 Controles de la Galería:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
          <li>📱 Botones ← → para navegar entre imágenes</li>
          <li>🔴 Puntos indicadores en la parte inferior</li>
          <li>📊 Contador de imágenes en la esquina superior derecha</li>
          <li>👆 Clic en los puntos para ir a una imagen específica</li>
        </ul>
      </div>
    </div>
  );
}

// ==========================================
// 🎯 EJEMPLO 3: Compatibilidad con imagen única
// ==========================================
export function BackwardCompatibilityExample() {
  // Item con imagen única (formato anterior) - también funciona
  const legacyItem = {
    id: 'legacy-burger',
    name: 'Hamburguesa Clásica',
    description: 'Hamburguesa tradicional con carne, lechuga, tomate y cebolla',
    price: 12.50,
    isAvailable: true,
    // Formato anterior - solo imageUrl (sin array de images)
    imageUrl: 'https://example.com/burger.jpg'
  };

  // Item nuevo con múltiples imágenes
  const newItem = {
    id: 'new-tacos',
    name: 'Tacos Gourmet',
    description: 'Tacos artesanales con ingredientes premium',
    price: 15.75,
    isAvailable: true,
    // Formato nuevo - array de múltiples imágenes
    images: [
      { id: '1', url: 'https://example.com/tacos-1.jpg' },
      { id: '2', url: 'https://example.com/tacos-2.jpg' },
      { id: '3', url: 'https://example.com/tacos-3.jpg' }
    ]
  };

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>🔄 Compatibilidad: Imagen Única vs Múltiples Imágenes</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3>📷 Formato Anterior (imagen única)</h3>
          <MenuItem
            item={legacyItem}
            onAddToCart={handleAddToCart}
            showImage={true}
            showPrice={true}
            showDescription={true}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
            ✅ Los productos existentes con <code>imageUrl</code> siguen funcionando normalmente
          </p>
        </div>
        
        <div>
          <h3>📸 Formato Nuevo (múltiples imágenes)</h3>
          <MenuItem
            item={newItem}
            onAddToCart={handleAddToCart}
            showImage={true}
            showPrice={true}
            showDescription={true}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
            ✨ Los productos nuevos con <code>images[]</code> muestran galería interactiva
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🎯 EJEMPLO 4: Menú completo con carrito (múltiples imágenes)
// ==========================================
export function CompleteMenuWithCartAndGallery() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1>🛒 Menú Completo con Carrito y Galerías</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        ✨ Experiencia completa: productos con múltiples imágenes + carrito integrado
      </p>
      
      <MenuWithCart 
        menuSDK={menuSDK} 
        showImages={true}
        terminology={{
          menuName: 'carta',
          items: 'platos',
          orderSummary: 'Resumen del Pedido'
        }}
      />
    </div>
  );
}

// ==========================================
// 📋 NOTAS TÉCNICAS
// ==========================================
export function TechnicalNotes() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🔧 Notas Técnicas</h2>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h3>📊 Estructura de Datos Esperada</h3>
        <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Formato anterior (compatible)
{
  id: 'item-1',
  name: 'Producto',
  imageUrl: 'https://...',
  // ... otros campos
}

// Formato nuevo (recomendado)
{
  id: 'item-2', 
  name: 'Producto',
  images: [
    { id: '1', url: 'https://imagen1.jpg' },
    { id: '2', url: 'https://imagen2.jpg' },
    { id: '3', url: 'https://imagen3.jpg' }
  ],
  // ... otros campos
}`}
        </pre>
      </div>
      
      <div style={{ background: '#e8f5e8', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h3>✅ Características</h3>
        <ul>
          <li><strong>Compatibilidad total:</strong> Los productos existentes con <code>imageUrl</code> siguen funcionando</li>
          <li><strong>Detección automática:</strong> El componente detecta si hay múltiples imágenes y muestra la galería</li>
          <li><strong>Controles intuitivos:</strong> Navegación con botones, puntos y gestos táctiles</li>
          <li><strong>Responsive:</strong> Se adapta perfectamente a dispositivos móviles</li>
          <li><strong>Accesibilidad:</strong> Incluye etiquetas ARIA y navegación por teclado</li>
          <li><strong>Performance:</strong> Carga lazy de imágenes y transiciones suaves</li>
        </ul>
      </div>
      
      <div style={{ background: '#fff3cd', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>💡 Recomendaciones</h3>
        <ul>
          <li><strong>Orden de imágenes:</strong> La primera imagen del array será la "portada"</li>
          <li><strong>Tamaño de imágenes:</strong> Recomendado 800x600px o superior para mejor calidad</li>
          <li><strong>Cantidad máxima:</strong> Hasta 10 imágenes por producto para mejor rendimiento</li>
          <li><strong>Formatos soportados:</strong> JPG, PNG, GIF, WEBP</li>
        </ul>
      </div>
    </div>
  );
}

export default {
  MenuWithMultipleImages,
  SingleItemWithGallery,
  BackwardCompatibilityExample,
  CompleteMenuWithCartAndGallery,
  TechnicalNotes
};
