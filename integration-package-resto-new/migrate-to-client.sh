#!/bin/bash

# 🚀 Script de Migración Automática - Galería de Imágenes
# Copia todos los archivos necesarios del integration package a tu proyecto cliente

echo "🍽️ CMS Menu - Migration Script"
echo "==============================="
echo ""

# Verificar si se proporcionó la ruta del proyecto destino
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar la ruta de tu proyecto React"
    echo ""
    echo "Uso: ./migrate-to-client.sh /ruta/a/tu/proyecto-react"
    echo ""
    echo "Ejemplo: ./migrate-to-client.sh /home/user/mi-restaurante-web"
    exit 1
fi

PROJECT_PATH="$1"
CMS_MENU_PATH="$PROJECT_PATH/src/cms-menu"

echo "📁 Proyecto destino: $PROJECT_PATH"
echo "📁 Directorio CMS: $CMS_MENU_PATH"
echo ""

# Verificar que el proyecto destino existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: El directorio $PROJECT_PATH no existe"
    exit 1
fi

# Crear directorio cms-menu si no existe
echo "📂 Creando directorio cms-menu..."
mkdir -p "$CMS_MENU_PATH"

# Copiar archivos principales
echo "📋 Copiando archivos principales..."
cp menu-sdk.js "$CMS_MENU_PATH/"
cp useMenu.js "$CMS_MENU_PATH/"
cp MenuComponents.jsx "$CMS_MENU_PATH/"
cp MenuComponents.css "$CMS_MENU_PATH/"
cp config.js "$CMS_MENU_PATH/"

# Copiar componentes de pago (opcional)
echo "💳 Copiando componentes de pago..."
cp PaymentFlow.jsx "$CMS_MENU_PATH/"
cp OrderConfirmation.jsx "$CMS_MENU_PATH/"

# Copiar ejemplos para referencia
echo "📖 Copiando ejemplos de referencia..."
cp ejemplo-multiples-imagenes.jsx "$CMS_MENU_PATH/"
cp examples.jsx "$CMS_MENU_PATH/"
cp README.md "$CMS_MENU_PATH/"

echo ""
echo "✅ Migración completada!"
echo ""
echo "🔧 Próximos pasos:"
echo "1. Edita $CMS_MENU_PATH/config.js con tu Firebase config y businessId"
echo "2. Asegúrate de tener Firebase instalado: npm install firebase"
echo "3. Importa los componentes en tu aplicación"
echo "4. Revisa $CMS_MENU_PATH/ejemplo-multiples-imagenes.jsx para ejemplos"
echo ""
echo "📚 Documentación completa en: $CMS_MENU_PATH/README.md"
echo ""
echo "🎉 ¡Tu galería de imágenes está lista!"
