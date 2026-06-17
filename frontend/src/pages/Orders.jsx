import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, Eye } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container page-wrapper orders-page animated-fade-in">
      <h1 className="orders-title">ORDER <span>TRANSMISSIONS</span></h1>

      {loading ? (
        <div className="glass-panel" style={{ padding: '40px' }}>
          <SkeletonLoader count={3} type="list" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders glass-panel">
          <ClipboardList size={48} className="empty-icon" />
          <h3>NO ORDERS RECORDED</h3>
          <p>You have not placed any orders yet.</p>
          <Link to="/shop" className="btn-neon">
            Visit Shop
          </Link>
        </div>
      ) : (
        <div className="orders-list-wrapper">
          {orders.map((order) => {
            const statusClass = order.status.toLowerCase().replace(/ /g, '-');
            return (
              <div key={order._id} className="order-row-card glass-panel">
                <div className="order-main-info">
                  <div className="info-item">
                    <span>Order Hash</span>
                    <span className="hash-val">#{order._id.substring(0, 10)}...</span>
                  </div>
                  <div className="info-item">
                    <span>Transmission Date</span>
                    <span className="info-val">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span>Total Cost</span>
                    <span className="price-val">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-status-info">
                  <div className="status-block">
                    <span>Payment:</span>
                    <span className={`badge-status ${order.isPaid ? 'paid' : 'unpaid'}`}>
                      {order.isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                  <div className="status-block">
                    <span>Delivery:</span>
                    <span className={`badge-status delivery-${statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-actions">
                  <Link to={`/orders/track/${order._id}`} className="btn-neon order-track-btn">
                    Track Order <ArrowRight size={14} />
                  </Link>
                  <Link to={`/orders/track/${order._id}`} className="btn-icon-only" title="View details">
                    <Eye size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .orders-title {
          font-size: 2.2rem;
          margin-bottom: 40px;
          text-align: center;
        }
        .orders-title span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }

        .empty-orders {
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
        .empty-orders h3 {
          margin-bottom: 12px;
        }
        .empty-orders p {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .orders-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .order-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          gap: 32px;
        }
        .order-main-info {
          display: flex;
          gap: 40px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-item span:first-child {
          color: var(--text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .hash-val {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--accent-neon);
        }
        .info-val {
          font-size: 0.95rem;
          font-weight: 600;
        }
        .price-val {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
        }

        .order-status-info {
          display: flex;
          gap: 32px;
        }
        .status-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .status-block span:first-child {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .badge-status {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 4px;
          text-align: center;
        }
        .badge-status.paid {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .badge-status.unpaid {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .badge-status.delivery-pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .badge-status.delivery-processing {
          background: rgba(57, 255, 20, 0.05);
          color: var(--accent-neon);
          border: 1px solid rgba(57, 255, 20, 0.2);
        }
        .badge-status.delivery-shipped {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .badge-status.delivery-out-for-delivery {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .badge-status.delivery-delivered {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .badge-status.delivery-cancelled {
          background: rgba(107, 114, 128, 0.1);
          color: var(--text-muted);
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .order-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .order-track-btn {
          font-size: 0.75rem;
          padding: 8px 16px;
        }
        .btn-icon-only {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .btn-icon-only:hover {
          color: var(--accent-neon);
          border-color: var(--border-glass-hover);
        }

        @media (max-width: 992px) {
          .order-row-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px;
            gap: 20px;
          }
          .order-main-info {
            width: 100%;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
          }
          .order-status-info {
            width: 100%;
            justify-content: space-between;
          }
          .order-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;
