"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    fullName: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<string | null>;
    signup: (email: string, password: string, fullName: string) => Promise<string | null>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "careerai_user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            localStorage.removeItem(AUTH_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Redirect logic
    useEffect(() => {
        if (isLoading) return;

        const isLoginPage = pathname === "/login";

        if (!user && !isLoginPage) {
            router.replace("/login");
        } else if (user && isLoginPage) {
            router.replace("/");
        }
    }, [user, isLoading, pathname, router]);

    const login = async (email: string, password: string): Promise<string | null> => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!data.success) {
                return data.error || "Login failed.";
            }

            const userData: User = { email: data.user.email, fullName: data.user.fullName };
            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            setUser(userData);
            return null; // no error
        } catch {
            return "Network error. Please try again.";
        }
    };

    const signup = async (email: string, password: string, fullName: string): Promise<string | null> => {
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, fullName }),
            });
            const data = await res.json();

            if (!data.success) {
                return data.error || "Signup failed.";
            }

            const userData: User = { email: data.user.email, fullName: data.user.fullName };
            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            setUser(userData);
            return null; // no error
        } catch {
            return "Network error. Please try again.";
        }
    };

    const logout = async () => {
        // Clear server-side auth cookie
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Continue with client-side cleanup even if API call fails
        }
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
        router.replace("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
