import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const Cart = () => {
  const { cartItems, removeFromCart, updateCartQty, itemsPrice, shippingPrice, taxPrice, totalPrice } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (user) {
      navigate('/checkout');
    } else {
      // Redirect to profile with redirect query to redirect back after login
      navigate('/profile?redirect=checkout');
    }
  };

  return (
    <div className="container page-wrapper cart-page animated-fade-in">
      <h1 className="cart-title">YOUR <span>SONIC</span> REPOSITORIES</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart glass-panel">
          <ShoppingBag size={48} className="empty-icon" />
          <h3>YOUR CART CONTAINER IS EMPTY</h3>
          <p>You have not staged any premium acoustic headphones for checkout.</p>
          <Link to="/shop" className="btn-neon">
            Back to Registry
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items-col">
            {cartItems.map((item) => (
              <div key={item.product} className="cart-item glass-panel">
                <div className="item-img-wrap">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="item-info">
                  <Link to={`/products/${item.product}`} className="item-name">
                    {item.name}
                  </Link>
                  <span className="item-stock-status">
                    {item.countInStock > 0 ? 'Staged in Stock' : 'OutOfStock'}
                  </span>
                </div>

                <div className="item-pricing">
                  <span className="item-price">${item.price.toFixed(2)}</span>
                </div>

                <div className="item-controls">
                  <select
                    value={item.qty}
                    onChange={(e) => updateCartQty(item.product, Number(e.target.value))}
                    className="form-control qty-select"
                  >
                    {Array.from({ length: item.countInStock }).slice(0, 10).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="remove-item-btn"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Pane */}
          <aside className="summary-col glass-panel">
            <h3>ORDER SYNAPSE</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Warp Shipping:</span>
              <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span className="total-val">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="btn-neon-filled checkout-action-btn"
            >
              Secure Checkout <ArrowRight size={16} />
            </button>

            <p className="checkout-badge-note">
              🔐 256-bit encrypted checkout channel
            </p>
          </aside>
        </div>
      )}

      <style>{`
        .cart-title {
          font-size: 2.2rem;
          margin-bottom: 40px;
          text-align: center;
        }
        .cart-title span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }
        
        .empty-cart {
          padding: 64px 32px;
          text-align: center;
          border-radius: var(--radius-lg);
          max-width: 600px;
          margin: 0 auto;
        }
        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .empty-cart h3 {
          margin-bottom: 12px;
        }
        .empty-cart p {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 40px;
          align-items: start;
        }
        .cart-items-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cart-item {
          display: flex;
          align-items: center;
          padding: 20px;
          gap: 24px;
        }
        .item-img-wrap {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }
        .item-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-info {
          flex-grow: 1;
        }
        .item-name {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin-bottom: 6px;
          transition: var(--transition);
        }
        .item-name:hover {
          color: var(--accent-neon);
        }
        .item-stock-status {
          font-size: 0.8rem;
          color: var(--accent-neon);
        }
        .item-pricing {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
        }
        .item-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .qty-select {
          width: 70px;
          height: 38px;
          padding: 6px;
        }
        .remove-item-btn {
          color: var(--text-muted);
          transition: var(--transition);
          padding: 8px;
          border-radius: var(--radius-sm);
        }
        .remove-item-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.05);
        }

        .summary-col {
          padding: 32px;
        }
        .summary-col h3 {
          font-size: 1.2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .total-row {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 20px;
          margin-top: 20px;
          color: var(--text-primary);
        }
        .total-val {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.4rem;
          color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .checkout-action-btn {
          width: 100%;
          margin: 24px 0 16px;
        }
        .checkout-badge-note {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
        }

        @media (max-width: 992px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .cart-item {
            flex-direction: column;
            text-align: center;
          }
          .item-controls {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
