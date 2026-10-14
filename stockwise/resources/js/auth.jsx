import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        api("/api/user")
            .then((data) => {
                if (active) setUser(data.user);
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setReady(true);
            });
        return () => {
            active = false;
        };
    }, []);

    const value = useMemo(() => ({
        user,
        ready,
        setUser,
        async logout() {
            await api("/api/logout", { method: "POST", body: {} });
            setUser(null);
        },
    }), [user, ready]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <button
            type="button"
            className="min-h-11 text-left text-sm font-medium text-paper/80 hover:text-paper"
            onClick={async () => {
                await logout();
                navigate("/");
            }}
        >
            Sign out
        </button>
    );
}
