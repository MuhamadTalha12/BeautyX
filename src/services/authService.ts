import api from './api';

export const login = async (data: any) => {
  const res = await api.post('/auth/login', data);
  if (res.data.success) {
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    return {
      data: {
        success: true,
        data: {
          user,
          accessToken: token
        }
      }
    };
  }
  return res;
};

export const loginWithGoogle = async (data: { email: string; name: string; googleId: string; avatar: string }) => {
  const res = await api.post('/auth/google', data);
  if (res.data.success) {
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    return {
      data: {
        success: true,
        data: {
          user,
          accessToken: token
        }
      }
    };
  }
  return res;
};

export const register = async (data: any) => {
  const res = await api.post('/auth/register', data);
  if (res.data.success) {
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    return {
      data: {
        success: true,
        message: 'Registration successful! Verification email sent.',
        data: {
          user,
          accessToken: token
        }
      }
    };
  }
  return res;
};

export const logout = async () => {
  localStorage.removeItem('token');
  return { data: { message: 'Logged out' } };
};

export const forgotPassword = async (email: string) => {
  const res = await api.post('/auth/forgot-password', { email });
  if (res.data.success) {
    return {
      data: {
        success: true,
        message: res.data.message || 'Reset password link sent.'
      }
    };
  }
  return res;
};

export const resetPassword = async (token: string, password: string) => {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  if (res.data.success) {
    return {
      data: {
        success: true,
        message: res.data.message || 'Password reset successful.'
      }
    };
  }
  return res;
};

export const verifyEmail = async (token: string) => {
  const res = await api.get(`/auth/verify-email/${token}`);
  if (res.data.success) {
    return {
      data: {
        success: true,
        message: res.data.message || 'Email verified successfully.'
      }
    };
  }
  return res;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          user: res.data.user
        }
      }
    };
  }
  return res;
};

export const updateProfile = async (data: any) => {
  const res = await api.put('/auth/profile', data);
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          user: res.data.user
        }
      }
    };
  }
  return res;
};

export const addAddress = async (data: any) => {
  const res = await api.post('/auth/addresses', data);
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          addresses: res.data.addresses
        }
      }
    };
  }
  return res;
};

export const updateAddress = async (id: string, data: any) => {
  const res = await api.put(`/auth/addresses/${id}`, data);
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          addresses: res.data.addresses
        }
      }
    };
  }
  return res;
};

export const deleteAddress = async (id: string) => {
  const res = await api.delete(`/auth/addresses/${id}`);
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          addresses: res.data.addresses
        }
      }
    };
  }
  return res;
};

// Database-backed sync for cart & wishlist
export const getDBCart = async () => {
  const res = await api.get('/auth/cart');
  return res.data.success ? res.data.cart : [];
};

export const syncDBCart = async (items: any[]) => {
  const res = await api.post('/auth/cart', { items });
  return res.data;
};

export const getDBWishlist = async () => {
  const res = await api.get('/auth/wishlist');
  return res.data.success ? res.data.wishlist : [];
};

export const syncDBWishlist = async (items: any[]) => {
  const res = await api.post('/auth/wishlist', { items });
  return res.data;
};

// Admin User Management Services
export const getAllUsers = async () => {
  return await api.get('/auth/users');
};

export const updateUserStatus = async (id: string, status: 'active' | 'suspended') => {
  return await api.put(`/auth/users/${id}/status`, { status });
};

export const deleteUser = async (id: string) => {
  return await api.delete(`/auth/users/${id}`);
};
