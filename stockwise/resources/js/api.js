export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

function csrfToken() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
}

export async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    headers.set("X-Requested-With", "XMLHttpRequest");

    const hasBody = options.body !== undefined && options.body !== null;
    if (hasBody) {
        headers.set("Content-Type", "application/json");
        headers.set("X-XSRF-TOKEN", csrfToken());
    }

    const response = await fetch(path, {
        credentials: "include",
        ...options,
        headers,
        body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        const message = response.status === 419
            ? "Your session expired. Refresh the page and try again."
            : data?.message || "Something went wrong.";
        throw new ApiError(message, response.status, data?.errors || {});
    }

    return data;
}

export function peso(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(value) || 0);
}

export function when(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}
