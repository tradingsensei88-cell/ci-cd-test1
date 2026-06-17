import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

const Checkout = () => {
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const showToast = useToast();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      showToast('Staging area empty. Add items to checkout.', 'error');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Shipping Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  // Simulated Payment Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [paymentMode, setPaymentMode] = useState(null); // 'stripe' or 'mock'
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Shipping, 2 = Payment Selection / Simulator

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      showToast('Please fulfill all shipping parameters', 'error');
      return;
    }
    // Proceed to payment gateway initialization
    initializePaymentGateway();
  };

  const initializePaymentGateway = async () => {
    setLoading(true);
    try {
      // Create session
      const session = await api.createCheckoutSession(cartItems);
      setPaymentMode(session.mode);

      if (session.mode === 'stripe') {
        showToast('Redirecting to Stripe secure checkout...', 'info');
        window.location.href = session.url; // Redirect to Stripe checkout page
      } else {
        // Mock Stripe active. Switch step to payment simulator form
        showToast('Initializing simulated Stripe payments...', 'info');
        setStep(2);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      showToast('Please fulfill all card parameters', 'error');
      return;
    }

    setLoading(true);
    // Simulate transaction latency
    setTimeout(async () => {
      try {
        const orderData = {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod: 'Stripe (Simulated)',
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          paymentResult: {
            id: `ch_sim_${Math.random().toString(36).substring(2, 12)}`,
            status: 'succeeded',
            update_time: new Date().toISOString(),
            email_address: 'simulated@stripe.com',
          },
        };

        const createdOrder = await api.createOrder(orderData);
        clearCart();
        showToast('Sonic payment transaction authorized!', 'success');
        navigate(`/orders/track/${createdOrder._id}`);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }, 2500); // 2.5s simulated decryption & payment confirmation
  };

  return (
    <div className="container page-wrapper checkout-page animated-fade-in">
      <h1 className="checkout-title">SECURE <span>CHECKOUT</span> TUNNEL</h1>

      <div className="checkout-container">
        {/* Step 1: Shipping Address Form */}
        {step === 1 && (
          <div className="checkout-form-block glass-panel animated-fade-in">
            <h3><Truck size={18} /> DELIVERY COORDINATES</h3>
            <form onSubmit={handleShippingSubmit}>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 104 Neon Boulevard, Suite 50"
                  className="form-control"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Neo Tokyo"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code / ZIP</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 100-0001"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  placeholder="e.g. Japan"
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon-filled checkout-btn"
              >
                {loading ? 'INITIALIZING CHANNELS...' : 'PROCEED TO PAYMENT'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Fallback Mock Stripe Simulator Page */}
        {step === 2 && (
          <div className="checkout-form-block glass-panel animated-fade-in">
            <div className="simulator-header">
              <CreditCard size={20} className="sim-icon" />
              <h3>STRIPE SECURE CARD SIMULATOR</h3>
            </div>
            
            <p className="sim-alert">
              ⚠️ Stripe API key is currently unconfigured. Running in visual simulation mode. Card details will be processed securely on client-side simulation.
            </p>

            {loading ? (
              <div className="sim-loader-block">
                <div className="loading-spinner" />
                <h4>ENCRYPTING TRANSACTION DATA</h4>
                <p>Establishing secure handshake with Stripe test processor...</p>
              </div>
            ) : (
              <form onSubmit={handleMockPaymentSubmit}>
                <div className="form-group">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                    className="form-control"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV / CVC</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength="3"
                      className="form-control"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-neon-filled checkout-btn">
                  AUTHORIZE PAYMENT OF ${totalPrice.toFixed(2)}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Sidebar: Order Summary */}
        <aside className="checkout-summary-pane glass-panel">
          <h3>SUMMARY</h3>
          <div className="items-preview-list">
            {cartItems.map((item) => (
              <div key={item.product} className="item-preview">
                <img src={item.image} alt={item.name} />
                <div className="item-preview-text">
                  <h5>{item.name}</h5>
                  <span>{item.qty} &times; ${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Items Total:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Warp Shipping:</span>
              <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Acoustical Tax (8%):</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Price:</span>
              <span className="total-val">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .checkout-title {
          font-size: 2.2rem;
          margin-bottom: 40px;
          text-align: center;
        }
        .checkout-title span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }

        .checkout-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          align-items: start;
        }
        
        .checkout-form-block {
          padding: 40px;
        }
        .checkout-form-block h3 {
          font-size: 1.25rem;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .checkout-btn {
          width: 100%;
          margin-top: 24px;
          padding: 14px;
        }

        /* Simulator Styles */
        .simulator-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .sim-icon {
          color: var(--accent-neon);
        }
        .sim-alert {
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: var(--warning);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .sim-loader-block {
          text-align: center;
          padding: 60px 0;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(57, 255, 20, 0.1);
          border-top-color: var(--accent-neon);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        .sim-loader-block h4 {
          font-size: 1.1rem;
          color: var(--accent-neon);
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        .sim-loader-block p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* Summary Sidebar */
        .checkout-summary-pane {
          padding: 32px;
        }
        .checkout-summary-pane h3 {
          font-size: 1.2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .items-preview-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
          max-height: 200px;
          overflow-y: auto;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 16px;
        }
        .item-preview {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .item-preview img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .item-preview-text h5 {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.3;
        }
        .item-preview-text span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 992px) {
          .checkout-container {
            grid-template-columns: 1fr;
          }
          .checkout-summary-pane {
            order: -1;
          }
        }
        @media (max-width: 576px) {
          .checkout-form-block {
            padding: 24px;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
