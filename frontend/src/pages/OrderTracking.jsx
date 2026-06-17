import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, Compass, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrder(id);
        setOrder(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container page-wrapper">
        <SkeletonLoader count={1} type="detail" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container page-wrapper text-center" style={{ padding: '100px 0' }}>
        <h2>TRANSMISSION INACCESSIBLE</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '20px 0' }}>This order is not registered to your account.</p>
        <Link to="/orders" className="btn-neon">Back to Orders</Link>
      </div>
    );
  }

  // Stepper Configurations
  const steps = [
    { label: 'Ordered', status: 'Pending', desc: 'Order placed, awaiting confirmation.', icon: ClipboardListIcon },
    { label: 'Processing', status: 'Processing', desc: 'Audio gears undergoing packaging and testing.', icon: Package },
    { label: 'Shipped', status: 'Shipped', desc: 'Acoustic payload dispatched to warp carrier.', icon: Truck },
    { label: 'Out for Delivery', status: 'Out for Delivery', desc: 'Carrier vehicle navigating to coordinates.', icon: Compass },
    { label: 'Delivered', status: 'Delivered', desc: 'Deliver completed successfully.', icon: CheckCircle2 },
  ];

  // Helper to determine the current status index
  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    const index = steps.findIndex(s => s.status.toLowerCase() === currentStatus.toLowerCase());
    return index;
  };

  const statusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="container page-wrapper order-tracking-page animated-fade-in">
      <div className="nav-breadcrumbs">
        <Link to="/orders">Orders</Link> <ChevronRight size={14} /> <span>Track #{order._id.substring(0, 10)}</span>
      </div>

      <div className="tracking-header glass-panel">
        <div>
          <h2>ORDER TRACKING</h2>
          <span className="order-date-tag">Staged on {new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="tracking-meta">
          <span>Status: </span>
          <span className={`status-text ${isCancelled ? 'cancelled' : ''}`}>{order.status}</span>
        </div>
      </div>

      {/* Stepper Component */}
      {!isCancelled ? (
        <div className="stepper-block glass-panel">
          <div className="stepper-horizontal">
            {steps.map((stepItem, idx) => {
              const Icon = stepItem.icon;
              const isCompleted = idx < statusIndex;
              const isActive = idx === statusIndex;
              const isPending = idx > statusIndex;

              return (
                <div key={idx} className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
                  <div className="step-bar-wrap">
                    {idx > 0 && <div className="step-connector-bar" />}
                  </div>
                  <div className="step-circle">
                    <Icon size={18} />
                  </div>
                  <div className="step-content">
                    <h4>{stepItem.label}</h4>
                    <p>{stepItem.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="cancelled-block glass-panel">
          <h3>⛔ TRANSACTION TERMINATED</h3>
          <p>This order has been cancelled and is no longer being tracked.</p>
        </div>
      )}

      {/* Grid: Delivery Info and Items Invoice */}
      <div className="tracking-details-grid">
        {/* Left: Items Invoice */}
        <section className="invoice-section glass-panel">
          <h3>INVOICE SPECIFICATIONS</h3>
          <div className="invoice-items">
            {order.orderItems.map((item) => (
              <div key={item.product} className="invoice-item">
                <img src={item.image} alt={item.name} />
                <div className="invoice-item-info">
                  <h4>{item.name}</h4>
                  <span>Qty: {item.qty} &times; ${item.price.toFixed(2)}</span>
                </div>
                <span className="invoice-item-subtotal">${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="invoice-summary">
            <div className="inv-row">
              <span>Items Subtotal:</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="inv-row">
              <span>Warp Shipping:</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="inv-row">
              <span>Tax (8%):</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="inv-row total-row">
              <span>Total Paid:</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Right: Coordinates */}
        <aside className="coordinates-sidebar glass-panel">
          <h3>DELIVERY COORDINATES</h3>
          <div className="coord-block">
            <h5>Recipient Address</h5>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="coord-block">
            <h5>Payment Signature</h5>
            <p>Method: {order.paymentMethod}</p>
            <p>Status: <span style={{ color: order.isPaid ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{order.isPaid ? 'VERIFIED (PAID)' : 'UNVERIFIED (UNPAID)'}</span></p>
            {order.paymentResult && (
              <p className="payment-id">ID: {order.paymentResult.id}</p>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        .nav-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-size: 0.85rem;
        }
        .nav-breadcrumbs a {
          transition: var(--transition);
        }
        .nav-breadcrumbs a:hover {
          color: var(--accent-neon);
        }
        .nav-breadcrumbs span {
          color: var(--text-muted);
        }
        
        .tracking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          margin-bottom: 32px;
        }
        .tracking-header h2 {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .order-date-tag {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .tracking-meta {
          font-family: var(--font-display);
          font-size: 0.95rem;
        }
        .status-text {
          color: var(--accent-neon);
          font-weight: 700;
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .status-text.cancelled {
          color: var(--danger);
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        /* Stepper Styles */
        .stepper-block {
          padding: 40px 32px;
          margin-bottom: 40px;
          overflow-x: auto;
        }
        .stepper-horizontal {
          display: flex;
          justify-content: space-between;
          width: 100%;
          min-width: 750px;
        }
        .step-node {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }
        .step-bar-wrap {
          position: absolute;
          left: -50%;
          right: 50%;
          top: 20px;
          height: 3px;
          z-index: 1;
        }
        .step-connector-bar {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.05);
          transition: var(--transition);
        }
        .step-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          transition: var(--transition);
        }
        
        /* Node states coloring */
        .step-node.completed .step-circle {
          background: var(--bg-secondary);
          border-color: var(--accent-neon);
          color: var(--accent-neon);
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.15);
        }
        .step-node.completed .step-connector-bar {
          background: var(--accent-neon);
          box-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .step-node.active .step-circle {
          background: var(--accent-neon);
          border-color: var(--accent-neon);
          color: #000;
          box-shadow: var(--shadow-neon);
        }
        .step-node.active .step-connector-bar {
          background: var(--accent-neon);
        }
        
        .step-content {
          margin-top: 16px;
          padding: 0 16px;
        }
        .step-content h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 6px;
          transition: var(--transition);
        }
        .step-node.active .step-content h4 {
          color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .step-content p {
          color: var(--text-secondary);
          font-size: 0.75rem;
          line-height: 1.4;
        }
        
        .cancelled-block {
          padding: 40px;
          text-align: center;
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.02);
          margin-bottom: 40px;
        }
        .cancelled-block h3 {
          color: var(--danger);
          margin-bottom: 12px;
        }
        .cancelled-block p {
          color: var(--text-secondary);
        }

        /* Detail invoice grids */
        .tracking-details-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }
        .invoice-section, .coordinates-sidebar {
          padding: 32px;
        }
        .invoice-section h3, .coordinates-sidebar h3 {
          font-size: 1.15rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .invoice-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .invoice-item {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .invoice-item img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .invoice-item-info {
          flex-grow: 1;
        }
        .invoice-item-info h4 {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .invoice-item-info span {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .invoice-item-subtotal {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
        }
        
        .invoice-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .inv-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .invoice-summary .total-row {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 16px;
          margin-top: 12px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }

        .coord-block {
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 20px;
        }
        .coord-block:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }
        .coord-block h5 {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }
        .coord-block p {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.5;
        }
        .payment-id {
          font-size: 0.75rem !important;
          color: var(--text-muted) !important;
          margin-top: 6px;
        }

        @media (max-width: 992px) {
          .tracking-details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Clipboard icon helper for ordered state (lucide doesn't bundle ClipboardList as is sometimes)
const ClipboardListIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M9 14h6"/>
    <path d="M9 18h6"/>
    <path d="M9 10h6"/>
  </svg>
);

export default OrderTracking;
