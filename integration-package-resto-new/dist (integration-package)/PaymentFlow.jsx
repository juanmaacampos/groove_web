import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { MENU_CONFIG } from './config.js';

export function CheckoutFlow({ cart, cartTotal, restaurant, onOrderComplete, menuSDK }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    notes: '' 
  });
  const [loading, setLoading] = useState(false);
  const [stockValidation, setStockValidation] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Función para copiar al portapapeles
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(text);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(text);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Validar stock cuando cambia el carrito
  React.useEffect(() => {
    if (menuSDK && cart && cart.length > 0) {
      validateCartStock();
    }
  }, [cart, menuSDK]);

  const validateCartStock = async () => {
    if (!menuSDK) return;
    
    try {
      const validation = await menuSDK.validateCart(cart);
      setStockValidation(validation);
    } catch (error) {
      console.error('Error validating stock:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar stock antes de proceder
      if (menuSDK) {
        const validation = await menuSDK.validateCart(cart);
        if (!validation.isValid) {
          alert('Error: Algunos productos no tienen suficiente stock disponible. Por favor revisa tu carrito.');
          setLoading(false);
          return;
        }
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (paymentMethod === 'mercadopago') {
        // Flujo MercadoPago con Cloud Functions
        const functions = getFunctions();
        const createPayment = httpsCallable(functions, 'createPaymentPreference');
        
        const result = await createPayment({
          orderId,
          items: cart,
          total: cartTotal,
          businessId: MENU_CONFIG.businessId,
          customerInfo
        });

        if (result.data.success) {
          // Redirigir a MercadoPago
          window.location.href = result.data.checkoutUrl;
        } else {
          throw new Error('Error al crear la preferencia de pago');
        }
      } else if (paymentMethod === 'efectivo') {
        // Flujo Efectivo - guardar directamente
        const db = getFirestore();
        await setDoc(doc(db, 'orders', orderId), {
          businessId: MENU_CONFIG.businessId,
          items: cart,
          customer: customerInfo,
          total: cartTotal,
          currency: 'ARS',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          notes: customerInfo.notes || ''
        });

        // Para pedidos en efectivo, el stock se actualizará cuando el admin
        // marque el pago como "pagado" en el panel de administración
        console.log('Cash order created, stock will be updated when payment is confirmed by admin');

        // Redirigir a confirmación
        window.location.href = `/confirmacion-pedido/${orderId}`;
      } else if (paymentMethod === 'transferencia') {
        // Flujo Transferencia - guardar directamente (funciona igual que efectivo)
        const db = getFirestore();
        await setDoc(doc(db, 'orders', orderId), {
          businessId: MENU_CONFIG.businessId,
          items: cart,
          customer: customerInfo,
          total: cartTotal,
          currency: 'ARS',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'transfer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          notes: customerInfo.notes || ''
        });

        // Para pedidos por transferencia, el stock se actualizará cuando el admin
        // marque el pago como "pagado" en el panel de administración
        console.log('Transfer order created, stock will be updated when payment is confirmed by admin');

        // Redirigir a confirmación
        window.location.href = `/confirmacion-pedido/${orderId}`;
      }
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      alert('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-flow">
      <h2>Finalizar Pedido</h2>
      
      {/* Validación de Stock */}
      {stockValidation && !stockValidation.isValid && (
        <div className="stock-validation-error">
          <h3>⚠️ Problemas de Stock</h3>
          {stockValidation.errors.map((error, index) => (
            <div key={index} className="stock-error">
              <strong>{error.itemName}</strong>: {error.message}
              {error.availableStock !== undefined && (
                <span> (Disponible: {error.availableStock})</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Advertencias de Stock */}
      {stockValidation && stockValidation.warnings.length > 0 && (
        <div className="stock-validation-warning">
          <h3>⚠️ Advertencias de Stock</h3>
          {stockValidation.warnings.map((warning, index) => (
            <div key={index} className="stock-warning">
              <strong>{warning.itemName}</strong>: {warning.message}
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Información del cliente */}
        <div className="customer-info">
          <h3>Información de contacto</h3>
          <input
            type="text"
            placeholder="Tu nombre"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Dirección (opcional)"
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
          />
          <textarea
            placeholder="Comentarios adicionales (opcional)"
            value={customerInfo.notes}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
          />
        </div>

        {/* Método de pago */}
        <div className="payment-methods">
          <h3>Método de pago</h3>
          
          <label>
            <input
              type="radio"
              value="mercadopago"
              checked={paymentMethod === 'mercadopago'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            💳 Pagar con MercadoPago
          </label>
          
          <label>
            <input
              type="radio"
              value="efectivo"
              checked={paymentMethod === 'efectivo'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            💵 Pagar en efectivo
          </label>

          <label>
            <input
              type="radio"
              value="transferencia"
              checked={paymentMethod === 'transferencia'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            🏦 Pagar por transferencia
          </label>
        </div>

        {/* Información bancaria - Solo mostrar si transferencia está seleccionada */}
        {paymentMethod === 'transferencia' && restaurant?.paymentMethods?.transfer && restaurant?.bankInfo && (
          <div className="bank-info-section">
            <h3>💳 Información para transferencia</h3>
            <p className="bank-info-instructions">
              Realiza la transferencia por el monto total y luego confirma tu pedido. 
              Una vez que verifiquemos el pago, procesaremos tu orden.
            </p>
            
            <div className="bank-details">
              {restaurant.bankInfo.cbu && (
                <div className="bank-detail-item">
                  <span className="bank-label">CBU:</span>
                  <span className="bank-value" onClick={() => copyToClipboard(restaurant.bankInfo.cbu)}>
                    {restaurant.bankInfo.cbu}
                  </span>
                  <button 
                    type="button"
                    className={`copy-btn ${copiedField === restaurant.bankInfo.cbu ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(restaurant.bankInfo.cbu)}
                    title="Copiar CBU"
                  >
                    {copiedField === restaurant.bankInfo.cbu ? '✅' : '📋'}
                  </button>
                </div>
              )}
              
              {restaurant.bankInfo.alias && (
                <div className="bank-detail-item">
                  <span className="bank-label">Alias:</span>
                  <span className="bank-value" onClick={() => copyToClipboard(restaurant.bankInfo.alias)}>
                    {restaurant.bankInfo.alias}
                  </span>
                  <button 
                    type="button"
                    className={`copy-btn ${copiedField === restaurant.bankInfo.alias ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(restaurant.bankInfo.alias)}
                    title="Copiar Alias"
                  >
                    {copiedField === restaurant.bankInfo.alias ? '✅' : '📋'}
                  </button>
                </div>
              )}
              
              {restaurant.bankInfo.bankName && (
                <div className="bank-detail-item">
                  <span className="bank-label">Banco:</span>
                  <span className="bank-value">{restaurant.bankInfo.bankName}</span>
                </div>
              )}
              
              {restaurant.bankInfo.accountHolder && (
                <div className="bank-detail-item">
                  <span className="bank-label">Titular:</span>
                  <span className="bank-value">{restaurant.bankInfo.accountHolder}</span>
                </div>
              )}
              
              <div className="bank-detail-item">
                <span className="bank-label">Monto:</span>
                <span className="bank-value total-amount">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Resumen del pedido */}
        <div className="order-summary">
          <h3>Resumen del pedido</h3>
          {cart.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-total">
            <strong>Total: ${cartTotal.toFixed(2)}</strong>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!paymentMethod || loading || (stockValidation && !stockValidation.isValid)}
          className="checkout-button"
        >
          {loading ? 'Procesando...' : 
           (stockValidation && !stockValidation.isValid) ? 'Revisa el stock' : 
           'Confirmar Pedido'}
        </button>
        
        {/* Debug info - remover en producción */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
            <strong>🐛 Debug Info:</strong><br/>
            Payment Method: {paymentMethod || 'NOT SELECTED'}<br/>
            Loading: {loading ? 'YES' : 'NO'}<br/>
            Stock Valid: {stockValidation ? (stockValidation.isValid ? 'YES' : 'NO') : 'NOT CHECKED'}<br/>
            Button Disabled: {(!paymentMethod || loading || (stockValidation && !stockValidation.isValid)) ? 'YES' : 'NO'}
          </div>
        )}
      </form>
    </div>
  );
}
