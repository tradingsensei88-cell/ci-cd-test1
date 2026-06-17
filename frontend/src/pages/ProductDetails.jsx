import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Shield, RotateCcw, Truck, MessageSquare } from 'lucide-react';
import { api } from '../services/api.js';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  
  const showToast = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const data = await api.getProduct(id);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0]);
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
      showToast('Product not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.countInStock > 0) {
      addToCart(product, quantity);
      showToast(`${quantity} ${product.name} added to cart!`, 'success');
    }
  };

  const handleWishlist = () => {
    if (product) {
      toggleWishlist(product);
      if (isInWishlist(product._id)) {
        showToast(`${product.name} removed from wishlist`, 'info');
      } else {
        showToast(`${product.name} added to wishlist!`, 'success');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      showToast('Please type a review comment', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.addProductReview(product._id, { rating, comment });
      showToast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
      // Reload details
      fetchProductDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="detail" />;
  }

  if (!product) {
    return (
      <div className="container page-wrapper text-center" style={{ padding: '100px 0' }}>
        <h2>PRODUCT DEPRECIATED OR INACCESSIBLE</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '20px 0' }}>This item may have been removed from the directory.</p>
        <Link to="/shop" className="btn-neon">Back to Shop</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const isOutOfStock = product.countInStock === 0;
  const hasDiscount = product.discountPrice > 0;
  const saving = hasDiscount ? product.price - product.discountPrice : 0;
  
  // Format specifications map/object safely
  const specList = product.specifications 
    ? (product.specifications instanceof Map 
       ? Array.from(product.specifications.entries()) 
       : Object.entries(product.specifications))
    : [];

  return (
    <div className="container page-wrapper product-detail-page animated-fade-in">
      <Link to="/shop" className="back-link">&larr; Back to Shop</Link>

      <div className="detail-layout">
        {/* Gallery Column */}
        <div className="gallery-col">
          <div className="main-image-panel glass-panel">
            <img src={activeImage} alt={product.name} className="main-img" />
          </div>
          <div className="thumbnails-row">
            {product.images && product.images.map((img, i) => (
              <button
                key={i}
                className={`thumb-btn glass-panel ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`thumbnail ${i}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="info-col glass-panel">
          <span className="brand-badge">{product.brand}</span>
          <h1 className="product-title">{product.name}</h1>

          {/* Rating Summary */}
          <div className="rating-summary">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating) ? 'var(--accent-neon)' : 'none'}
                  color="var(--accent-neon)"
                />
              ))}
              <span className="rating-score">{product.rating}</span>
            </div>
            <span className="reviews-count">({product.numReviews} Verified Reviews)</span>
          </div>

          {/* Pricing Box */}
          <div className="price-box">
            {hasDiscount ? (
              <>
                <div className="prices">
                  <span className="price-current">${product.discountPrice.toFixed(2)}</span>
                  <span className="price-old">${product.price.toFixed(2)}</span>
                </div>
                <span className="saving-badge">SAVE ${saving.toFixed(2)}</span>
              </>
            ) : (
              <span className="price-current">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          {/* Purchase Controller */}
          <div className="purchase-controls">
            <div className="stock-info">
              <span>Availability:</span>
              <span className={`stock-status ${isOutOfStock ? 'out' : 'in'}`}>
                {isOutOfStock ? 'OUT OF STOCK' : `IN STOCK (${product.countInStock} units)`}
              </span>
            </div>

            {!isOutOfStock && (
              <div className="qty-selector">
                <label>Qty:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-control qty-select"
                >
                  {Array.from({ length: product.countInStock }).slice(0, 10).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="action-row">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-neon-filled cart-btn"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button
                onClick={handleWishlist}
                className={`btn-neon-secondary wishlist-btn ${isWishlisted ? 'active' : ''}`}
              >
                <Heart size={18} fill={isWishlisted ? 'var(--accent-neon)' : 'none'} />
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>
          </div>

          {/* Delivery Props */}
          <div className="delivery-props">
            <div className="prop-item">
              <Truck size={18} className="prop-icon" />
              <div>
                <h5>Free Warp Delivery</h5>
                <p>Express 2-day delivery on orders over $150.</p>
              </div>
            </div>
            <div className="prop-item">
              <RotateCcw size={18} className="prop-icon" />
              <div>
                <h5>30-Day Sonic Guarantee</h5>
                <p>Risk-free trial. Return if not fully satisfied.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews Tabs */}
      <div className="specs-reviews-layout">
        {/* Specs Column */}
        <section className="specs-section glass-panel">
          <h3>TECHNICAL PARAMETERS</h3>
          {specList.length > 0 ? (
            <table className="specs-table">
              <tbody>
                {specList.map(([key, value]) => (
                  <tr key={key}>
                    <td className="spec-name">{key}</td>
                    <td className="spec-val">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Specifications not registered.</p>
          )}
        </section>

        {/* Reviews Column */}
        <section className="reviews-section glass-panel">
          <h3>FEEDBACK DECK</h3>
          <div className="reviews-list">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev._id} className="review-item">
                  <div className="review-header">
                    <h5>{rev.name}</h5>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? 'var(--accent-neon)' : 'none'}
                          color="var(--accent-neon)"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: '20px 0' }}>
                No feedback transmission received for this model yet. Be the first to review!
              </p>
            )}
          </div>

          {/* Post Review Form */}
          <div className="post-review-block">
            <h4>TRANSMIT FEEDBACK</h4>
            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Sonic Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="form-control"
                  >
                    <option value="5">5 Stars (Acoustic Masterpiece)</option>
                    <option value="4">4 Stars (Great Sound)</option>
                    <option value="3">3 Stars (Satisfactory)</option>
                    <option value="2">2 Stars (Lacks Definition)</option>
                    <option value="1">1 Star (Substandard Acoustics)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    rows="4"
                    placeholder="Describe your sound experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-neon filter-apply-btn"
                >
                  <MessageSquare size={16} /> {submittingReview ? 'Transmitting...' : 'Send Review'}
                </button>
              </form>
            ) : (
              <div className="login-to-review glass-panel">
                <p>You must authenticate to write reviews.</p>
                <Link to="/profile" className="btn-neon">Sign In Now</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .back-link {
          display: inline-block;
          margin-bottom: 24px;
          color: var(--text-secondary);
          transition: var(--transition);
          font-family: var(--font-display);
          font-size: 0.85rem;
        }
        .back-link:hover {
          color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        
        .detail-layout {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
          align-items: start;
        }
        .gallery-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .main-image-panel {
          padding: 0;
          overflow: hidden;
          position: relative;
          padding-top: 85%; /* slightly wider */
        }
        .main-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumbnails-row {
          display: flex;
          gap: 16px;
        }
        .thumb-btn {
          width: 80px;
          height: 80px;
          padding: 0;
          overflow: hidden;
        }
        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        .thumb-btn:hover img {
          transform: scale(1.05);
        }
        .thumb-btn.active {
          border-color: var(--accent-neon);
          box-shadow: 0 0 10px var(--accent-neon-glow);
        }

        .info-col {
          padding: 40px;
        }
        .brand-badge {
          color: var(--accent-neon);
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: inline-block;
        }
        .product-title {
          font-size: 2.2rem;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .rating-summary {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .rating-score {
          font-weight: 700;
          margin-left: 8px;
          font-size: 0.95rem;
        }
        .reviews-count {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .price-box {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
        }
        .prices {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .saving-badge {
          background: var(--accent-neon);
          color: #000;
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          box-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .product-description {
          color: var(--text-secondary);
          margin-bottom: 32px;
          font-size: 1.02rem;
          line-height: 1.7;
        }
        .purchase-controls {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 32px;
          margin-bottom: 32px;
        }
        .stock-info {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
          font-size: 0.95rem;
        }
        .stock-status {
          font-weight: 700;
          font-family: var(--font-display);
        }
        .stock-status.in { color: var(--accent-neon); }
        .stock-status.out { color: var(--danger); }
        
        .qty-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .qty-select {
          width: 80px;
          height: 38px;
        }
        .action-row {
          display: flex;
          gap: 16px;
        }
        .cart-btn {
          flex: 1;
        }
        .wishlist-btn.active {
          border-color: var(--accent-neon);
          color: var(--accent-neon);
          box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);
        }

        .delivery-props {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .prop-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .prop-icon {
          color: var(--accent-neon);
          margin-top: 4px;
          filter: drop-shadow(0 0 4px var(--accent-neon-glow));
        }
        .prop-item h5 {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .prop-item p {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        /* Specs & Reviews tab section */
        .specs-reviews-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
        }
        .specs-section, .reviews-section {
          padding: 32px;
        }
        .specs-section h3, .reviews-section h3 {
          font-size: 1.2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }
        .specs-table tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .specs-table tr:last-child {
          border-bottom: none;
        }
        .specs-table td {
          padding: 16px 10px;
          font-size: 0.95rem;
        }
        .spec-name {
          color: var(--text-muted);
          width: 40%;
          font-weight: 500;
        }
        .spec-val {
          color: var(--text-primary);
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 40px;
          padding-right: 10px;
        }
        .review-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 16px;
        }
        .review-item:last-child {
          border-bottom: none;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .review-header h5 {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
        }
        .review-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 10px;
        }
        .review-comment {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .post-review-block {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 32px;
        }
        .post-review-block h4 {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        .login-to-review {
          padding: 24px;
          text-align: center;
        }
        .login-to-review p {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        @media (max-width: 992px) {
          .detail-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .specs-reviews-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
