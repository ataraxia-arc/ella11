import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/Dashboard";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { ProductsPage } from "./pages/Products";
import { RegisterPage } from "./pages/Register";

function GuestOnly({ children }) {
    const { user, ready } = useAuth();
    if (!ready) return <ScreenStatus label="Checking your session" />;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}

function RequireAuth() {
    const { user, ready } = useAuth();
    if (!ready) return <ScreenStatus label="Opening the stockroom" />;
    if (!user) return <Navigate to="/login" replace />;
    return <AppShell />;
}

function ScreenStatus({ label }) {
    return (
        <div className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
            <p className="font-display text-2xl">{label}…</p>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
                    <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
                    <Route element={<RequireAuth />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                    </Route>
                    <Route path="*" element={<HomePage missing />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
