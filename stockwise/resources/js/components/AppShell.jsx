import { LayoutDashboard, PackageSearch } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { LogoutButton, useAuth } from "../auth";

const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: PackageSearch },
];

export function AppShell() {
    const { user } = useAuth();
    const initials = user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <div className="min-h-screen bg-paper text-ink md:grid md:grid-cols-[248px_1fr]">
            <aside className="bg-pine-deep text-paper md:min-h-screen">
                <div className="flex items-center justify-between gap-4 px-5 py-4 md:block md:px-6 md:py-7">
                    <a href="/" className="font-display text-2xl tracking-tight">StockWise</a>
                    <p className="mt-1 hidden text-sm text-paper/70 md:block">Stockroom ledger</p>
                    <div className="md:hidden">
                        <LogoutButton />
                    </div>
                </div>
                <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3">
                    {links.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap ${
                                    isActive ? "bg-paper text-pine-deep" : "text-paper/80 hover:bg-white/10"
                                }`
                            }
                        >
                            <Icon size={18} aria-hidden="true" />
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-8 hidden border-t border-white/10 px-6 py-5 md:block">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-mist font-semibold text-pine">
                            {initials || "SW"}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <p className="truncate text-xs text-paper/60">{user.email}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <LogoutButton />
                    </div>
                </div>
            </aside>
            <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                <Outlet />
            </main>
        </div>
    );
}
