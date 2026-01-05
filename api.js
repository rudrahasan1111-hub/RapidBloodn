// RapidBlood API Service
class RapidBloodAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('rapidblood_token');
    }

    // Set auth token
    setToken(token) {
        this.token = token;
        localStorage.setItem('rapidblood_token', token);
    }

    // Clear auth token
    clearToken() {
        this.token = null;
        localStorage.removeItem('rapidblood_token');
    }

    // Get auth headers
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        };
    }

    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getAuthHeaders(),
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async registerDonor(userData) {
        return this.request('/auth/register-donor', {
            method: 'POST',
            body: JSON.stringify({
                email: userData.email,
                password: userData.password,
                name: userData.name,
                phone: userData.phone,
                bloodType: userData.bloodType,
                location: {
                    type: 'Point',
                    coordinates: [userData.longitude || 90.3563, userData.latitude || 23.8103],
                    address: userData.address || ''
                }
            })
        });
    }

    async registerRecipient(userData) {
        return this.request('/auth/register-recipient', {
            method: 'POST',
            body: JSON.stringify({
                email: userData.email,
                password: userData.password,
                name: userData.name,
                phone: userData.phone,
                bloodType: userData.bloodType,
                location: {
                    type: 'Point',
                    coordinates: [userData.longitude || 90.3563, userData.latitude || 23.8103],
                    address: userData.address || ''
                }
            })
        });
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // User endpoints
    async getDonors(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.bloodType) queryParams.append('bloodType', filters.bloodType);
        if (filters.lng) queryParams.append('lng', filters.lng);
        if (filters.lat) queryParams.append('lat', filters.lat);
        if (filters.radius) queryParams.append('radius', filters.radius);

        const endpoint = `/donors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return this.request(endpoint);
    }

    async getRecipients() {
        return this.request('/recipients');
    }

    async getDonor(id) {
        return this.request(`/donors/${id}`);
    }

    async getRecipient(id) {
        return this.request(`/recipients/${id}`);
    }

    // Alert endpoints
    async createSOS(alertData) {
        return this.request('/alerts/sos', {
            method: 'POST',
            body: JSON.stringify({
                location: {
                    type: 'Point',
                    coordinates: [alertData.longitude || 90.3563, alertData.latitude || 23.8103],
                    address: alertData.address || ''
                },
                bloodType: alertData.bloodType,
                urgencyLevel: alertData.urgencyLevel || 'high',
                requiredUnits: alertData.requiredUnits || 1
            })
        });
    }

    async respondToAlert(alertId, message) {
        return this.request(`/alerts/${alertId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    // Chat endpoints
    async getChats() {
        return this.request('/chats');
    }

    async getChatMessages(chatId) {
        return this.request(`/chats/${chatId}`);
    }

    async sendMessage(chatId, message, file = null) {
        const formData = new FormData();
        formData.append('text', message);
        if (file) {
            formData.append('file', file);
        }

        return this.request(`/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }

    // Report endpoints
    async createReport(reportData) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify({
                reportedUser: reportData.reportedUser,
                category: reportData.category,
                severity: reportData.severity || 'low',
                description: reportData.description
            })
        });
    }

    async getReports() {
        return this.request('/reports');
    }

    async updateReportStatus(reportId, status) {
        return this.request(`/reports/${reportId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    logout() {
        this.clearToken();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Create global API instance
const api = new RapidBloodAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RapidBloodAPI;
}
