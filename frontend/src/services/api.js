const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Auth API
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Products API
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, value);
      }
    });

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getProduct: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createProduct: async (productData) => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addProductReview: async (productId, reviewData) => {
    const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(res);
  },

  // Categories API
  getCategories: async () => {
    const res = await fetch(`${BASE_URL}/categories`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createCategory: async (categoryData) => {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Orders API
  createOrder: async (orderData) => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  getMyOrders: async () => {
    const res = await fetch(`${BASE_URL}/orders/myorders`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getOrder: async (id) => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createCheckoutSession: async (cartItems) => {
    const res = await fetch(`${BASE_URL}/orders/checkout-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cartItems }),
    });
    return handleResponse(res);
  },

  // Admin Dashboard API
  getAdminStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminUsers: async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  toggleUserRole: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminOrders: async () => {
    const res = await fetch(`${BASE_URL}/admin/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
