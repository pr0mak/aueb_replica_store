import {
    createContext,
    useContext,
    useState
} from "react";

import { login as loginAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            return token && savedUser
                ? JSON.parse(savedUser)
                : null;
        } catch {
            return null;
        }
    });

    // Login
    const login = async (email, password) => {
        const data = await loginAPI({
            email,
            password
        });

        if (!data.token || !data.user) {
            throw new Error("Invalid login response");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        setUser(data.user);

        return data;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
    };

    // Authentication state
    const isAuthenticated = Boolean(user);

    // Role check
    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated,
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
