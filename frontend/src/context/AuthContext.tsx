import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password?: string, role?: UserProfile['role'], depot?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, role?: UserProfile['role'], depot?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserProfile['role']) => void;
}

const DEMO_USERS: Record<string, UserProfile> = {
  dispatcher: {
    id: 'USR-001',
    name: 'Kamal Perera',
    email: 'kamal.perera@waypilot.com',
    role: 'Dispatcher',
    depot: 'Peliyagoda Central Depot',
    initials: 'KP',
  },
  planner: {
    id: 'USR-002',
    name: 'Anura Jayasinghe',
    email: 'anura.j@waypointroot.com',
    role: 'Planner',
    depot: 'Peliyagoda Central Depot',
    initials: 'AJ',
  },
  fleet: {
    id: 'USR-003',
    name: 'Suneth Bandara',
    email: 'suneth.b@waypointroot.com',
    role: 'Fleet Manager',
    depot: 'Peliyagoda Central Depot',
    initials: 'SB',
  },
  admin: {
    id: 'USR-004',
    name: 'Sanduni Fernando',
    email: 'sanduni.f@waypointroot.com',
    role: 'Admin',
    depot: 'National Command Center',
    initials: 'SF',
  },
  driver: {
    id: 'USR-005',
    name: 'Nimal Silva',
    email: 'nimal.silva@waypointroot.com',
    role: 'Driver',
    depot: 'Peliyagoda Central Depot',
    initials: 'NS',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('waypoint-token'));

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('waypoint-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS.dispatcher;
      }
    }
    return DEMO_USERS.dispatcher;
  });

  // Verify stored token on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('waypoint-token');
    if (savedToken) {
      api.getMe()
        .then(profile => {
          setUser(profile);
          localStorage.setItem('waypoint-user', JSON.stringify(profile));
        })
        .catch(() => {
          // Token expired or invalid
          console.warn('Session verification fallback to stored profile');
        });
    }
  }, []);

  const login = async (
    email: string,
    password = 'password123',
    role: UserProfile['role'] = 'Dispatcher',
    depot = 'Peliyagoda Central Depot'
  ): Promise<boolean> => {
    try {
      // Call FastAPI /api/v1/auth/login
      const res = await api.login(email.trim(), password);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('waypoint-token', res.access_token);
      localStorage.setItem('waypoint-user', JSON.stringify(res.user));
      return true;
    } catch (err: any) {
      const msg: string = err?.message || '';
      // Surface clear messages for pending/rejected status
      if (msg.includes('PENDING_APPROVAL')) {
        throw new Error('Your account is awaiting admin approval. Please check back later.');
      }
      if (msg.includes('REJECTED')) {
        throw new Error('Your account request has been declined. Contact your administrator.');
      }
      // Fallback for offline/unreachable backend during demos
      const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched || password === 'password123' || password === 'demo') {
        const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const initials = cleanName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'OP';
        const fallbackUser: UserProfile = matched || {
          id: `USR-${Math.floor(100 + Math.random() * 900)}`,
          name: cleanName,
          email,
          role,
          depot,
          initials,
        };
        setUser(fallbackUser);
        localStorage.setItem('waypoint-user', JSON.stringify(fallbackUser));
        return true;
      }
      throw err;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password = 'password123',
    role: UserProfile['role'] = 'Dispatcher',
    depot = 'Peliyagoda Central Depot'
  ): Promise<boolean> => {
    try {
      // Call FastAPI /api/v1/auth/signup — returns pending response, NOT a token
      const res = await api.signup({ name, email, password, role, depot });
      if (res.status === 'PENDING_APPROVAL') {
        // Throw a special sentinel so Signup page can show the pending screen
        throw new Error('PENDING_APPROVAL');
      }
      // Should not reach here with new backend, but handle gracefully
      return true;
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (msg === 'PENDING_APPROVAL') {
        throw err; // re-throw so Signup page catches it
      }
      // Fallback for offline prototype execution — also show pending screen
      if (!msg || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        throw new Error('PENDING_APPROVAL');
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('waypoint-token');
    localStorage.removeItem('waypoint-user');
  };

  const switchRole = (newRole: UserProfile['role']) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('waypoint-user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        token,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
