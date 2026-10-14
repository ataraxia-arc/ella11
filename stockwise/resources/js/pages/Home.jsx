import { ArrowRight, Bell, ClipboardList, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";

const features = [
    {
        icon: ClipboardList,
        title: "A ledger, not a spreadsheet",
        text: "Names, SKUs, quantities, and prices live in MySQL. Create, edit, search, and remove stock without leaving the page.",
    },
    {
        icon: Bell,
        title: "Low stock before the shelf is empty",
        text: "Each product has its own reorder level. The dashboard lists anything sitting at or under that line.",
    },
    {
        icon: Search,
        title: "Find a SKU in one field",
        text: "Search matches the product name, SKU, or category, then stays on the same account that owns the record.",
    },
];

export function HomePage({ missing = false }) {
    const { user } = useAuth() || { user: null };

    return (
        <div className="min-h-screen bg-paper text-ink">
            <header className="border-b border-line">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <Link to="/" className="font-display text-2xl tracking-tight">StockWise</Link>
                    <nav className="flex items-center gap-2 text-sm font-medium">
                        {user ? (
                            <Link to="/dashboard" className="inline-flex min-h-11 items-center rounded-lg bg-pine px-4 text-paper">
                                Open dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="inline-flex min-h-11 items-center px-3">Sign in</Link>
                                <Link to="/register" className="inline-flex min-h-11 items-center rounded-lg bg-pine px-4 text-paper">
                                    Create account
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
                    <div>
                        {missing ? (
                            <p className="mb-4 text-sm font-semibold tracking-wide text-amber uppercase">Page not found</p>
                        ) : (
                            <p className="mb-4 text-sm font-semibold tracking-wide text-pine uppercase">Product inventory</p>
                        )}
                        <h1 className="font-display text-4xl leading-tight text-balance sm:text-6xl">
                            Know what is on the shelf before it runs out.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                            StockWise is a stockroom desk for a small team: accounts in MySQL, a live count of what you hold, and a short list of what to reorder.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to={user ? "/products" : "/register"} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-pine px-5 font-semibold text-paper">
                                {user ? "Manage products" : "Start an inventory"}
                                <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                            <Link to="/login" className="inline-flex min-h-12 items-center rounded-lg border border-line bg-card px-5 font-semibold">
                                I already have an account
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-line bg-card p-5 shadow-[0_20px_50px_-30px_rgba(28,25,21,0.45)]">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                            <p className="text-sm font-semibold">Today's count</p>
                            <span className="rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber">2 low</span>
                        </div>
                        <table className="mt-2 w-full text-left text-sm">
                            <tbody>
                                {[
                                    ["Printer ink, black", "2 left", true],
                                    ["Ballpoint pens", "8 left", true],
                                    ["Bond paper, A4", "42 left", false],
                                    ["Manila folders", "120 left", false],
                                ].map(([name, qty, low]) => (
                                    <tr key={name} className="border-b border-line last:border-0">
                                        <td className="py-3 pr-3">{name}</td>
                                        <td className={`py-3 text-right font-semibold ${low ? "text-amber" : "text-ink"}`}>{qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="pt-3 text-xs text-muted">Sample shelf. Your real counts are stored per account.</p>
                    </div>
                </section>

                <section className="border-y border-line bg-card">
                    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
                        {features.map(({ icon: Icon, title, text }) => (
                            <article key={title}>
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-mist text-pine">
                                    <Icon size={20} aria-hidden="true" />
                                </span>
                                <h2 className="mt-4 font-display text-2xl">{title}</h2>
                                <p className="mt-2 leading-relaxed text-muted">{text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                    <h2 className="font-display text-3xl">How a count gets into the book</h2>
                    <ol className="mt-6 grid gap-4 md:grid-cols-3">
                        {[
                            ["01", "Create an account", "Your name, email, and password are stored in MySQL. The session cookie stays on this domain."],
                            ["02", "Add the products you actually hold", "SKU, category, price, quantity, and the level that should trigger a warning."],
                            ["03", "Watch the dashboard", "Totals, inventory value, low-stock rows, and a short activity list update from the same database."],
                        ].map(([step, title, text]) => (
                            <li key={step} className="rounded-xl border border-line bg-card p-5">
                                <p className="font-display text-pine">{step}</p>
                                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                            </li>
                        ))}
                    </ol>
                </section>
            </main>

            <footer className="border-t border-line">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>StockWise · product inventory for a college stockroom project</p>
                    <p>Laravel API · React · MySQL</p>
                </div>
            </footer>
        </div>
    );
}
