import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsApi } from "../../api";

const PRODUCTS_PER_PAGE = 10;

const categories = [
    {
        id: "clothes",
        title: "Ένδυση",
        heading: "Ένδυση AUEB",
        image: "/assets/endisi.png"
    },
    {
        id: "office_supplies",
        title: "Είδη Γραφείου",
        heading: "Είδη Γραφείου AUEB",
        image: "/assets/general_supplies.png"
    },
    {
        id: "accessories",
        title: "Αξεσουάρ",
        heading: "Αξεσουάρ AUEB",
        image: "/assets/general_acc.png"
    }
];

function StorePage() {
    const { category } = useParams();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const selectedCategory = categories.find(
        (item) => item.id === category
    );

    // load products from MongoDB
    useEffect(() => {
    if (!selectedCategory) return;

    let cancelled = false;

    async function loadProducts() {
        setLoading(true);
        setError("");

        try {
            const data = await productsApi.all();

            if (!cancelled) {
                setProducts(data);
            }
        } catch (err) {
            if (!cancelled) {
                setError(err.message);
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    }

    loadProducts();

    return () => {
        cancelled = true;
    };
}, [category]);

    useEffect(() => {
        setSearch("");
        setSort("default");
        setCurrentPage(1);
    }, [category]);

    if (!category) {
        return (
            <main>
                <h1>Διαλέξτε κατηγορία</h1>

                <article className="categories-article">
                    <div className="categories-grid">
                        {categories.map((item) => (
                            <Link
                                key={item.id}
                                to={`/store/${item.id}`}
                                className="category-card"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                />

                                <div className="category-card-body">
                                    <h2>{item.title}</h2>

                                    <span className="category-card-cta">
                                        Δείτε τα προϊόντα →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </article>
            </main>
        );
    }

    if (!selectedCategory) {
        return (
            <main>
                <h1>Η κατηγορία δεν βρέθηκε.</h1>
                <Link to="/store">Επιστροφή στο κατάστημα</Link>
            </main>
        );
    }

    // filtering 
    let filteredProducts = products.filter((product) =>
        product.category === category &&
        String(product.name || "")
            .toLocaleLowerCase("el")
            .includes(search.trim().toLocaleLowerCase("el"))
    );

    // shorting
    filteredProducts = [...filteredProducts];

    switch (sort) {
        case "name-asc":
            filteredProducts.sort((a, b) =>
                a.name.localeCompare(b.name, "el")
            );
            break;

        case "name-desc":
            filteredProducts.sort((a, b) =>
                b.name.localeCompare(a.name, "el")
            );
            break;

        case "price-asc":
            filteredProducts.sort((a, b) =>
                Number(a.price) - Number(b.price)
            );
            break;

        case "price-desc":
            filteredProducts.sort((a, b) =>
                Number(b.price) - Number(a.price)
            );
            break;
    }

    // Paging
    const totalPages = Math.ceil(
        filteredProducts.length / PRODUCTS_PER_PAGE
    );

    const safePage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;

    const pageProducts = filteredProducts.slice(
        startIndex,
        startIndex + PRODUCTS_PER_PAGE
    );

    const formatPrice = (price) =>
        `${Number(price).toLocaleString("el-GR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} €`;

    return (
        <main>
            <h1>{selectedCategory.heading}</h1>

            <article>
                <Link to="/store">
                    ← Όλες οι κατηγορίες
                </Link>

                <div className="product-controls">
                    <div className="search-box">
                        <label htmlFor="searchInput">
                            Αναζήτηση:
                        </label>

                        <input
                            type="text"
                            id="searchInput"
                            placeholder="Αναζητήστε προϊόν..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="sort-box">
                        <label htmlFor="sortSelect">
                            Ταξινόμηση:
                        </label>

                        <select
                            id="sortSelect"
                            value={sort}
                            onChange={(event) => {
                                setSort(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="default">
                                Προεπιλογή
                            </option>
                            <option value="name-asc">
                                Όνομα (Α-Ω)
                            </option>
                            <option value="name-desc">
                                Όνομα (Ω-Α)
                            </option>
                            <option value="price-asc">
                                Τιμή (Αύξουσα)
                            </option>
                            <option value="price-desc">
                                Τιμή (Φθίνουσα)
                            </option>
                        </select>
                    </div>
                </div>

                {loading && <p>Φόρτωση προϊόντων...</p>}

                {error && (
                    <p role="alert">
                        Σφάλμα: {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        <table className="table-products">
                            <thead>
                                <tr>
                                    <th scope="col">Εικόνα</th>
                                    <th scope="col">Προϊόν</th>
                                    <th scope="col">
                                        Τιμή ανά τεμάχιο
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pageProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="3">
                                            Δεν βρέθηκαν προϊόντα.
                                        </td>
                                    </tr>
                                ) : (
                                    pageProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <Link
                                                    to={`/products/${product._id}`}
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                    />
                                                    <span>
                                                        {product.name}
                                                    </span>
                                                </Link>
                                            </td>

                                            <td className="product-name">
                                                <Link
                                                    to={`/products/${product._id}`}
                                                >
                                                    {product.name}
                                                </Link>
                                            </td>

                                            <td className="product-price">
                                                {formatPrice(product.price)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <nav
                                className="pagination"
                                aria-label="Σελιδοποίηση προϊόντων"
                            >
                                <button
                                    type="button"
                                    disabled={safePage === 1}
                                    onClick={() =>
                                        setCurrentPage(safePage - 1)
                                    }
                                >
                                    ‹ Προηγούμενη
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            safePage === page
                                                ? "active"
                                                : ""
                                        }
                                        aria-current={
                                            safePage === page
                                                ? "page"
                                                : undefined
                                        }
                                        onClick={() =>
                                            setCurrentPage(page)
                                        }
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={safePage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(safePage + 1)
                                    }
                                >
                                    Επόμενη ›
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </article>

            <aside>
                <div className="flipping-card">
                    <div className="offer">
                        <div className="image">
                            <img
                                src="/assets/CAMPUS_LOOK_BUNDLE.png"
                                alt="CAMPUS LOOK BUNDLE"
                            />
                        </div>

                        <div className="price">
                            <span className="old_price">
                                15 €
                            </span>{" "}
                            10 €
                        </div>

                        <h3>CAMPUS LOOK BUNDLE</h3>
                        <p>Μοναδική προσφορά για φοιτητές</p>

                        <Link to="/store">
                            Δείτε τα προϊόντα
                        </Link>
                    </div>

                    <div className="front">
                        <div className="item">
                            <span>Προσφορά ημέρας</span>
                        </div>
                    </div>
                </div>
            </aside>
        </main>
    );
}

export default StorePage;