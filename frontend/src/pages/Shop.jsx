import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import { api } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Trigger search on typing search query (with a small debounce or direct submit button)
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Fetch categories on load
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error getting categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Update states if query params change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
    setBrand(searchParams.get('brand') || 'All');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setRating(searchParams.get('rating') || '');
    setSort(searchParams.get('sort') || 'newest');
    setTriggerFetch((p) => p + 1);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search,
          category: category !== 'All' ? category : undefined,
          brand: brand !== 'All' ? brand : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          rating: rating || undefined,
          sort,
        };
        const data = await api.getProducts(params);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [triggerFetch]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category && category !== 'All') newParams.category = category;
    if (brand && brand !== 'All') newParams.brand = brand;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (rating) newParams.rating = rating;
    if (sort) newParams.sort = sort;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setBrand('All');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setSearchParams({});
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  // Static list of brands for filtering (or could be dynamic, but static matches seed)
  const brands = ['AetherSound', 'ViperX'];

  return (
    <div className="container page-wrapper shop-page animated-fade-in">
      <div className="shop-header">
        <div className="shop-title-section">
          <h1>THE <span>ACOUSTIC</span> REGISTRY</h1>
          <p>Browse our catalog of premium headphones</p>
        </div>

        {/* Sort Options */}
        <div className="sort-wrapper">
          <label>Sort By:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              // Direct URL update for immediate response
              const current = Object.fromEntries(searchParams.entries());
              setSearchParams({ ...current, sort: e.target.value });
            }}
            className="form-control sort-select"
          >
            <option value="newest">New Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="shop-layout-grid">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar glass-panel">
          <div className="sidebar-header">
            <h3><SlidersHorizontal size={18} /> FILTERS</h3>
            <button onClick={handleResetFilters} className="reset-btn" title="Reset Filters">
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilters}>
            {/* Search Input */}
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input-wrap">
                <input
                  type="text"
                  placeholder="Model or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="form-control"
                />
                <button type="submit" className="search-action-btn"><Search size={16} /></button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-control"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <label>Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-control"
              >
                <option value="All">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <label>Price Range ($)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-control price-input"
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-control price-input"
                  min="0"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label>Minimum Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="form-control"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5 Stars & above</option>
                <option value="4.0">4.0 Stars & above</option>
                <option value="3.5">3.5 Stars & above</option>
              </select>
            </div>

            <button type="submit" className="btn-neon-filled filter-apply-btn">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Products Grid */}
        <main className="shop-products-main">
          {loading ? (
            <div className="shop-products-grid">
              <SkeletonLoader count={6} type="card" />
            </div>
          ) : products.length > 0 ? (
            <div className="shop-products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products glass-panel animated-fade-in">
              <h3>NO ACOUSTICS MATCH YOUR PARAMETERS</h3>
              <p>Try resetting or modifying your search filters to find products.</p>
              <button onClick={handleResetFilters} className="btn-neon">
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .shop-page {
          display: flex;
          flex-direction: column;
        }
        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
          margin-bottom: 40px;
        }
        .shop-title-section h1 {
          font-size: 2.2rem;
          margin-bottom: 6px;
        }
        .shop-title-section h1 span {
          color: var(--accent-neon);
          text-shadow: 0 0 15px var(--accent-neon-glow);
        }
        .shop-title-section p {
          color: var(--text-secondary);
        }
        .sort-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sort-wrapper label {
          color: var(--text-secondary);
          white-space: nowrap;
          font-family: var(--font-display);
          font-size: 0.85rem;
        }
        .sort-select {
          min-width: 180px;
          height: 40px;
          padding: 8px 12px;
        }
        .shop-layout-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          align-items: start;
        }
        .filters-sidebar {
          padding: 24px;
          position: sticky;
          top: 100px;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .sidebar-header h3 {
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .reset-btn {
          color: var(--text-muted);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition);
        }
        .reset-btn:hover {
          color: var(--accent-neon);
        }
        .filter-group {
          margin-bottom: 24px;
        }
        .filter-group label {
          display: block;
          font-family: var(--font-display);
          font-size: 0.8rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }
        .search-input-wrap {
          position: relative;
        }
        .search-input-wrap .form-control {
          padding-right: 44px;
        }
        .search-action-btn {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 40px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .search-action-btn:hover {
          color: var(--accent-neon);
        }
        .price-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .price-inputs span {
          color: var(--text-muted);
        }
        .price-input {
          text-align: center;
          padding: 10px 8px;
        }
        .filter-apply-btn {
          width: 100%;
          margin-top: 16px;
        }
        
        /* Products layout */
        .shop-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .no-products {
          padding: 64px 32px;
          text-align: center;
          border-radius: var(--radius-lg);
        }
        .no-products h3 {
          margin-bottom: 12px;
          font-size: 1.4rem;
        }
        .no-products p {
          color: var(--text-secondary);
          margin-bottom: 30px;
        }

        @media (max-width: 992px) {
          .shop-layout-grid {
            grid-template-columns: 1fr;
          }
          .filters-sidebar {
            position: relative;
            top: 0;
            margin-bottom: 40px;
          }
          .shop-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .shop-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .sort-wrapper {
            width: 100%;
            justify-content: space-between;
          }
          .shop-products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Shop;
