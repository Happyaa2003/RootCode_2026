import type {
  Order,
  Route,
  Vehicle,
  Driver,
  Depot,
  Outlet,
  KpiSummary,
  DeliveryTimeEstimationResult,
  OrderStatus,
  UserProfile,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('waypoint-token');
  const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      const errorText = await response.text();
      if (errorText) errorDetail = errorText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export const api = {
  // Authentication
  login: (email: string, password = 'password123') =>
    request<{ access_token: string; token_type: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (payload: { name: string; email: string; password?: string; role?: string; depot?: string }) =>
    request<{ status: string; message: string; user: UserProfile }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password || 'password123',
        role: payload.role || 'Dispatcher',
        depot: payload.depot || 'Peliyagoda Central Depot',
      }),
    }),

  getMe: () => request<UserProfile>('/auth/me'),

  // Admin user management
  adminGetPendingUsers: () => request<UserProfile[]>('/auth/admin/pending'),
  adminGetAllUsers: () => request<UserProfile[]>('/auth/admin/all-users'),
  adminApproveUser: (email: string) =>
    request<UserProfile>(`/auth/admin/approve/${encodeURIComponent(email)}`, { method: 'POST' }),
  adminRejectUser: (email: string) =>
    request<UserProfile>(`/auth/admin/reject/${encodeURIComponent(email)}`, { method: 'POST' }),
  // Orders
  getOrders: (params?: { status?: string; district?: string; brand?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params?.district && params.district !== 'All') searchParams.append('district', params.district);
    if (params?.brand && params.brand !== 'All') searchParams.append('brand', params.brand);
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString();
    return request<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
  },

  getOrderById: (orderId: string) => request<Order>(`/orders/${orderId}`),

  createOrder: (order: Order) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),

  updateOrderStatus: (orderId: string, newStatus: OrderStatus) =>
    request<Order>(`/orders/${orderId}/status?new_status=${encodeURIComponent(newStatus)}`, {
      method: 'PATCH',
    }),

  scheduleOrder: (orderId: string, routeId: string, insertIndex?: number) =>
    request<Order>(`/orders/${orderId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ routeId, insertIndex }),
    }),

  unscheduleOrder: (orderId: string) =>
    request<Order>(`/orders/${orderId}/unschedule`, {
      method: 'POST',
    }),

  // Routes
  getRoutes: (depotId?: string) => {
    const qs = depotId ? `?depotId=${encodeURIComponent(depotId)}` : '';
    return request<Route[]>(`/routes${qs}`);
  },

  getRouteById: (routeId: string) => request<Route>(`/routes/${routeId}`),

  // Fleet / Vehicles
  getVehicles: (status?: string) => {
    const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return request<Vehicle[]>(`/fleet${qs}`);
  },

  updateVehicleLocation: (vehicleId: string, lat: number, lng: number, heading?: number) =>
    request<Vehicle>(`/fleet/${vehicleId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng, heading }),
    }),

  // Depots, Outlets, Drivers
  getDepots: () => request<Depot[]>('/depots'),
  getOutlets: (params?: { district?: string; dockType?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.district) searchParams.append('district', params.district);
    if (params?.dockType) searchParams.append('dockType', params.dockType);
    if (params?.limit) searchParams.append('limit', String(params.limit));
    const qs = searchParams.toString();
    return request<Outlet[]>(`/outlets${qs ? `?${qs}` : ''}`);
  },
  getDrivers: () => request<Driver[]>('/drivers'),

  // KPIs
  getKpis: () => request<KpiSummary>('/analytics/kpis'),

  // Delivery Estimator
  estimateDeliveryTime: (payload: {
    origin: string;
    destinationOutletId: string;
    district: string;
    departureTime: string;
    roadCondition?: string;
    weather?: string;
  }) =>
    request<DeliveryTimeEstimationResult>('/estimator/estimate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Route Optimization
  optimizeRoutes: (payload: { depotId?: string; maxVehicles?: number; temperatureConstraint?: boolean }) =>
    request<{
      status: string;
      routesOptimized: number;
      unassignedOrders: number;
      totalDistanceKm: number;
      totalFuelSavedL: number;
      message: string;
    }>('/planner/optimize', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Forecast
  getForecastSummary: () => request<any>('/forecast/summary'),

  // AI Assistant
  askAssistant: (message: string, history?: Array<{ role: string; content: string }>) =>
    request<{ reply: string; intent: string; data?: Record<string, unknown> }>('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};

export default api;
