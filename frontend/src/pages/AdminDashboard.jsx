import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, FolderHeart, ShieldCheck, ClipboardList, Trash2, Edit, Plus, Users, ShieldAlert } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const showToast = useToast();

  // Data States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    discountPrice: '',
    countInStock: '',
    description: '',
    imagesStr: '', // comma separated list
    specsStr: '', // JSON string representation of specifications
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
  });

  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryImg, setCategoryImg] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);

      const prods = await api.getProducts();
      setProducts(prods);

      const cats = await api.getCategories();
      setCategories(cats);

      const ords = await api.getAdminOrders();
      setOrders(ords);

      const usrs = await api.getAdminUsers();
      setUsers(usrs);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Category Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryDesc) {
      showToast('Fulfill category fields', 'error');
      return;
    }
    try {
      await api.createCategory({
        name: categoryName,
        description: categoryDesc,
        image: categoryImg || undefined,
      });
      showToast('Category created successfully!', 'success');
      setCategoryName('');
      setCategoryDesc('');
      setCategoryImg('');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Delete this category? Products belonging to this category will not be deleted but category label will become inactive.')) {
      try {
        await api.deleteCategory(catId);
        showToast('Category deleted successfully', 'success');
        loadAllData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Product Actions
  const openProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      // Map specs map/object to string
      const specsObj = prod.specifications instanceof Map 
        ? Object.fromEntries(prod.specifications) 
        : prod.specifications;
        
      setProductForm({
        name: prod.name,
        brand: prod.brand,
        category: prod.category,
        price: prod.price,
        discountPrice: prod.discountPrice || '',
        countInStock: prod.countInStock,
        description: prod.description,
        imagesStr: prod.images.join(', '),
        specsStr: JSON.stringify(specsObj, null, 2),
        isFeatured: prod.isFeatured || false,
        isBestSeller: prod.isBestSeller || false,
        isNewArrival: prod.isNewArrival || false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        brand: '',
        category: categories.length > 0 ? categories[0].name : '',
        price: '',
        discountPrice: '',
        countInStock: '',
        description: '',
        imagesStr: '',
        specsStr: JSON.stringify({
          'Driver Size': '40mm',
          'Battery Life': '30 Hours',
          'Connectivity': 'Bluetooth 5.3',
          'Weight': '250g'
        }, null, 2),
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false,
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    
    // Parse images and specs
    const images = productForm.imagesStr.split(',').map((img) => img.trim()).filter((img) => img !== '');
    if (images.length === 0) {
      showToast('Include at least one image URL', 'error');
      return;
    }

    let specifications = {};
    try {
      specifications = JSON.parse(productForm.specsStr);
    } catch (err) {
      showToast('Specifications field must be valid JSON', 'error');
      return;
    }

    const payload = {
      name: productForm.name,
      brand: productForm.brand,
      category: productForm.category || (categories.length > 0 ? categories[0].name : 'Over-Ear'),
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : 0,
      countInStock: Number(productForm.countInStock),
      description: productForm.description,
      images,
      specifications,
      isFeatured: productForm.isFeatured,
      isBestSeller: productForm.isBestSeller,
      isNewArrival: productForm.isNewArrival,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(payload);
        showToast('Product created successfully!', 'success');
      }
      setIsProductModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm('Are you absolutely sure you want to delete this product?')) {
      try {
        await api.deleteProduct(prodId);
        showToast('Product deleted successfully', 'success');
        loadAllData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}!`, 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // User Actions
  const handleToggleUserAdmin = async (userId) => {
    try {
      await api.toggleUserRole(userId);
      showToast('User administrative privileges toggled successfully', 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="container page-wrapper admin-dashboard-page animated-fade-in">
      <h1 className="admin-title">ADMINISTRATIVE <span>OPERATIONS</span></h1>

      <div className="admin-dashboard-layout">
        {/* Navigation Tabs Bar */}
        <aside className="admin-sidebar glass-panel">
          <button
            className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <LayoutDashboard size={18} /> Analytics
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} /> Products CRUD
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderHeart size={18} /> Categories
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={18} /> Orders Fulfillment
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> User Accounts
          </button>
        </aside>

        {/* Content Pane */}
        <main className="admin-content-pane glass-panel">
          {loading ? (
            <SkeletonLoader count={4} type="list" />
          ) : (
            <>
              {/* ANALYTICS TAB */}
              {activeTab === 'analytics' && stats && (
                <div className="tab-analytics animated-fade-in">
                  <h3>OPERATIONS METRICS</h3>
                  <div className="stats-cards-grid">
                    <div className="stat-card glass-panel">
                      <span>Gross Sales</span>
                      <h2>${stats.totalSales.toFixed(2)}</h2>
                    </div>
                    <div className="stat-card glass-panel">
                      <span>Total Transmissions</span>
                      <h2>{stats.totalOrders}</h2>
                    </div>
                    <div className="stat-card glass-panel">
                      <span>Registered Terminals</span>
                      <h2>{stats.totalUsers}</h2>
                    </div>
                    <div className="stat-card glass-panel alert-stat">
                      <span>Low Stock Warnings</span>
                      <h2 style={{ color: stats.lowStockProducts > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {stats.lowStockProducts}
                      </h2>
                    </div>
                  </div>

                  {/* Simulated weekly sales history chart */}
                  <div className="chart-section glass-panel">
                    <h4>Sales Trend History</h4>
                    <div className="sales-bar-chart">
                      {stats.salesHistory && stats.salesHistory.map((hist, i) => {
                        // Calculate percentage of max amount to scale bar height
                        const maxVal = Math.max(...stats.salesHistory.map(h => h.amount), 100);
                        const pctHeight = Math.max((hist.amount / maxVal) * 100, 8);
                        return (
                          <div key={i} className="chart-bar-group">
                            <div className="chart-bar-value">${hist.amount.toFixed(0)}</div>
                            <div className="chart-bar" style={{ height: `${pctHeight}%` }} />
                            <div className="chart-bar-label">{hist.date}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS CRUD TAB */}
              {activeTab === 'products' && (
                <div className="tab-products animated-fade-in">
                  <div className="tab-header-action">
                    <h3>PRODUCTS DATABASE</h3>
                    <button onClick={() => openProductModal()} className="btn-neon">
                      <Plus size={16} /> ADD PRODUCT
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Brand</th>
                          <th>Category</th>
                          <th>Base Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => (
                          <tr key={prod._id}>
                            <td>
                              <img src={prod.images[0]} alt={prod.name} className="table-thumbnail" />
                            </td>
                            <td className="bold-td">{prod.name}</td>
                            <td>{prod.brand}</td>
                            <td>{prod.category}</td>
                            <td className="price-td">
                              {prod.discountPrice > 0 ? (
                                <>
                                  <span className="current">${prod.discountPrice}</span>
                                  <span className="old">${prod.price}</span>
                                </>
                              ) : (
                                `$${prod.price}`
                              )}
                            </td>
                            <td>
                              <span style={{ color: prod.countInStock < 5 ? 'var(--danger)' : 'var(--accent-neon)', fontWeight: 'bold' }}>
                                {prod.countInStock}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button onClick={() => openProductModal(prod)} className="action-btn-mini edit" title="Edit Product">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteProduct(prod._id)} className="action-btn-mini delete" title="Delete Product">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="tab-categories animated-fade-in">
                  <div className="categories-tab-layout">
                    {/* Add Category Form */}
                    <div className="add-category-form glass-panel">
                      <h3>REGISTER NEW CATEGORY</h3>
                      <form onSubmit={handleAddCategory}>
                        <div className="form-group">
                          <label>Category Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Over-Ear"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            rows="3"
                            required
                            placeholder="Explain the sound signature profile..."
                            value={categoryDesc}
                            onChange={(e) => setCategoryDesc(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label>Image URL</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={categoryImg}
                            onChange={(e) => setCategoryImg(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <button type="submit" className="btn-neon-filled filter-apply-btn">
                          REGISTER
                        </button>
                      </form>
                    </div>

                    {/* Category List */}
                    <div className="categories-list-pane">
                      <h3>EXISTING PROFILES</h3>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Thumbnail</th>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => (
                            <tr key={cat._id}>
                              <td>
                                <img src={cat.image} alt={cat.name} className="table-thumbnail-rect" />
                              </td>
                              <td className="bold-td">{cat.name}</td>
                              <td className="desc-td-crop">{cat.description}</td>
                              <td>
                                <button onClick={() => handleDeleteCategory(cat._id)} className="action-btn-mini delete" title="Delete Category">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="tab-orders animated-fade-in">
                  <h3>GLOBAL TRANSACTIONS LOG</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order Hash</th>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Total Paid</th>
                          <th>Payment Status</th>
                          <th>Delivery Status</th>
                          <th>Fulfill Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="bold-td">#{order._id.substring(0, 10)}...</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="customer-cell">
                                <span className="name">{order.user.name}</span>
                                <span className="email">{order.user.email}</span>
                              </div>
                            </td>
                            <td className="bold-td">${order.totalPrice.toFixed(2)}</td>
                            <td>
                              <span style={{ color: order.isPaid ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                {order.isPaid ? 'PAID' : 'UNPAID'}
                              </span>
                            </td>
                            <td>
                              <span className={`order-status-lbl ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className="form-control fulfill-select"
                                disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="tab-users animated-fade-in">
                  <h3>AUTHENTICATION TERMINALS</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Terminal ID</th>
                        <th>User Name</th>
                        <th>Email Address</th>
                        <th>Admin Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((usr) => (
                        <tr key={usr._id}>
                          <td>#{usr._id.substring(0, 10)}...</td>
                          <td className="bold-td">{usr.name}</td>
                          <td>{usr.email}</td>
                          <td>
                            <span style={{ color: usr.isAdmin ? 'var(--accent-neon)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                              {usr.isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleUserAdmin(usr._id)}
                              className="btn-neon-secondary btn-table-action"
                            >
                              Toggle Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* PRODUCTS MODAL */}
      {isProductModalOpen && (
        <div className="modal-overlay animated-fade-in">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>{editingProduct ? 'EDIT ACOUSTIC PRODUCT' : 'REGISTER NEW ACOUSTIC'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="close-modal">&times;</button>
            </div>
            
            <form onSubmit={handleProductFormSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Model Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category Profile</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="form-control"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Discount Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    placeholder="0.00"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity in Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.countInStock}
                    onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URLs (separated by commas)</label>
                <input
                  type="text"
                  required
                  value={productForm.imagesStr}
                  onChange={(e) => setProductForm({ ...productForm, imagesStr: e.target.value })}
                  placeholder="https://image1.com, https://image2.com"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Technical Specifications (JSON format)</label>
                <textarea
                  rows="4"
                  required
                  value={productForm.specsStr}
                  onChange={(e) => setProductForm({ ...productForm, specsStr: e.target.value })}
                  className="form-control font-mono"
                />
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea
                  rows="3"
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="checkboxes-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  /> Featured Drop
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                  /> Best Seller
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                  /> New Arrival
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-neon-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-neon-filled">
                  {editingProduct ? 'SAVE ACOUSTIC' : 'REGISTER ACOUSTIC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-title {
          font-size: 2.2rem;
          margin-bottom: 40px;
          text-align: center;
        }
        .admin-title span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }

        .admin-dashboard-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          align-items: start;
        }
        .admin-sidebar {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .admin-tab-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: var(--transition);
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
          border: 1px solid transparent;
        }
        .admin-tab-btn:hover {
          color: var(--accent-neon);
          background: rgba(57, 255, 20, 0.03);
          border-color: rgba(57, 255, 20, 0.1);
        }
        .admin-tab-btn.active {
          color: var(--accent-neon);
          background: rgba(57, 255, 20, 0.05);
          border-color: var(--border-glass-hover);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }

        .admin-content-pane {
          padding: 40px;
        }
        .admin-content-pane h3 {
          font-size: 1.25rem;
          margin-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
        }

        /* Analytics Tab styling */
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          padding: 24px;
          text-align: center;
        }
        .stat-card span {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .stat-card h2 {
          font-size: 1.8rem;
          margin-top: 8px;
          font-family: var(--font-display);
          color: var(--text-primary);
        }
        .alert-stat {
          border-color: rgba(239, 68, 68, 0.15);
        }

        .chart-section {
          padding: 32px;
        }
        .chart-section h4 {
          font-size: 1.05rem;
          margin-bottom: 32px;
          font-family: var(--font-display);
        }
        .sales-bar-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 250px;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0 20px 0 10px;
        }
        .chart-bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 8%;
          gap: 8px;
        }
        .chart-bar-value {
          font-size: 0.75rem;
          color: var(--accent-neon);
          font-family: var(--font-display);
        }
        .chart-bar {
          width: 100%;
          background: linear-gradient(to top, rgba(57, 255, 20, 0.1), var(--accent-neon));
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          transition: height 1s ease;
        }
        .chart-bar-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        /* Products Tab & Tables */
        .tab-header-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .tab-header-action h3 {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 12px;
          font-family: var(--font-display);
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .admin-table td {
          padding: 16px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .bold-td {
          font-weight: 700;
        }
        .table-thumbnail {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .table-thumbnail-rect {
          width: 60px;
          height: 44px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .price-td {
          font-family: var(--font-display);
        }
        .price-td .old {
          font-size: 0.75rem;
          text-decoration: line-through;
          color: var(--text-muted);
          margin-left: 6px;
        }
        .action-buttons-cell {
          display: flex;
          gap: 8px;
        }
        .action-btn-mini {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition);
        }
        .action-btn-mini:hover {
          color: #000;
        }
        .action-btn-mini.edit:hover {
          background: var(--accent-neon);
          border-color: var(--accent-neon);
        }
        .action-btn-mini.delete:hover {
          background: var(--danger);
          border-color: var(--danger);
          color: #fff;
        }

        /* Categories Tab layout */
        .categories-tab-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 32px;
        }
        .categories-list-pane h3 {
          border-bottom: none;
          margin-bottom: 20px;
          padding-bottom: 0;
        }
        .desc-td-crop {
          color: var(--text-secondary);
          font-size: 0.85rem;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Orders tab status displays */
        .customer-cell {
          display: flex;
          flex-direction: column;
        }
        .customer-cell .name {
          font-weight: 600;
        }
        .customer-cell .email {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .order-status-lbl {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .order-status-lbl.pending { color: var(--warning); }
        .order-status-lbl.processing { color: var(--accent-neon); }
        .order-status-lbl.shipped { color: #3b82f6; }
        .order-status-lbl.out-for-delivery { color: #8b5cf6; }
        .order-status-lbl.delivered { color: var(--success); }
        .order-status-lbl.cancelled { color: var(--text-muted); }
        .fulfill-select {
          height: 34px;
          font-size: 0.8rem;
          padding: 4px 8px;
          min-width: 140px;
        }

        /* Users tab */
        .btn-table-action {
          font-size: 0.75rem;
          padding: 6px 12px;
        }

        /* Modal windows */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 110;
        }
        .modal-content {
          width: 100%;
          max-width: 700px;
          padding: 32px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .close-modal {
          font-size: 2rem;
          color: var(--text-muted);
          transition: var(--transition);
          cursor: pointer;
        }
        .close-modal:hover {
          color: var(--accent-neon);
        }
        .checkboxes-row {
          display: flex;
          gap: 24px;
          margin: 16px 0 24px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
        }
        .font-mono {
          font-family: monospace;
          font-size: 0.85rem;
        }

        @media (max-width: 992px) {
          .admin-dashboard-layout {
            grid-template-columns: 1fr;
          }
          .stats-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .categories-tab-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .stats-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
