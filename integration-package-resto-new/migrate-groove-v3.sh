#!/bin/bash

# 🚀 Script de Migración v3.0 - Integration Package Groove Edition
# Migra todos los archivos actualizados del integration package a tu proyecto

echo "🍽️ Integration Package v3.0 - Groove Edition"
echo "============================================="
echo ""
echo "🎯 Basado en la implementación exitosa del proyecto Groove"
echo "✅ Business ID real incluido: 0X2PjjSrO8hZmq2wZtREoKR9gej1"
echo "✅ Estructura Firebase validada y funcional"
echo ""

# Verificar si se proporcionó la ruta del proyecto destino
if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar la ruta del proyecto destino"
    echo ""
    echo "Uso:"
    echo "  $0 /ruta/a/tu/proyecto"
    echo ""
    echo "Ejemplo:"
    echo "  $0 /home/usuario/mi-restaurant-app"
    echo "  $0 ../mi-proyecto"
    exit 1
fi

PROJECT_PATH="$1"
INTEGRATION_PATH="$PROJECT_PATH/src/groove-menu"

echo "📁 Proyecto destino: $PROJECT_PATH"
echo "📁 Directorio integration: $INTEGRATION_PATH"
echo ""

# Verificar que el proyecto destino existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: El directorio del proyecto no existe: $PROJECT_PATH"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "menu-sdk-v3.js" ] || [ ! -f "config.js" ]; then
    echo "❌ Error: No se encontraron los archivos del integration package"
    echo "   Asegúrate de ejecutar este script desde el directorio integration-package-resto-new/"
    exit 1
fi

# Crear directorio groove-menu si no existe
echo "📂 Creando directorio groove-menu..."
mkdir -p "$INTEGRATION_PATH"

# Función para copiar archivo con confirmación
copy_file() {
    local source_file=$1
    local dest_file=$2
    local description=$3
    
    if [ -f "$source_file" ]; then
        echo "📋 Copiando $description..."
        cp "$source_file" "$dest_file"
        echo "   ✅ $source_file -> $dest_file"
    else
        echo "   ⚠️ Archivo no encontrado: $source_file"
    fi
}

# Copiar archivos principales v3.0
echo ""
echo "📦 Copiando archivos principales v3.0..."
echo "──────────────────────────────────────"
copy_file "menu-sdk-v3.js" "$INTEGRATION_PATH/menu-sdk.js" "SDK principal v3.0"
copy_file "useMenu-v3.js" "$INTEGRATION_PATH/useMenu.js" "Hooks actualizados v3.0"
copy_file "config.js" "$INTEGRATION_PATH/config.js" "Configuración con Business ID real"

# Copiar componentes UI
echo ""
echo "🎨 Copiando componentes UI..."
echo "─────────────────────────────"
copy_file "MenuComponents.jsx" "$INTEGRATION_PATH/MenuComponents.jsx" "Componentes React"
copy_file "MenuComponents.css" "$INTEGRATION_PATH/MenuComponents.css" "Estilos responsivos"
copy_file "MultipleMenusComponents.jsx" "$INTEGRATION_PATH/MultipleMenusComponents.jsx" "Componentes múltiples menús"
copy_file "MultipleMenusStyles.css" "$INTEGRATION_PATH/MultipleMenusStyles.css" "Estilos múltiples menús"

# Copiar flujo de pago (opcional)
echo ""
echo "💳 Copiando componentes de pago..."
echo "──────────────────────────────"
copy_file "PaymentFlow.jsx" "$INTEGRATION_PATH/PaymentFlow.jsx" "Flujo de pago"
copy_file "OrderConfirmation.jsx" "$INTEGRATION_PATH/OrderConfirmation.jsx" "Confirmación de pedido"

# Copiar ejemplos y documentación
echo ""
echo "📖 Copiando ejemplos y documentación..."
echo "───────────────────────────────────────"
copy_file "ejemplo-groove-completo.jsx" "$INTEGRATION_PATH/ejemplo-completo.jsx" "Ejemplo completo basado en Groove"
copy_file "README-v3.md" "$INTEGRATION_PATH/README.md" "Documentación v3.0"

# Copiar archivos de compatibilidad
echo ""
echo "🔄 Copiando archivos de compatibilidad..."
echo "────────────────────────────────────────"
copy_file "ejemplo-multiples-menus.jsx" "$INTEGRATION_PATH/ejemplo-multiples-menus.jsx" "Ejemplo múltiples menús"
copy_file "ejemplo-moderno-businesses.jsx" "$INTEGRATION_PATH/ejemplo-moderno.jsx" "Ejemplo moderno"

# Crear archivo de configuración personalizado si no existe
CONFIG_FILE="$INTEGRATION_PATH/config.local.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo ""
    echo "⚙️ Creando archivo de configuración personalizado..."
    cat > "$CONFIG_FILE" << 'EOF'
/**
 * 🔧 CONFIGURACIÓN PERSONALIZADA
 * Copia este archivo y reemplaza con tu configuración específica
 */

import { MENU_CONFIG } from './config.js';

// Configuración personalizada - reemplaza estos valores
export const MY_MENU_CONFIG = {
  ...MENU_CONFIG,
  
  // 🔥 TU CONFIGURACIÓN DE FIREBASE
  firebaseConfig: {
    apiKey: "tu-api-key",
    authDomain: "tu-project.firebaseapp.com",
    projectId: "tu-project-id",
    storageBucket: "tu-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456789"
  },
  
  // 🏪 TU BUSINESS ID
  businessId: "TU_BUSINESS_ID_AQUI",
  
  // 🎨 PERSONALIZACIÓN
  multipleMenus: {
    ...MENU_CONFIG.multipleMenus,
    ui: {
      ...MENU_CONFIG.multipleMenus.ui,
      menuCardStyle: "modern", // "modern", "compact", "card"
      showProductImages: true,
      compactMode: false
    }
  }
};
EOF
    echo "   ✅ Creado: $CONFIG_FILE"
    echo "   📝 Edita este archivo con tu configuración específica"
fi

# Verificar dependencias
echo ""
echo "🔍 Verificando dependencias..."
echo "──────────────────────────────"

PACKAGE_JSON="$PROJECT_PATH/package.json"
if [ -f "$PACKAGE_JSON" ]; then
    if grep -q '"firebase"' "$PACKAGE_JSON"; then
        echo "   ✅ Firebase ya está instalado"
    else
        echo "   ⚠️ Firebase no encontrado en package.json"
        echo "      Ejecuta: cd $PROJECT_PATH && npm install firebase"
    fi
    
    if grep -q '"react"' "$PACKAGE_JSON"; then
        echo "   ✅ React detectado"
    else
        echo "   ⚠️ React no encontrado - asegúrate de tener React instalado"
    fi
else
    echo "   ⚠️ No se encontró package.json en $PROJECT_PATH"
fi

# Instrucciones finales
echo ""
echo "🎉 ¡Migración completada!"
echo "========================="
echo ""
echo "📋 Archivos copiados a: $INTEGRATION_PATH/"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Instalar dependencias:"
echo "   cd $PROJECT_PATH"
echo "   npm install firebase react"
echo ""
echo "2. Configurar tu Business ID:"
echo "   - Edita: $INTEGRATION_PATH/config.local.js"
echo "   - Reemplaza 'TU_BUSINESS_ID_AQUI' con tu Business ID real"
echo "   - Actualiza la configuración de Firebase"
echo ""
echo "3. Importar en tu aplicación:"
echo "   import { createMenuSDK } from './groove-menu/menu-sdk';"
echo "   import { useGrooveMenus, useMenuCategories } from './groove-menu/useMenu';"
echo "   import { MY_MENU_CONFIG } from './groove-menu/config.local';"
echo ""
echo "4. Usar ejemplo completo:"
echo "   import GrooveApp from './groove-menu/ejemplo-completo';"
echo ""
echo "🧪 Para testing inmediato:"
echo "   - Usa el Business ID de ejemplo: 0X2PjjSrO8hZmq2wZtREoKR9gej1"
echo "   - Este ID tiene datos reales y funciona inmediatamente"
echo ""
echo "📖 Documentación completa: $INTEGRATION_PATH/README.md"
echo ""
echo "✨ ¡El Integration Package v3.0 está listo para usar!"

# Mostrar estructura creada
echo ""
echo "📁 Estructura creada:"
echo "├── $INTEGRATION_PATH/"
echo "│   ├── menu-sdk.js                    # SDK principal v3.0"
echo "│   ├── useMenu.js                     # Hooks actualizados"
echo "│   ├── config.js                      # Config con Business ID real"
echo "│   ├── config.local.js                # Tu configuración personalizada"
echo "│   ├── MenuComponents.jsx             # Componentes UI"
echo "│   ├── MenuComponents.css             # Estilos responsivos"
echo "│   ├── MultipleMenusComponents.jsx    # Componentes múltiples menús"
echo "│   ├── ejemplo-completo.jsx           # Ejemplo basado en Groove"
echo "│   ├── PaymentFlow.jsx                # Flujo de pago"
echo "│   └── README.md                      # Documentación v3.0"

echo ""
echo "🔗 Links útiles:"
echo "   - Proyecto Groove (referencia): https://github.com/groove-team/groove-web"
echo "   - Firebase Console: https://console.firebase.google.com"
echo "   - Business ID de ejemplo: 0X2PjjSrO8hZmq2wZtREoKR9gej1"
