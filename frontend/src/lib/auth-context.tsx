'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole, User } from './types';
import { mockUsers } from './mock-data';

interface AuthContextType {
  currentRole: UserRole;
  currentUser: User;
  switchRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const currentUser: User = mockUsers[currentRole] || mockUsers.farmer;

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
  }, []);

  const login = useCallback((role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ currentRole, currentUser, switchRole, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role metadata for UI — consolidated: Processor now buys, transports, tests, processes, bottles
export const roleConfig: Record<UserRole, { label: string; color: string; path: string; description: string }> = {
  farmer: {
    label: 'Farmer',
    color: '#059669',
    path: '/farmer',
    description: 'Manage hives, create batches, monitor IoT',
  },
  admin: {
    label: 'Admin',
    color: '#7C3AED',
    path: '/admin',
    description: 'AI verification & batch approval',
  },
  processor: {
    label: 'Processor',
    color: '#2563EB',
    path: '/processor',
    description: 'Buy, transport, test, process & bottle honey',
  },
  consumer: {
    label: 'Consumer',
    color: '#F59E0B',
    path: '/verify',
    description: 'Verify bottle authenticity',
  },
};
