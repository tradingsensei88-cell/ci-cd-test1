import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const prodData = await api.getProducts();
        const catData = await api.getCategories();
        
        // Filter featured and new arrivals
        setFeaturedProducts(prodData.filter(p => p.isFeatured).slice(0, 4));
        setNewArrivals(prodData.filter(p => p.isNewArrival).slice(0, 4));
        setCategories(catData.slice(0, 4));
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const testimonials = [
    { name: 'Sarah K.', role: 'Music Producer', rating: 5, text: 'The frequency response on the Aetheris Pro is astonishingly flat. Studio quality, untethered.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name: 'Marcus T.', role: 'Competitive Gamer', rating: 5, text: 'Immersive spatial tracking. I can pinpoint opponents with footstep haptics. Unfair advantage!', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Elena R.', role: 'Daily Commuter', rating: 4.8, text: 'Hybrid ANC blocks out the subway rumble completely. Battery lasted me a full two weeks of commutes.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="home-page animated-fade-in">
      {/* Hero Showcase Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content glass-panel">
            <span className="hero-subtitle"><Sparkles size={16} /> UNCOMPROMISING SONIC FUTURE</span>
            <h1 className="hero-title">NEXT-GEN <span>NEON</span> AUDIO</h1>
            <p className="hero-description">
              Step into the acoustic slipstream. Immerse yourself in hyper-detailed soundstages engineered with advanced beryllium drivers and active glassmorphic noise cancellation.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-neon-filled">
                Explore Shop <ShoppingBag size={18} />
              </Link>
              <Link to="/shop?category=Over-Ear" className="btn-neon-secondary">
                View Over-Ear
              </Link>
            </div>
          </div>
          <div className="hero-media">
            <div className="hero-glow-back" />
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
              alt="AetherSound Premium Headphones"
              className="hero-img"
            />
          </div>
        </div>
      </section>

      {/* Tech Features Value Prop */}
      <section className="value-section container">
        <div className="value-grid">
          <div className="value-card glass-panel">
            <Zap className="val-icon" />
            <h3>Spatial Haptics</h3>
            <p>Precise real-time audio vibrations for gaming and movies.</p>
          </div>
          <div className="value-card glass-panel">
            <ShieldCheck className="val-icon" />
            <h3>Beryllium Drivers</h3>
            <p>Ultra-low distortion transducers for studio acoustics.</p>
          </div>
          <div className="value-card glass-panel">
            <Sparkles className="val-icon" />
            <h3>45h Endurance</h3>
            <p>Industry-leading battery capacity with warp charging.</p>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="categories-section container">
        <div className="section-title">
          <h2>Sound Profiles</h2>
          <p>Curated Acoustical Configurations</p>
        </div>
        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link to={`/shop?category=${cat.name}`} key={cat._id} className="category-tile glass-panel">
                <div className="cat-img-wrap">
                  <img src={cat.image} alt={cat.name} className="cat-img" />
                  <div className="cat-overlay" />
                </div>
                <div className="cat-text">
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <span className="cat-link">Configure <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))
          ) : (
            defaultCategoriesFallback().map((cat) => (
              <Link to={`/shop?category=${cat.name}`} key={cat.name} className="category-tile glass-panel">
                <div className="cat-img-wrap">
                  <img src={cat.image} alt={cat.name} className="cat-img" />
                  <div className="cat-overlay" />
                </div>
                <div className="cat-text">
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <span className="cat-link">Configure <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="featured-section container">
        <div className="section-title">
          <h2>Featured Acoustics</h2>
          <p>Selected Premium Offerings</p>
        </div>
        <div className="products-grid">
          {loading ? (
            <SkeletonLoader count={4} type="card" />
          ) : (
            featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bestsellers-section container">
        <div className="section-title">
          <h2>New Sounddrops</h2>
          <p>Fresh Audio Releases</p>
        </div>
        <div className="products-grid">
          {loading ? (
            <SkeletonLoader count={4} type="card" />
          ) : (
            newArrivals.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-title">
            <h2>The Resonance</h2>
            <p>Verified Sound Reviews</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card glass-panel">
                <div className="test-header">
                  <img src={t.img} alt={t.name} className="test-img" />
                  <div>
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={14}
                      fill={si < Math.floor(t.rating) ? 'var(--accent-neon)' : 'none'}
                      color="var(--accent-neon)"
                    />
                  ))}
                  <span style={{ marginLeft: '8px', fontSize: '0.85rem' }}>{t.rating}</span>
                </div>
                <p className="test-text">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .home-page {
          padding-bottom: 80px;
        }
        /* Hero Styling */
        .hero-section {
          position: relative;
          padding: 80px 0 100px;
          overflow: hidden;
          background: radial-gradient(circle at 80% 20%, rgba(57, 255, 20, 0.05) 0%, transparent 50%);
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          align-items: center;
          gap: 64px;
        }
        .hero-content {
          padding: 48px;
          border-radius: var(--radius-lg);
          z-index: 2;
        }
        .hero-subtitle {
          color: var(--accent-neon);
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 2.5px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .hero-title span {
          color: var(--accent-neon);
          text-shadow: 0 0 20px var(--accent-neon-glow);
        }
        .hero-description {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .hero-actions {
          display: flex;
          gap: 20px;
        }
        .hero-media {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-img {
          width: 90%;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          position: relative;
          z-index: 1;
        }
        .hero-glow-back {
          position: absolute;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, var(--accent-neon-glow) 0%, transparent 60%);
          filter: blur(40px);
          z-index: 0;
          opacity: 0.4;
          animation: pulseNeon 6s infinite;
        }

        /* Value Props */
        .value-section {
          margin-bottom: 80px;
        }
        .value-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .value-card {
          padding: 32px;
          text-align: center;
        }
        .val-icon {
          color: var(--accent-neon);
          width: 32px;
          height: 32px;
          margin-bottom: 20px;
          filter: drop-shadow(0 0 5px var(--accent-neon-glow));
        }
        .value-card h3 {
          font-size: 1.2rem;
          margin-bottom: 12px;
        }
        .value-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        /* Categories Section */
        .categories-section {
          margin-bottom: 100px;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        .category-tile {
          display: flex;
          height: 200px;
          overflow: hidden;
          padding: 0;
          cursor: pointer;
        }
        .cat-img-wrap {
          width: 45%;
          position: relative;
          overflow: hidden;
        }
        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .category-tile:hover .cat-img {
          transform: scale(1.08);
        }
        .cat-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(10, 10, 12, 0.9));
        }
        .cat-text {
          width: 55%;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cat-text h3 {
          font-size: 1.4rem;
          margin-bottom: 8px;
        }
        .cat-text p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cat-link {
          font-family: var(--font-display);
          font-size: 0.8rem;
          color: var(--accent-neon);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
        }

        /* Products Grid styling */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 100px;
        }

        /* Testimonials Section */
        .testimonials-section {
          background: rgba(22, 22, 28, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          padding: 80px 0;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .testimonial-card {
          padding: 32px;
        }
        .test-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .test-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid var(--accent-neon);
          object-fit: cover;
        }
        .test-header h4 {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 1.05rem;
        }
        .test-header span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .stars {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .test-text {
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-style: italic;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .hero-media {
            order: -1;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .categories-grid {
            grid-template-columns: 1fr;
          }
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .value-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
          .category-tile {
            flex-direction: column;
            height: auto;
          }
          .cat-img-wrap, .cat-text {
            width: 100%;
          }
          .cat-img-wrap {
            height: 150px;
          }
          .cat-overlay {
            background: linear-gradient(to bottom, transparent, rgba(10, 10, 12, 0.9));
          }
        }
      `}</style>
    </div>
  );
};

// Fallback seed categories if server hasn't fetched them yet
const defaultCategoriesFallback = () => [
  { name: 'Over-Ear', description: 'Immersive soundscapes with ultimate acoustic seals.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { name: 'Wireless', description: 'Untethered mobility without compromising resonance.', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Gaming', description: 'Spatial audio engineered for absolute tactical awareness.', image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800&auto=format&fit=crop&q=80' },
  { name: 'In-Ear', description: 'Studio sound engineered for active lifestyles.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' }
];

export default Home;
