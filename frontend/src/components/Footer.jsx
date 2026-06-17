import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, Twitter, Youtube, Github } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

const Footer = () => {
  const [email, setEmail] = useState('');
  const showToast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Thank you for subscribing to our newsletter!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Brand Info */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            AETHER<span>SOUND</span>
          </Link>
          <p className="footer-bio">
            Acoustic perfection meets futuristic design. Engineering the ultimate wireless audio experience for creators, gamers, and audiophiles.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" title="Instagram"><Instagram size={18} /></a>
            <a href="#" className="social-icon" title="Twitter"><Twitter size={18} /></a>
            <a href="#" className="social-icon" title="Youtube"><Youtube size={18} /></a>
            <a href="#" className="social-icon" title="Github"><Github size={18} /></a>
          </div>
        </div>

        {/* Catalog Links */}
        <div className="footer-links-col">
          <h4>Catalog</h4>
          <ul>
            <li><Link to="/shop?category=Over-Ear">Over-Ear Headsets</Link></li>
            <li><Link to="/shop?category=Wireless">Wireless Earbuds</Link></li>
            <li><Link to="/shop?category=Gaming">Gaming Audio</Link></li>
            <li><Link to="/shop?category=In-Ear">In-Ear Monitors</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div className="footer-links-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">Our Technology</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Warranty & Support</a></li>
            <li><a href="#">Contact Services</a></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="footer-news-col">
          <h4>Stay Connected</h4>
          <p>Subscribe to receive product drops, firmware updates, and exclusive VIP offers.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
            <button type="submit" className="newsletter-btn">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} AETHER<span>SOUND</span> Inc. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: #060608;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding: 80px 0 32px;
          margin-top: auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 48px;
          margin-bottom: 64px;
        }
        .footer-logo {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 20px;
          display: inline-block;
        }
        .footer-logo span {
          color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .footer-bio {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 24px;
          max-width: 320px;
        }
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .social-icon:hover {
          color: var(--accent-neon);
          border-color: var(--border-glass-hover);
          background: rgba(57, 255, 20, 0.05);
          box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);
        }
        .footer-links-col h4, .footer-news-col h4 {
          font-family: var(--font-display);
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 24px;
          color: var(--text-primary);
        }
        .footer-links-col ul {
          list-style: none;
        }
        .footer-links-col ul li {
          margin-bottom: 12px;
        }
        .footer-links-col ul li a {
          color: var(--text-secondary);
          font-size: 0.95rem;
          transition: var(--transition);
        }
        .footer-links-col ul li a:hover {
          color: var(--accent-neon);
          padding-left: 4px;
        }
        .footer-news-col p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 20px;
        }
        .newsletter-form {
          display: flex;
          position: relative;
        }
        .newsletter-form .form-control {
          padding-right: 56px;
        }
        .newsletter-btn {
          position: absolute;
          right: 4px;
          top: 4px;
          bottom: 4px;
          width: 44px;
          background: var(--accent-neon);
          color: #000;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          box-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .newsletter-btn:hover {
          background: var(--text-primary);
          color: #000;
          box-shadow: none;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .footer-bottom-links {
          display: flex;
          gap: 24px;
        }
        .footer-bottom-links a {
          transition: var(--transition);
        }
        .footer-bottom-links a:hover {
          color: var(--text-secondary);
        }
        .footer-bottom span {
          color: var(--accent-neon);
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }
        @media (max-width: 576px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
