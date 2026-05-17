const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { headers = {}, body, method } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method: method || (body ? 'POST' : 'GET'),
      headers: requestHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Request failed');
    }

    return data.data as T;
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    phone?: string;
  }) {
    return this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', { body: data });
  }

  async login(email: string, password: string) {
    return this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', { body: { email, password } });
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async refreshToken(refreshToken: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', { body: { refreshToken } });
  }

  async logout(refreshToken: string) {
    return this.request<{ message: string }>('/auth/logout', { body: { refreshToken } });
  }

  // Positions - returns full response with meta for pagination
  async getPositions(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await fetch(`${API_BASE_URL}/positions${query}`);
    return response.json(); // Return full response
  }

  async getPosition(id: string) {
    return this.request<any>(`/positions/${id}`);
  }

  async createPosition(data: any) {
    return this.request<any>('/positions', { body: data });
  }

  async updatePosition(id: string, data: any) {
    return this.request<any>(`/positions/${id}`, { body: data });
  }

  async deletePosition(id: string) {
    return this.request<{ message: string }>(`/positions/${id}`, { body: {} });
  }

  async getMyPositions() {
    const response = await fetch(`${API_BASE_URL}/positions/company/my-positions`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    return response.json();
  }

  // Applications
  async getApplications(params?: { page?: number; status?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/applications${query}`);
  }

  async getApplication(id: string) {
    return this.request<any>(`/applications/${id}`);
  }

  async createApplication(data: { positionId: string; coverLetter?: string }) {
    return this.request<any>('/applications', { body: data });
  }

  async updateApplicationStatus(id: string, status: string) {
    return this.request<any>(`/applications/${id}/status`, { body: { status }, method: 'PUT' });
  }

  async getMyApplications() {
    return this.request<any[]>('/applications/student/my-applications');
  }

  async getCompanyApplications() {
    const response = await fetch(`${API_BASE_URL}/applications/company/applications`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    return response.json();
  }

  // Logs
  async getLogs(params?: { page?: number; status?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/logs${query}`);
  }

  async getLog(id: string) {
    return this.request<any>(`/logs/${id}`);
  }

  async createLog(data: { 
    weekNumber: number; 
    entryDate: string; 
    completedWork: string; 
    challenges?: string; 
    lessonsLearned?: string;
    goalsForNextWeek?: string;
  }) {
    return this.request<any>('/logs', { body: data });
  }

  async updateLog(id: string, data: any) {
    return this.request<any>(`/logs/${id}`, { body: data });
  }

  async reviewLog(id: string, data: { status: string; feedback?: string }) {
    return this.request<any>(`/logs/${id}/review`, { body: data, method: 'PUT' });
  }

  async getMyLogs() {
    return this.request<any[]>('/logs/student/my-logs');
  }

  async getStudentsLogs() {
    return this.request<any[]>('/logs/lecturer/students');
  }

  // Evaluations
  async getEvaluations(params?: { page?: number; type?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/evaluations${query}`);
  }

  async getEvaluation(id: string) {
    return this.request<any>(`/evaluations/${id}`);
  }

  async createEvaluation(data: {
    type: string;
    studentId: string;
    applicationId?: string;
    technicalScore?: number;
    attitudeScore?: number;
    communicationScore?: number;
    teamworkScore?: number;
    overallScore?: number;
    comment?: string;
    comments?: string;
  }) {
    return this.request<any>('/evaluations', { 
      body: {
        evaluationType: data.type,
        studentId: data.studentId,
        applicationId: data.applicationId,
        technicalScore: data.technicalScore || 0,
        attitudeScore: data.attitudeScore || 0,
        communicationScore: data.communicationScore || 0,
        teamworkScore: data.teamworkScore || 0,
        overallScore: data.overallScore || 0,
        comments: data.comment || data.comments || "",
        strengths: [],
        areasForImprovement: [],
      }
    });
  }

  async getStudentEvaluations(studentId: string) {
    return this.request<any[]>(`/evaluations/student/${studentId}`);
  }

  async getMyEvaluations() {
    return this.request<any[]>('/evaluations/evaluator/my-evaluations');
  }

  // Notifications
  async getNotifications(params?: { page?: number }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/notifications${query}`);
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread/count');
  }

  async markAsRead(id: string) {
    return this.request<{ message: string }>(`/notifications/${id}/read`, { body: {} });
  }

  async markAllAsRead() {
    return this.request<{ message: string }>('/notifications/read-all', { body: {} });
  }

  // Users
  async getUsers(params?: { page?: number; role?: string; search?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/users${query}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async getStudentProfile() {
    return this.request<any>('/users/students/profile');
  }

  async getStudentProfileById(studentId: string) {
    return this.request<any>(`/users/students/${studentId}/profile`);
  }

  async getApprovedStudents() {
    return this.request<any[]>('/applications/company/students-approved');
  }

  async getStudentsForEvaluation() {
    return this.request<any[]>('/applications/lecturer/students-for-evaluation');
  }

  async updateStudentProfile(data: any) {
    return this.request<any>('/users/students/profile', { method: 'PUT', body: data });
  }

  async updateStudentUserInfo(data: { name?: string; phone?: string }) {
    return this.request<any>('/users/students/profile/user', { method: 'PUT', body: data });
  }

  async getStudentById(studentId: string) {
    return this.request<any>(`/users/${studentId}`);
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
  }

  async updateUser(id: string, data: { name?: string; email?: string; role?: string; department?: string; phone?: string }) {
    return this.request<any>(`/users/${id}`, { method: 'PUT', body: data });
  }

  // Approvals
  async getApprovals(params?: { page?: number; limit?: number; status?: string; level?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/approvals${query}`);
  }

  async getApproval(id: string) {
    return this.request<any>(`/approvals/${id}`);
  }

  async reviewApproval(id: string, data: { status: string; comment?: string }) {
    return this.request<any>(`/approvals/${id}/review`, { body: data, method: 'PUT' });
  }

  async getMyPendingApprovals() {
    return this.request<any[]>('/approvals/pending/my-approvals');
  }

  // Stats
  async getStats() {
    return this.request<any>('/stats');
  }

  // System Logs (Admin)
  async getSystemLogs(params?: { page?: number; logType?: string; status?: string }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: any[]; meta: any }>(`/logs/system${query}`);
  }

  async getSystemLogStats() {
    return this.request<{ total: number; sent: number; failed: number }>('/logs/system/stats');
  }
}

export const api = new ApiService();
export default api;
