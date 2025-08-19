# 🚀 **Guía Paso a Paso: Testing de MercadoPago**

Esta guía te llevará de la mano para configurar y probar MercadoPago con tu SDK de menús.

## 📋 **Antes de Empezar**

### **Requisitos:**
- ✅ Node.js instalado
- ✅ Firebase CLI instalado (`npm install -g firebase-tools`)
- ✅ Cuenta de MercadoPago
- ✅ Proyecto Firebase configurado

### **Tiempo estimado:** 15-20 minutos

---

## **🎯 PASO 1: Obtener Credenciales de Testing**

### 1.1 **Ir a MercadoPago Developers**
```bash
# Abrir en navegador:
https://www.mercadopago.com.ar/developers/panel/credentials
```

### 1.2 **Obtener Testing Credentials**
1. Haz clic en **"Testing credentials"**
2. Copia el **"Access Token"** (empieza con `TEST-`)
3. Copia el **"Public Key"** (empieza con `TEST-`)

### 1.3 **Guardar las credenciales**
```bash
# Ejemplo de credenciales (reemplaza con las tuyas):
ACCESS_TOKEN: TEST-4234567890123456-123456-abcdef1234567890abcdef1234567890-123456789
PUBLIC_KEY: TEST-c7b5ad73-9f5c-4a92-bb1a-0e4acbf7f9a7
```

---

## **🔧 PASO 2: Configuración Automática**

### 2.1 **Ejecutar Script de Configuración**
```bash
cd integration-package
./setup-testing.sh
```

### 2.2 **Seguir las instrucciones del script**
El script te pedirá:
- Tu Access Token de testing
- Confirmará la configuración
- Desplegará las Cloud Functions automáticamente

### 2.3 **Verificar que todo funcionó**
```bash
# Al final verás:
✅ Credenciales de testing configuradas
✅ Cloud Functions desplegadas  
✅ Archivo de test creado
```

---

## **🧪 PASO 3: Ejecutar Tests**

### 3.1 **Test Rápido**
```bash
# Abrir el archivo que se creó automáticamente:
open test-mercadopago.html
```

### 3.2 **Testing Suite Completo**
```bash
# Servir los archivos localmente:
python -m http.server 8000

# Luego abrir en navegador:
http://localhost:8000/mercadopago-testing.html
```

### 3.3 **Ejecutar tests desde el Testing Suite**
1. Clic en **"🚀 Ejecutar Test Completo"**
2. Verificar que todos los tests pasen ✅
3. Probar el flujo de carrito
4. Probar creación de preferencia de pago

---

## **💳 PASO 4: Probar Pagos Reales**

### 4.1 **Usar las tarjetas de prueba**

**✅ Para pagos APROBADOS:**
```
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Titular: APRO
```

**❌ Para pagos RECHAZADOS:**
```
Número: 4000 0000 0000 0002  
CVV: 123
Vencimiento: 11/25
Titular: OTHE
```

**⏳ Para pagos PENDIENTES:**
```
Número: 4509 9535 6623 3704
CVV: 123  
Vencimiento: 11/25
Titular: CONT
```

### 4.2 **Flujo de prueba completo**
1. Agregar productos al carrito
2. Proceder al checkout
3. Llenar información del cliente
4. Seleccionar "Pagar con MercadoPago"
5. Usar una tarjeta de prueba
6. Verificar redirección y confirmación

---

## **🔨 PASO 5: Integrar en tu Proyecto**

### 5.1 **Para proyectos React Vite nuevos**
```bash
# Crear proyecto
npm create vite@latest mi-restaurante -- --template react
cd mi-restaurante
npm install

# Instalar dependencias adicionales
npm install firebase

# Copiar el SDK
cp -r /ruta/al/integration-package ./src/cms-menu
```

### 5.2 **Configurar tu App.jsx**
```jsx
import React from 'react';
import { RestaurantWithTesting } from './cms-menu/examples.jsx';

function App() {
  return (
    <div className="App">
      <RestaurantWithTesting />
    </div>
  );
}

export default App;
```

### 5.3 **Configurar el config.js**
```javascript
// En src/cms-menu/config.js
export const MENU_CONFIG = {
  firebaseConfig: {
    // Tu configuración de Firebase
  },
  restaurantId: "tu-restaurant-id-aqui"
};
```

---

## **📊 PASO 6: Verificar Todo Funciona**

### 6.1 **Checklist final**
- [ ] ✅ Testing Suite muestra todo en verde
- [ ] ✅ Carrito funciona correctamente  
- [ ] ✅ Checkout crea preferencia de pago
- [ ] ✅ Redirección a MercadoPago funciona
- [ ] ✅ Tarjetas de prueba procesan correctamente
- [ ] ✅ Webhook recibe notificaciones
- [ ] ✅ Confirmación de pedido funciona

### 6.2 **Ver logs en tiempo real**
```bash
# En una terminal separada:
firebase functions:log --only createPaymentPreference
```

### 6.3 **Verificar en Firebase Console**
```bash
# Abrir Firebase Console:
https://console.firebase.google.com/project/TU-PROJECT-ID/functions/logs
```

---

## **🚀 PASO 7: Ir a Producción**

### 7.1 **Cuando todo funcione en testing:**
```bash
# Configurar credenciales reales
firebase functions:config:set mercadopago.access_token="APP-TU-ACCESS-TOKEN-REAL"

# Desplegar
firebase deploy --only functions
```

### 7.2 **Probar con cantidades pequeñas**
- Usa tu tarjeta real con montos pequeños ($1 ARS)
- Verifica que todo el flujo funciona
- Confirma que recibes las notificaciones

### 7.3 **¡Listo para usar!**
Tu integración de MercadoPago está lista para recibir pagos reales.

---

## **🆘 Si Algo Sale Mal**

### **Error: "Functions not deployed"**
```bash
firebase deploy --only functions
firebase functions:log
```

### **Error: "Invalid credentials"**
```bash
firebase functions:config:get
firebase functions:config:set mercadopago.access_token="TEST-TU-TOKEN"
```

### **Error: "CORS issues"**
```bash
./setup-cors.sh
```

### **Verificar configuración**
```bash
# Ver configuración actual
firebase functions:config:get

# Ver logs en tiempo real
firebase functions:log
```

---

## **📞 Soporte**

### **Recursos útiles:**
- 📖 [Documentación MercadoPago](https://www.mercadopago.com.ar/developers)
- 🧪 **Testing Suite:** `mercadopago-testing.html`
- 📝 **Guía completa:** `TESTING-MERCADOPAGO.md`
- 🎯 **Ejemplos:** `examples.jsx`

### **¿Problemas?**
1. Revisa los logs: `firebase functions:log`
2. Verifica configuración: `firebase functions:config:get`
3. Ejecuta el Testing Suite completo
4. Consulta la documentación oficial de MercadoPago

---

**¡Con esta guía tendrás MercadoPago funcionando en menos de 20 minutos! 🎉**
