// API Configuration using Axios
import axios from 'axios';

// Create axios instance with default config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - adds auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('freequo_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url} [TOKEN PRESENT]`);
        } else {
            console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url} [NO TOKEN]`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles responses and errors globally
api.interceptors.response.use(
    (response) => {
        // Return the data directly for convenience
        return response.data;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            // Handle authentication errors
            if (status === 401) {
                // Optionally clear token and redirect to login
                // localStorage.removeItem('freequo_token');
                // window.location.href = '/login';
            }

            throw {
                status,
                message: data?.message || 'An error occurred',
                errors: data?.errors
            };
        } else if (error.request) {
            // Network error
            throw {
                status: 0,
                message: 'Network error. Please check your connection.'
            };
        } else {
            throw {
                status: 500,
                message: error.message || 'An unexpected error occurred'
            };
        }
    }
);

// ========================================
// AUTH API
// ========================================
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    updatePassword: (passwords) => api.put('/auth/password', passwords),
    logout: () => api.post('/auth/logout')
};

// ========================================
// USERS API
// ========================================
export const usersAPI = {
    getFreelancers: (params = {}) => api.get('/users/freelancers', { params }),
    getUser: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data)
};

// ========================================
// JOBS API
// ========================================
export const jobsAPI = {
    // Get all jobs with optional filtering
    getJobs: (params = {}) => api.get('/jobs', { params }),

    // Get single job by ID
    getJob: (id) => api.get(`/jobs/${id}`),

    // Create new job (client only)
    createJob: (jobData) => api.post('/jobs', jobData),

    // Update job
    updateJob: (id, updates) => api.put(`/jobs/${id}`, updates),

    // Delete job
    deleteJob: (id) => api.delete(`/jobs/${id}`),

    // Get jobs posted by current client
    getClientJobs: (params = {}) => api.get('/jobs/client/my-jobs', { params }),

    // Get job categories
    getCategories: () => api.get('/jobs/categories'),

    // Assign freelancer to job
    assignFreelancer: (jobId, freelancerId) =>
        api.put(`/jobs/${jobId}/assign`, { freelancerId }),

    // Mark job as complete
    completeJob: (jobId) => api.put(`/jobs/${jobId}/complete`)
};

// ========================================
// PROPOSALS API
// ========================================
export const proposalsAPI = {
    createProposal: (proposalData) => api.post('/proposals', proposalData),
    getProposalsForJob: (jobId, params = {}) =>
        api.get(`/proposals/job/${jobId}`, { params }),
    getMyProposals: (params = {}) => api.get('/proposals/my-proposals', { params }),
    updateStatus: (id, status) => api.put(`/proposals/${id}/status`, { status }),
    withdrawProposal: (id) => api.delete(`/proposals/${id}`),
    checkIfApplied: (jobId) => api.get(`/proposals/check/${jobId}`)
};

// ========================================
// DASHBOARD API
// ========================================
export const dashboardAPI = {
    getClientDashboard: () => api.get('/dashboard/client'),
    getFreelancerDashboard: () => api.get('/dashboard/freelancer'),
    getAdminDashboard: () => api.get('/dashboard/admin')
};

// ========================================
// PAYMENTS API
// ========================================
export const paymentsAPI = {
    createPayment: (paymentData) => api.post('/payments', paymentData),
    releasePayment: (id) => api.put(`/payments/${id}/release`),
    getClientPayments: (params = {}) => api.get('/payments/client', { params }),
    getFreelancerEarnings: (params = {}) => api.get('/payments/freelancer', { params })
};

// ========================================
// NOTIFICATIONS API
// ========================================
export const notificationsAPI = {
    getNotifications: (params = {}) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    clearAll: () => api.delete('/notifications/clear-all')
};

// ========================================
// ADMIN API
// ========================================
export const adminAPI = {
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getJobs: (params = {}) => api.get('/admin/jobs', { params }),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
    getStats: () => api.get('/admin/stats')
};

// ========================================
// UPLOAD API
// ========================================
export const uploadAPI = {
    uploadProfileImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    uploadJobAttachment: async (jobId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/upload/job/${jobId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        return api.post('/upload/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteUpload: (url, type) => api.delete('/upload', { data: { url, type } })
};

// ========================================
// RAZORPAY PAYMENTS API
// ========================================
export const razorpayAPI = {
    createOrder: (jobId, amount, milestone) =>
        api.post('/payments/create-order', { jobId, amount, milestone }),
    verifyPayment: (paymentData) => api.post('/payments/verify', paymentData)
};

// Export the axios instance for custom requests
export { api };

// Export default object with all APIs
export default {
    auth: authAPI,
    users: usersAPI,
    jobs: jobsAPI,
    proposals: proposalsAPI,
    dashboard: dashboardAPI,
    payments: paymentsAPI,
    notifications: notificationsAPI,
    admin: adminAPI,
    upload: uploadAPI,
    razorpay: razorpayAPI
};
