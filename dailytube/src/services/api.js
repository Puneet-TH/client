import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Public routes that don't require authentication
const publicRoutes = [
  '/videos',
  '/users/c/',
  '/users/login',
  '/users/register',
  '/users/refresh-token'
];

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isPublicRoute = publicRoutes.some(route => originalRequest.url?.includes(route));

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/users/login') {
      originalRequest._retry = true;

      // If it's a public route and fails with 401, don't try to refresh token
      if (isPublicRoute && !localStorage.getItem('accessToken')) {
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Only redirect to login if we're not on a public route and token refresh fails
        if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Show error message only for non-auth errors
    if (error.response?.data?.message && error.response?.status !== 401) {
      toast.error(error.response.data.message);
    } else if (!error.response && error.message !== 'Network Error') {
      toast.error('Something went wrong!');
    }

    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (formData) => api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (email, password) => api.post('/users/login', { email, password }),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/current-user'),
  refreshToken: () => api.post('/users/refresh-token'),
  changePassword: (oldPassword, newPassword) => api.post('/users/change-password', {
    oldPassword,
    newPassword
  }),
  updateProfile: (data) => api.patch('/users/update-account', data),
  updateAvatar: (formData) => api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCoverImage: (formData) => api.patch('/users/cover-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserProfile: (username) => api.get(`/users/c/${username}`),
  getWatchHistory: () => api.get('/users/history')
};

// Video Services
export const videoService = {
  getAllVideos: (page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId = '') => 
    api.get('/videos', { 
      params: { page, limit, query, sortBy, sortType, userId } 
    }),
  getVideoById: (videoId) => api.get(`/videos/${videoId}`),
  uploadVideo: (formData) => api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateVideo: (videoId, formData) => api.patch(`/videos/${videoId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  togglePublishStatus: (videoId) => api.patch(`/videos/toggle/publish/${videoId}`)
};

// Comment Services
export const commentService = {
  getVideoComments: (videoId, page = 1, limit = 10) => 
    api.get(`/comments/${videoId}`, { params: { page, limit } }),
  addComment: (videoId, content) => api.post(`/comments/${videoId}`, { content }),
  updateComment: (commentId, content) => api.patch(`/comments/c/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/c/${commentId}`)
};

// Like Services
export const likeService = {
  toggleVideoLike: (videoId) => api.post(`/likes/toggle/v/${videoId}`),
  toggleCommentLike: (commentId) => api.post(`/likes/toggle/c/${commentId}`),
  toggleTweetLike: (tweetId) => api.post(`/likes/toggle/t/${tweetId}`),
  getLikedVideos: () => api.get('/likes/videos')
};

// Subscription Services
export const subscriptionService = {
  toggleSubscription: (channelId) => api.post(`/subscriptions/c/${channelId}`),
  getUserSubscriptions: (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`),
  getChannelSubscribers: (channelId) => api.get(`/subscriptions/c/${channelId}`)
};

// Playlist Services
export const playlistService = {
  createPlaylist: (name, description) => api.post('/playlist', { name, description }),
  getUserPlaylists: (userId) => api.get(`/playlist/user/${userId}`),
  getPlaylistById: (playlistId) => api.get(`/playlist/${playlistId}`),
  updatePlaylist: (playlistId, name, description) => 
    api.patch(`/playlist/${playlistId}`, { name, description }),
  deletePlaylist: (playlistId) => api.delete(`/playlist/${playlistId}`),
  addVideoToPlaylist: (videoId, playlistId) => 
    api.patch(`/playlist/add/${videoId}/${playlistId}`),
  removeVideoFromPlaylist: (videoId, playlistId) => 
    api.patch(`/playlist/remove/${videoId}/${playlistId}`)
};

// Tweet Services
export const tweetService = {
  createTweet: (content) => api.post('/tweets', { content }),
  getUserTweets: (userId) => api.get(`/tweets/user/${userId}`),
  updateTweet: (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content }),
  deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`)
};

// Dashboard Services
export const dashboardService = {
  getChannelStats: () => api.get('/dashboard/stats'),
  getChannelVideos: () => api.get('/dashboard/videos')
};

export default api;
