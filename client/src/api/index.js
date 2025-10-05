import axiosInstance from './axiosInstance';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  setupAdmin: async (userData) => {
    const response = await axiosInstance.post('/auth/setup', userData);
    return response.data;
  }
};

export const ticketAPI = {
  getTickets: async (params = {}) => {
    const response = await axiosInstance.get('/tickets', { params });
    return response.data;
  },

  getTicket: async (id) => {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (ticketData) => {
    const response = await axiosInstance.post('/tickets', ticketData);
    return response.data;
  },

  updateTicket: async (id, updateData) => {
    const response = await axiosInstance.patch(`/tickets/${id}`, updateData);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/tickets/stats');
    return response.data;
  }
};

export const commentAPI = {
  getComments: async (ticketId) => {
    const response = await axiosInstance.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  addComment: async (ticketId, commentData) => {
    const response = await axiosInstance.post(`/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },

  updateComment: async (commentId, updateData) => {
    const response = await axiosInstance.patch(`/comments/${commentId}`, updateData);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    return response.data;
  }
};