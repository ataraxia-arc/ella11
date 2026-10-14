import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, peso, when } from "../api";

export function DashboardPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        api("/api/dashboard")
            .then((payload) => {
                if (active) setData(payload);
            })
            .catch((reason) => {
                if (active) setError(reason.message || "Could not load the dashboard.");
            });
        return () => {
            active = false;
        };
    }, []);

    if (error) {
        return <p className="text-clay" role="alert">{error}</p>;
    }

    if (!data) {
        return <p className="font-display text-2xl">Counting the shelves…</p>;
    }

    const cards = [
        ["Products", data.stats.products, "Distinct items"],
        ["Units on hand", data.stats.units, "Pieces across every SKU"],
        ["Low stock", data.stats.low_stock, "At or under reorder level"],
        ["Inventory value", peso(data.stats.inventory_value), "Quantity times unit price"],
    ];

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold tracking-wide text-pine uppercase">Dashboard</p>
                    <h1 className="mt-1 font-display text-4xl">The stockroom right now</h1>
                </div>
                <Link to="/products" className="inline-flex min-h-11 items-center rounded-lg bg-pine px-4 text-sm font-semibold text-paper">
                    Add or edit products
                </Link>
            </div>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(([label, value, note]) => (
                    <article key={label} className="rounded-xl border border-line bg-card p-4">
                        <p className="text-sm text-muted">{label}</p>
                        <p className="mt-2 font-display text-3xl">{value}</p>
                        <p className="mt-1 text-xs text-muted">{note}</p>
                    </article>
                ))}
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-xl border border-line bg-card">
                    <header className="flex items-center justify-between border-b border-line px-4 py-3">
                        <h2 className="font-semibold">Low-stock alerts</h2>
                        <span className="text-sm text-muted">{data.low_stock.length} shown</span>
                    </header>
                    {data.low_stock.length === 0 ? (
                        <p className="px-4 py-8 text-sm text-muted">Nothing is at or under its reorder level.</p>
                    ) : (
                        <ul>
                            {data.low_stock.map((product) => (
                                <li key={product.id} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted">{product.sku} · reorder at {product.reorder_level}</p>
                                    </div>
                                    <p className="font-semibold text-amber">{product.quantity} left</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>

                <article className="rounded-xl border border-line bg-card">
                    <header className="border-b border-line px-4 py-3">
                        <h2 className="font-semibold">Recent activity</h2>
                    </header>
                    {data.activity.length === 0 ? (
                        <p className="px-4 py-8 text-sm text-muted">Sign-ins and product changes will show up here.</p>
                    ) : (
                        <ul>
                            {data.activity.map((entry) => (
                                <li key={entry.id} className="border-b border-line px-4 py-3 last:border-0">
                                    <p className="text-sm">{entry.description}</p>
                                    <p className="mt-1 text-xs text-muted">{when(entry.created_at)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>
            </section>
        </div>
    );
}
