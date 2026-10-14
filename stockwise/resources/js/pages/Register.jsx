import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import { useAuth } from "../auth";
import { Banner, Field, inputClass, PrimaryButton } from "../components/Fields";
import { AuthFrame } from "./Login";

export function RegisterPage() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
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
            const data = await api("/api/register", { method: "POST", body: form });
            setUser(data.user);
            navigate("/dashboard");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors(error.errors);
                setMessage(error.errors?.email || error.errors?.password ? "" : error.message);
            } else {
                setMessage("Could not reach the server.");
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <AuthFrame
            title="Open an account"
            lede="Eight characters minimum. You will only see the products this account creates."
            alternate={{ href: "/login", label: "Already registered? Sign in" }}
        >
            <form className="space-y-4" onSubmit={onSubmit}>
                <Banner>{message}</Banner>
                <Field label="Full name" error={errors.name?.[0]}>
                    <input className={inputClass} required value={form.name} autoComplete="name" onChange={(event) => set("name", event.target.value)} />
                </Field>
                <Field label="Email" error={errors.email?.[0]}>
                    <input className={inputClass} type="email" required autoComplete="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
                </Field>
                <Field label="Password" error={errors.password?.[0]}>
                    <input className={inputClass} type="password" required autoComplete="new-password" value={form.password} onChange={(event) => set("password", event.target.value)} />
                </Field>
                <Field label="Confirm password" error={errors.password_confirmation?.[0]}>
                    <input className={inputClass} type="password" required autoComplete="new-password" value={form.password_confirmation} onChange={(event) => set("password_confirmation", event.target.value)} />
                </Field>
                <PrimaryButton type="submit" className="w-full" disabled={pending}>
                    {pending ? "Creating account…" : "Create account"}
                </PrimaryButton>
            </form>
        </AuthFrame>
    );
}
