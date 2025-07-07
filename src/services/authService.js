import axiosInstance from './axiosInstance';

export const authService = {
  // Login function
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.status === 'success') {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          role: response.data.data.role,
          // Add other user data as needed
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Logout function
  logout: async () => {
    try {
      // Call logout API
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.clear();
      // Redirect to login page
      window.location.href = '/login';
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  }
}; 