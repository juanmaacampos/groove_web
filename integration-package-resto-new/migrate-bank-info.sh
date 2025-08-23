#!/bin/bash

# Script para migrar automáticamente la información bancaria al cliente
# Este script copia los archivos actualizados al proyecto del cliente

set -e

echo "🏦 Migrando información bancaria en tiempo real..."
echo "================================================"

# Verificar que estemos en el directorio correcto
if [ ! -f "menu-sdk.js" ] || [ ! -f "PaymentFlow.jsx" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio integration-package/"
    exit 1
fi

# Buscar el directorio del proyecto cliente
CLIENT_PROJECT=""
if [ -z "$1" ]; then
    echo "📁 Buscando proyectos cliente..."
    
    # Buscar en directorios comunes
    POSSIBLE_DIRS=(
        "../../../frontend"
        "../../../client"
        "../../../website"
        "../../../web"
        "../../../../frontend"
        "../../../../client"
        "../../../../website"
        "../../../../web"
    )
    
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -d "$dir/src" ] && [ -f "$dir/package.json" ]; then
            CLIENT_PROJECT="$dir"
            echo "✅ Encontrado proyecto cliente en: $CLIENT_PROJECT"
            break
        fi
    done
    
    if [ -z "$CLIENT_PROJECT" ]; then
        echo "❌ No se encontró proyecto cliente automáticamente."
        echo "   Uso: $0 /ruta/al/proyecto/cliente"
        echo "   Ejemplo: $0 ../../../mi-frontend"
        exit 1
    fi
else
    CLIENT_PROJECT="$1"
    if [ ! -d "$CLIENT_PROJECT/src" ]; then
        echo "❌ Error: $CLIENT_PROJECT no parece ser un proyecto React válido"
        exit 1
    fi
fi

echo "📂 Proyecto cliente: $CLIENT_PROJECT"

# Crear directorio cms-menu si no existe
CMS_DIR="$CLIENT_PROJECT/src/cms-menu"
if [ ! -d "$CMS_DIR" ]; then
    echo "📁 Creando directorio $CMS_DIR..."
    mkdir -p "$CMS_DIR"
fi

echo "📋 Copiando archivos actualizados..."

# Archivos principales a copiar
FILES_TO_COPY=(
    "menu-sdk.js"
    "useMenu.js"
    "PaymentFlow.jsx"
    "MenuComponents.css"
    "MenuComponents.jsx"
    "OrderConfirmation.jsx"
    "config.js"
)

# Ejemplos y documentación
EXAMPLES_TO_COPY=(
    "examples.jsx"
    "ejemplo-transferencias-tiempo-real.jsx"
    "README.md"
    "GUIA-PASO-A-PASO.md"
)

# Copiar archivos principales
for file in "${FILES_TO_COPY[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
        cp "$file" "$CMS_DIR/"
    else
        echo "  ⚠️  $file (no encontrado)"
    fi
done

# Copiar ejemplos
echo "📚 Copiando ejemplos y documentación..."
for file in "${EXAMPLES_TO_COPY[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
        cp "$file" "$CMS_DIR/"
    else
        echo "  ⚠️  $file (no encontrado)"
    fi
done

# Verificar dependencias
echo "🔍 Verificando dependencias de Firebase..."
if grep -q '"firebase"' "$CLIENT_PROJECT/package.json"; then
    echo "  ✅ Firebase ya está instalado"
else
    echo "  ⚠️  Firebase no encontrado en package.json"
    echo "     Ejecuta: cd $CLIENT_PROJECT && npm install firebase"
fi

# Verificar configuración
CONFIG_FILE="$CMS_DIR/config.js"
if [ -f "$CONFIG_FILE" ]; then
    if grep -q "tu-api-key" "$CONFIG_FILE" || grep -q "abc123def456" "$CONFIG_FILE"; then
        echo "⚠️  IMPORTANTE: Actualiza la configuración en:"
        echo "   $CONFIG_FILE"
        echo "   - Configura tu firebaseConfig"
        echo "   - Configura tu businessId/restaurantId"
    else
        echo "✅ Configuración parece estar lista"
    fi
fi

echo ""
echo "🎉 ¡Migración completada!"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar la configuración en: $CMS_DIR/config.js"
echo "2. Instalar Firebase si es necesario: cd $CLIENT_PROJECT && npm install firebase"
echo "3. Usar el nuevo ejemplo: import RestauranteConTransferencias from './cms-menu/ejemplo-transferencias-tiempo-real.jsx'"
echo ""
echo "🆕 Nuevas características disponibles:"
echo "✅ Información bancaria en tiempo real"
echo "✅ Botones de copia para CBU y Alias"
echo "✅ Actualización automática sin recargar página"
echo "✅ Interfaz mejorada para transferencias"
echo ""
echo "📖 Consulta la documentación completa en: $CMS_DIR/README.md"
