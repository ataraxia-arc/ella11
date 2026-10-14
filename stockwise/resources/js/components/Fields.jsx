export function Field({ label, error, children }) {
    return (
        <label className="block text-sm font-medium text-ink">
            {label}
            <div className="mt-1.5">{children}</div>
            {error ? <p className="mt-1 text-sm font-normal text-clay">{error}</p> : null}
        </label>
    );
}

export const inputClass =
    "min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base text-ink outline-none placeholder:text-muted/70 focus:border-pine";

export function PrimaryButton({ children, className = "", ...props }) {
    return (
        <button
            type="button"
            className={`inline-flex min-h-11 items-center justify-center rounded-lg bg-pine px-4 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function GhostButton({ children, className = "", ...props }) {
    return (
        <button
            type="button"
            className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:border-pine ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function Banner({ children }) {
    if (!children) return null;
    return (
        <p className="rounded-lg border border-clay/20 bg-clay-soft px-3 py-2 text-sm text-clay" role="alert">
            {children}
        </p>
    );
}
