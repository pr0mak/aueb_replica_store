async function request(path, { token, ...options } = {}) {

    const headers = { ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}), ...options.headers };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`/api${path}`, { ...options, headers });
    }
    catch {
        throw new Error("Αδυναμία σύνδεσης με τον server. Έλεγξε ότι εκτελείται στο port 5000.");
    }
    
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Σφάλμα API: ${response.status}`);
    }
    return data;
}

export const productsApi = {

    all: () => request("/products"),

    paginated: ({
        page = 1,
        category = "all",
        search = "",
        sort = "default"
    } = {}) => {

        const params = new URLSearchParams();

        params.set("page", String(page));

        if (category !== "all") {
            params.set("category", category);
        }

        if (search.trim()) {
            params.set("search", search.trim());
        }

        if (sort !== "default") {
            params.set("sort", sort);
        }

        return request(`/products?${params.toString()}`);
    },

    one: id => request(`/products/${encodeURIComponent(id)}`),
    create: (data, token) => request("/products", {
        method: "POST",
        token,
        body: JSON.stringify(data)
    }),
    update: (id, data, token) => request(`/products/${encodeURIComponent(id)}`, {
        method: "PUT",
        token,
        body: JSON.stringify(data)
    }),
    remove: (id, token) => request(`/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
        token
    })
};

export const authApi = {
    register: data => request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    login: data => request("/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
    })
};

export const ordersApi = {
    all: token => request("/orders", { token }),
    adminAll: token => request("/orders/admin", { token }),
    setStatus: (id, status, token) => request(`/orders/${encodeURIComponent(id)}/status`, {
        method: "PATCH", token, body: JSON.stringify({ status })
    }),
    checkout: (items, token) => request("/orders", {
        method: "POST",
        token,
        body: JSON.stringify({ items })
    })
};

export const reviewsApi = {
    all: (productId) =>
        request(`/products/${encodeURIComponent(productId)}/reviews`),

    save: (productId, rating, comment, token) =>
        request(`/products/${encodeURIComponent(productId)}/reviews`, {
            method: "POST",
            token,
            body: JSON.stringify({ rating, comment })
        })
};
