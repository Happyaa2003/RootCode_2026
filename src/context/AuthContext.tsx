import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserProfile['role'], depot?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: UserProfile['role'], depot: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserProfile['role']) => void;
}

const DEMO_USERS: Record<string, UserProfile> = {
  dispatcher: {
    id: 'USR-001',
    name: 'Kamal Perera',
    email: 'kamal.perera@waypointroot.com',
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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('waypoint-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS.dispatcher;
      }
    }
    // Default active user is Kamal Perera (Dispatcher) for instant operational exploration
    return DEMO_USERS.dispatcher;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('waypoint-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('waypoint-user');
    }
  }, [user]);

  const login = async (email: string, role: UserProfile['role'] = 'Dispatcher', depot = 'Peliyagoda Central Depot'): Promise<boolean> => {
    // Generate initials from email or name
    const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const initials = cleanName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'OP';
    
    // Check if matches any demo user
    const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    const finalUser: UserProfile = matched || {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: cleanName,
      email,
      role,
      depot,
      initials,
    };

    setUser(finalUser);
    return true;
  };

  const signup = async (name: string, email: string, role: UserProfile['role'], depot: string): Promise<boolean> => {
    const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'OP';
    const newUser: UserProfile = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      role,
      depot,
      initials,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserProfile['role']) => {
    if (!user) return;
    setUser({ ...user, role: newRole });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
