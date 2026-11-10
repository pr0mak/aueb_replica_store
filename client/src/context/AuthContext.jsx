import React, {
    createContext,
    useContext,
    useMemo,
    useState
} from "react";

import { authApi } from "../api";

const AuthContext = createContext(null);

const STORAGE_KEY = "aueb_session_v2";

//diavazei sundesh apo to localstorage
function getStoredSession() {
    try {
        const value = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return value?.token && value?.user ? value : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {

    const [session, setSession] = useState(getStoredSession);

    //sundesh xrhsth
    async function login(credentials) {
        const response = await authApi.login(credentials);

        const next = {
            token: response.token,
            user: response.user
        };

        //apothkeush sto localstorage
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(next)
        );

        //enhmerwsh tou React state
        setSession(next);

        return response.user;
    }

    //aposundesh xrhsth
    function logout() {

        //diagrafh apo to localstorage
        localStorage.removeItem(STORAGE_KEY);

        //enhmerwsh tou react state
        setSession(null);
    }

    const value = useMemo(() => ({
        token: session?.token || null,
        user: session?.user || null,
        login,
        logout
    }), [session]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error("AuthProvider is missing");
    }

    return value;
}