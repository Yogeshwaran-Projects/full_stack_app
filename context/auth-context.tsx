"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

// Define the shape of your User object
interface User {
  userId: string;
  phone: string;
  role: "admin" | "consumer" | "worker";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check for token in cookies on initial load
    const token = Cookies.get("authToken");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Token expired
        } else {
          setUser({
            userId: decoded.userId,
            phone: decoded.phone,
            role: decoded.role,
          });
        }
      } catch (error) {
        logout(); // Invalid token
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    // 2. Set Cookie (Expires in 1 day)
    Cookies.set("authToken", token, { expires: 1 });

    // 3. Decode and update state
    const decoded: any = jwtDecode(token);
    setUser({
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role,
    });

    // 4. Redirect based on role
    if (decoded.role === "admin") router.push("/profile");
    else if (decoded.role === "worker") router.push("/profile");
    else router.push("/profile");
  };

  const logout = () => {
    Cookies.remove("authToken");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// Custom Hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}