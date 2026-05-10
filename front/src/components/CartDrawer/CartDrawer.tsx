import React, { useState } from 'react';
import { FaTimes, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import styles from './CartDrawer.module.scss';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeItem, updateQty, applyCoupon, removeCoupon, itemCount, subtotal } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const tax = subtotal * 0.18;
  const shipping = subtotal >= 5000 ? 0 : 50;
  const total = Math.max(0, subtotal + tax + shipping - cart.discount);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === 'ISO10') {
      applyCoupon(code, subtotal * 0.1);
      showToast('Cupón aplicado: 10% de descuento', 'success');
    } else if (code === 'PROEVOL20') {
      applyCoupon(code, subtotal * 0.2);
      showToast('Cupón aplicado: 20% de descuento', 'success');
    } else {
      showToast('Cupón inválido', 'error');
    }
    setCouponInput('');
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Carrito ({itemCount})</h2>
          <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
        </div>

        <div className={styles.items}>
          {cart.items.length === 0 ? (
            <div className={styles.emptyCart}>
              <FaShoppingCart />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <div className={styles.itemImage}>
                  <FaShoppingCart />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                  <div className={styles.qtyControl}>
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.productId)}>
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.couponRow}>
              <input
                type="text" placeholder="Cupón de descuento"
                value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <button onClick={handleApplyCoupon}>Aplicar</button>
            </div>

            {cart.couponCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13, color: '#10b981' }}>
                <span>Cupón: <strong>{cart.couponCode}</strong> (-{formatPrice(cart.discount)})</span>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>Quitar</button>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>IGV (18%)</span><span>{formatPrice(tax)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envío</span><span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>

            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Ir al Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
