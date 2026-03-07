"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

    // On mount: validate the session against the server
    useEffect(() => {
        async function validateSession() {
            try {
                const stored = localStorage.getItem(AUTH_KEY);

                if (!stored) {
                    // No local data — clear any stale cookie
                    fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
                    setIsLoading(false);
                    return;
                }

                // We have local data — validate with the server
                const res = await fetch("/api/auth/validate");
                const data = await res.json();

                if (data.valid && data.user) {
                    // Session is valid — use server-confirmed user data
                    const userData: User = { email: data.user.email, fullName: data.user.fullName };
                    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
                    setUser(userData);
                } else {
                    // Session is invalid (stale cookie or user deleted) — clear everything
                    localStorage.removeItem(AUTH_KEY);
                    fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
                }
            } catch {
                // On error, clear everything to be safe
                localStorage.removeItem(AUTH_KEY);
                fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
            } finally {
                setIsLoading(false);
            }
        }

        validateSession();
    }, []);

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
            // Small delay ensures the auth cookie from Set-Cookie is fully processed
            await new Promise(r => setTimeout(r, 100));
            window.location.href = "/";
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
            // Small delay ensures the auth cookie from Set-Cookie is fully processed
            await new Promise(r => setTimeout(r, 100));
            window.location.href = "/";
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
        // Full page navigation to clear all client state
        window.location.href = "/login";
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
