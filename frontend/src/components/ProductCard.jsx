import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const showToast = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.countInStock > 0) {
      addToCart(product, 1);
      showToast(`${product.name} added to cart!`, 'success');
    } else {
      showToast(`${product.name} is currently out of stock`, 'error');
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (isInWishlist(product._id)) {
      showToast(`${product.name} removed from wishlist`, 'info');
    } else {
      showToast(`${product.name} added to wishlist!`, 'success');
    }
  };

  const hasDiscount = product.discountPrice > 0;
  const activePrice = hasDiscount ? product.discountPrice : product.price;
  const isWishlisted = isInWishlist(product._id);
  const isOutOfStock = product.countInStock === 0;

  return (
    <div className={`product-card glass-panel ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      <Link to={`/products/${product._id}`}>
        <div className="product-image-container">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/400x400/121216/39FF14?text=Headphone'}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="sale-badge">SALE</span>
          )}
          {isOutOfStock && (
            <span className="stock-badge-tag">OUT OF STOCK</span>
          )}
          <button
            className={`wishlist-badge-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'var(--accent-neon)' : 'none'} />
          </button>
        </div>

        <div className="product-info-container">
          <span className="product-card-brand">{product.brand}</span>
          <h3 className="product-card-title">{product.name}</h3>

          <div className="product-card-rating">
            <span className="star-icon"><Star size={14} fill="currentColor" /></span>
            <span className="rating-val">{product.rating}</span>
            <span className="rating-count">({product.numReviews})</span>
          </div>

          <div className="product-card-footer">
            <div className="product-card-pricing">
              {hasDiscount ? (
                <>
                  <span className="price-current">${product.discountPrice.toFixed(2)}</span>
                  <span className="price-old">${product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="price-current">${product.price.toFixed(2)}</span>
              )}
            </div>

            <button
              className="btn-card-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>

      <style>{`
        .product-card {
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .product-image-container {
          position: relative;
          padding-top: 100%; /* 1:1 Aspect Ratio */
          background: rgba(255, 255, 255, 0.01);
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .product-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .product-card:hover .product-img {
          transform: scale(1.08);
        }
        .sale-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--accent-neon);
          color: #000;
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          box-shadow: 0 0 10px var(--accent-neon-glow);
          z-index: 2;
        }
        .stock-badge-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--danger);
          color: #fff;
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          z-index: 2;
        }
        .wishlist-badge-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(10, 10, 12, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: var(--transition);
          z-index: 2;
        }
        .wishlist-badge-btn:hover {
          background: rgba(10, 10, 12, 0.9);
          border-color: var(--accent-neon);
          color: var(--accent-neon);
          box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
        }
        .wishlist-badge-btn.active {
          color: var(--accent-neon);
          border-color: var(--border-glass-hover);
        }
        .product-info-container {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .product-card-brand {
          font-family: var(--font-display);
          font-size: 0.75rem;
          color: var(--accent-neon);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }
        .product-card-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 10px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-card-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 18px;
        }
        .star-icon {
          color: var(--accent-neon);
          display: flex;
        }
        .rating-val {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-primary);
        }
        .rating-count {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .product-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }
        .product-card-pricing {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .price-current {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
        }
        .price-old {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .btn-card-cart {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(57, 255, 20, 0.05);
          border: 1px solid rgba(57, 255, 20, 0.2);
          color: var(--accent-neon);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .btn-card-cart:hover {
          background: var(--accent-neon);
          color: #000;
          box-shadow: 0 0 10px var(--accent-neon-glow);
          border-color: var(--accent-neon);
        }
        .btn-card-cart:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          color: var(--text-muted);
          border-color: rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
        }
        .out-of-stock-card {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
