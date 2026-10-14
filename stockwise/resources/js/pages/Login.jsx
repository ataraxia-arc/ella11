import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import { useAuth } from "../auth";
import { Banner, Field, inputClass, PrimaryButton } from "../components/Fields";

export function LoginPage() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);

    function set(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function onSubmit(event) {
        event.preventDefault();
        setPending(true);
        setMessage("");
        setErrors({});
        try {
            const data = await api("/api/login", { method: "POST", body: form });
            setUser(data.user);
            navigate("/dashboard");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors(error.errors);
                setMessage(error.message);
            } else {
                setMessage("Could not reach the server.");
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <AuthFrame
            title="Sign back in"
            lede="The stockroom you left is still in MySQL, tied to this account."
            alternate={{ href: "/register", label: "Need an account? Register" }}
        >
            <form className="space-y-4" onSubmit={onSubmit}>
                <Banner>{message}</Banner>
                <Field label="Email" error={errors.email?.[0]}>
                    <input className={inputClass} type="email" autoComplete="email" required value={form.email} onChange={(event) => set("email", event.target.value)} />
                </Field>
                <Field label="Password" error={errors.password?.[0]}>
                    <input className={inputClass} type="password" autoComplete="current-password" required value={form.password} onChange={(event) => set("password", event.target.value)} />
                </Field>
                <PrimaryButton type="submit" className="w-full" disabled={pending}>
                    {pending ? "Signing in…" : "Sign in"}
                </PrimaryButton>
            </form>
        </AuthFrame>
    );
}

export function AuthFrame({ title, lede, alternate, children }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <section className="hidden bg-pine-deep px-12 py-12 text-paper lg:flex lg:flex-col lg:justify-between">
                <Link to="/" className="font-display text-3xl">StockWise</Link>
                <div>
                    <p className="font-display text-4xl leading-tight">A quiet desk for quantities, prices, and the things about to run out.</p>
                    <p className="mt-4 max-w-md text-paper/75">Sign in on this same domain. The API never asks the browser to store the database password.</p>
                </div>
                <p className="text-sm text-paper/60">Home · Account · Dashboard · Products</p>
            </section>
            <section className="flex items-center bg-paper px-4 py-10 sm:px-8">
                <div className="mx-auto w-full max-w-md">
                    <Link to="/" className="font-display text-2xl lg:hidden">StockWise</Link>
                    <h1 className="mt-6 font-display text-4xl">{title}</h1>
                    <p className="mt-2 text-muted">{lede}</p>
                    <div className="mt-8">{children}</div>
                    <p className="mt-6 text-sm">
                        <Link to={alternate.href} className="font-semibold text-pine">{alternate.label}</Link>
                    </p>
                </div>
            </section>
        </div>
    );
}
