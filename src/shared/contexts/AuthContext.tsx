"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/features/login/models/AuthModels";
import { AuthController } from "@/features/login/services/AuthController";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Load from localStorage on initialization
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
    // Always check session to verify validity, but the UI already has the user if cached
    checkSession();
  }, []);

  const checkSession = async () => {
    // Only set loading if we don't have a cached user to avoid jumping
    // But if we're on the landing page, we might not want to show a loader at all
    const hasCachedUser = !!localStorage.getItem("auth_user");

    // If no cached user, we don't "need" to show loading because the user
    // is likely a guest visiting the landing page.
    if (!hasCachedUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userData = await AuthController.checkSession();
      if (userData) {
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("auth_user");
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("auth_user");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const logout = async () => {
    const result = await AuthController.logout();
    if (result.success) {
      setUser(null);
      localStorage.removeItem("auth_user");
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
