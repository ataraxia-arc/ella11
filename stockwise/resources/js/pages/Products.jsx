import { useEffect, useState } from "react";
import { api, ApiError, peso } from "../api";
import { Banner, Field, GhostButton, inputClass, PrimaryButton } from "../components/Fields";

const emptyForm = {
    name: "",
    sku: "",
    category: "",
    description: "",
    quantity: "0",
    reorder_level: "5",
    unit_price: "0",
};

export function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null);

    async function load(search = query) {
        setLoading(true);
        setError("");
        try {
            const data = await api(`/api/products?q=${encodeURIComponent(search)}`);
            setProducts(data.products);
        } catch (reason) {
            setError(reason.message || "Could not load products.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load("");
        // Initial shelf only. Search is explicit so we do not refetch on every keystroke.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function remove(product) {
        if (!window.confirm(`Remove ${product.name} from the stockroom?`)) return;
        await api(`/api/products/${product.id}`, { method: "DELETE" });
        await load();
    }

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold tracking-wide text-pine uppercase">Products</p>
                    <h1 className="mt-1 font-display text-4xl">Everything on record</h1>
                </div>
                <PrimaryButton onClick={() => setEditing({ ...emptyForm })}>New product</PrimaryButton>
            </div>

            <form
                className="mt-6 flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                    event.preventDefault();
                    load(query);
                }}
            >
                <input
                    className={inputClass}
                    value={query}
                    placeholder="Search name, SKU, or category"
                    aria-label="Search products"
                    onChange={(event) => setQuery(event.target.value)}
                />
                <PrimaryButton type="submit" className="sm:w-32">Search</PrimaryButton>
            </form>

            {error ? <p className="mt-4 text-clay" role="alert">{error}</p> : null}

            <div className="mt-4">
                {loading ? <p className="text-muted">Loading products…</p> : null}
                {!loading && products.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line bg-card px-4 py-10 text-center">
                        <p className="font-display text-2xl">No products match</p>
                        <p className="mt-2 text-sm text-muted">Add the first item, or clear the search.</p>
                    </div>
                ) : null}
                <div className="grid gap-3 lg:hidden">
                    {products.map((product) => (
                        <article key={product.id} className="rounded-xl border border-line bg-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold">{product.name}</h2>
                                    <p className="text-sm text-muted">{product.sku} · {product.category}</p>
                                </div>
                                {product.low_stock ? <span className="rounded-full bg-amber-soft px-2 py-1 text-xs font-semibold text-amber">Low</span> : null}
                            </div>
                            <p className="mt-3 text-sm">{product.quantity} on hand · reorder {product.reorder_level}</p>
                            <p className="text-sm font-semibold">{peso(product.unit_price)}</p>
                            <div className="mt-3 flex gap-2">
                                <GhostButton onClick={() => setEditing(toForm(product))}>Edit</GhostButton>
                                <GhostButton className="text-clay" onClick={() => remove(product)}>Delete</GhostButton>
                            </div>
                        </article>
                    ))}
                </div>
                {products.length > 0 ? (
                    <div className="hidden overflow-hidden rounded-xl border border-line bg-card lg:block">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">On hand</th>
                                    <th className="px-4 py-3 font-medium">Price</th>
                                    <th className="px-4 py-3 font-medium"> </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b border-line last:border-0">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-muted">{product.sku}</p>
                                        </td>
                                        <td className="px-4 py-3">{product.category}</td>
                                        <td className="px-4 py-3">
                                            <span className={product.low_stock ? "font-semibold text-amber" : ""}>
                                                {product.quantity}
                                            </span>
                                            <span className="text-muted"> / {product.reorder_level}</span>
                                        </td>
                                        <td className="px-4 py-3">{peso(product.unit_price)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" className="min-h-11 px-2 font-semibold text-pine" onClick={() => setEditing(toForm(product))}>Edit</button>
                                            <button type="button" className="min-h-11 px-2 font-semibold text-clay" onClick={() => remove(product)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>

            {editing ? (
                <ProductDialog
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await load();
                    }}
                />
            ) : null}
        </div>
    );
}

function toForm(product) {
    return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description || "",
        quantity: String(product.quantity),
        reorder_level: String(product.reorder_level),
        unit_price: String(product.unit_price),
    };
}

function ProductDialog({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const editing = Boolean(initial.id);

    function set(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function onSubmit(event) {
        event.preventDefault();
        setPending(true);
        setMessage("");
        setErrors({});
        const body = {
            name: form.name,
            sku: form.sku,
            category: form.category,
            description: form.description || null,
            quantity: Number(form.quantity),
            reorder_level: Number(form.reorder_level),
            unit_price: Number(form.unit_price),
        };
        try {
            if (editing) {
                await api(`/api/products/${initial.id}`, { method: "PUT", body });
            } else {
                await api("/api/products", { method: "POST", body });
            }
            await onSaved();
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors(error.errors);
                setMessage(Object.keys(error.errors || {}).length ? "" : error.message);
            } else {
                setMessage("Could not save the product.");
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="fixed inset-0 z-20 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4" role="presentation" onMouseDown={onClose}>
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-dialog-title"
                className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
                onMouseDown={(event) => event.stopPropagation()}
                onSubmit={onSubmit}
            >
                <h2 id="product-dialog-title" className="font-display text-3xl">{editing ? "Edit product" : "New product"}</h2>
                <div className="mt-4 space-y-3">
                    <Banner>{message}</Banner>
                    <Field label="Name" error={errors.name?.[0]}>
                        <input className={inputClass} required value={form.name} onChange={(event) => set("name", event.target.value)} />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="SKU" error={errors.sku?.[0]}>
                            <input className={inputClass} required value={form.sku} onChange={(event) => set("sku", event.target.value)} />
                        </Field>
                        <Field label="Category" error={errors.category?.[0]}>
                            <input className={inputClass} required value={form.category} onChange={(event) => set("category", event.target.value)} />
                        </Field>
                    </div>
                    <Field label="Description" error={errors.description?.[0]}>
                        <textarea className={`${inputClass} min-h-24 py-2`} value={form.description} onChange={(event) => set("description", event.target.value)} />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Quantity" error={errors.quantity?.[0]}>
                            <input className={inputClass} type="number" min="0" required value={form.quantity} onChange={(event) => set("quantity", event.target.value)} />
                        </Field>
                        <Field label="Reorder at" error={errors.reorder_level?.[0]}>
                            <input className={inputClass} type="number" min="0" required value={form.reorder_level} onChange={(event) => set("reorder_level", event.target.value)} />
                        </Field>
                        <Field label="Unit price" error={errors.unit_price?.[0]}>
                            <input className={inputClass} type="number" min="0" step="0.01" required value={form.unit_price} onChange={(event) => set("unit_price", event.target.value)} />
                        </Field>
                    </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <GhostButton onClick={onClose}>Cancel</GhostButton>
                    <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving…" : "Save product"}</PrimaryButton>
                </div>
            </form>
        </div>
    );
}
