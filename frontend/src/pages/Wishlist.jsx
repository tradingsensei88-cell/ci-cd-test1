import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const Wishlist = () => {
  const { wishlistItems } = useContext(WishlistContext);

  return (
    <div className="container page-wrapper wishlist-page animated-fade-in">
      <h1 className="wishlist-title">MY <span>SAVED</span> ACOUSTICS</h1>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist glass-panel">
          <Heart size={48} className="empty-icon" />
          <h3>WISHLIST MATRIX EMPTY</h3>
          <p>You have not tagged any products for monitoring yet.</p>
          <Link to="/shop" className="btn-neon">
            Explore Registry
          </Link>
        </div>
      ) : (
        <div className="wishlist-products-grid">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <style>{`
        .wishlist-title {
          font-size: 2.2rem;
          margin-bottom: 40px;
          text-align: center;
        }
        .wishlist-title span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }
        
        .empty-wishlist {
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
        .empty-wishlist h3 {
          margin-bottom: 12px;
        }
        .empty-wishlist p {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .wishlist-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 992px) {
          .wishlist-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .wishlist-products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
