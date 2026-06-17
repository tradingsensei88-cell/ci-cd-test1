import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showToast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <header className="header-nav">
      <div className="container header-container">
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          AETHER<span>SOUND</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          {user && user.isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          <Link to="/wishlist" className="action-btn" title="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </Link>
          
          <Link to="/cart" className="action-btn" title="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="action-btn user-btn" title="Profile">
                <User size={20} />
                <span className="user-name-label">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="action-btn logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/profile" className="btn-neon login-header-btn">
              Sign In
            </Link>
          )}

          {/* Hamburger Menu Icon */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel animated-fade-in">
          <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link to="/wishlist" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlistCount})</Link>
          <Link to="/cart" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
          
          {user && user.isAdmin && (
            <Link to="/admin" className="mobile-link admin-link" onClick={() => setMobileMenuOpen(false)}>
              Admin Dashboard
            </Link>
          )}

          {user ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
              <button onClick={handleLogout} className="mobile-link logout-mobile-btn">
                Log Out <LogOut size={16} style={{ marginLeft: '8px' }} />
              </button>
            </>
          ) : (
            <Link to="/profile" className="btn-neon-filled mobile-login-btn" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Styles specifically scoped to Header */}
      <style>{`
        .header-nav {
          height: 80px;
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-glass);
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }
        .logo span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }
        .nav-menu {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .nav-link {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition);
          text-transform: uppercase;
        }
        .nav-link:hover {
          color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .admin-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-neon);
          border: 1px solid rgba(57, 255, 20, 0.2);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          background: rgba(57, 255, 20, 0.03);
        }
        .admin-link:hover {
          background: rgba(57, 255, 20, 0.1);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .action-btn {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition);
        }
        .action-btn:hover {
          color: var(--accent-neon);
          border-color: var(--border-glass-hover);
          background: rgba(57, 255, 20, 0.05);
          box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);
        }
        .action-btn .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--accent-neon);
          color: #000;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 50%;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px var(--accent-neon-glow);
        }
        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-btn {
          width: auto;
          padding: 0 12px 0 8px;
          border-radius: var(--radius-sm);
          gap: 8px;
        }
        .user-name-label {
          font-size: 0.85rem;
          font-family: var(--font-display);
          color: var(--text-primary);
        }
        .logout-btn {
          background: transparent;
        }
        .logout-btn:hover {
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
        }
        .login-header-btn {
          font-size: 0.75rem;
          padding: 8px 16px;
        }
        .mobile-toggle {
          display: none;
          color: var(--text-primary);
        }
        
        /* Mobile menu container styles */
        .mobile-menu {
          position: absolute;
          top: 80px;
          left: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 16px;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          border-top: none;
          z-index: 99;
          background: var(--bg-secondary);
        }
        .mobile-link {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text-secondary);
          padding: 12px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          display: block;
        }
        .mobile-link:hover, .mobile-link:active {
          color: var(--accent-neon);
          padding-left: 16px;
        }
        .logout-mobile-btn {
          background: rgba(239, 68, 68, 0.05);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          padding: 12px;
          width: 100%;
          font-family: var(--font-display);
        }
        .mobile-login-btn {
          width: 100%;
          text-align: center;
          padding: 12px;
        }

        @media (max-width: 768px) {
          .nav-menu, .user-name-label {
            display: none;
          }
          .mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
          }
          .login-header-btn {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
