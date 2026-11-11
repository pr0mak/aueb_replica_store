
import { useEffect, useState } from "react";
import {
    Link,
    useParams,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import { productsApi } from "../../api";
import { CATEGORIES } from "../../constants";
import ProductCard from "../../components/ProductCard";

import "./store.css";

export default function StorePage() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("default");

    //stoixeia selidopoihshs
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    //kathgoria apo to URL
    const { category: categoryParam } = useParams();
    const category = categoryParam || "all";

    const navigate = useNavigate();

    //arithmos selidas apo to URL
    const [searchParams, setSearchParams] = useSearchParams();

    const pageParam = Number(searchParams.get("page") || "1");

    const page =
        Number.isSafeInteger(pageParam) && pageParam > 0
            ? pageParam
            : 1;

    //fortwsh proiontwn ana selida apo ton server
    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

        productsApi.paginated({
            page,
            category,
            search,
            sort
        })
            .then((data) => {
                if (!active) {
                    return;
                }

                //an h selida den uparxei, pame sthn prwth
                if (page > data.totalPages) {
                    setSearchParams({}, { replace: true });
                    return;
                }

                setProducts(data.products);
                setTotalPages(data.totalPages);
                setTotalProducts(data.totalProducts);
            })
            .catch((err) => {
                if (active) {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };

    }, [page, category, search, sort, setSearchParams]);

    //allagh kathgorias mesw URL
    function handleCategoryChange(event) {
        const selectedCategory = event.target.value;

        if (selectedCategory === "all") {
            navigate("/store");
        } else {
            navigate(`/store/${selectedCategory}`);
        }
    }

    //allagh anazhthshs
    function handleSearchChange(event) {
        setSearch(event.target.value);

        //epistrofh sthn prwth selida
        setSearchParams({});
    }

    //allagh taxinomhshs
    function handleSortChange(event) {
        setSort(event.target.value);

        //epistrofh sthn prwth selida
        setSearchParams({});
    }

    //allagh selidas
    function changePage(newPage) {

        if (newPage < 1 || newPage > totalPages) {
            return;
        }

        if (newPage === 1) {
            setSearchParams({});
        } else {
            setSearchParams({
                page: String(newPage)
            });
        }
    }

    //katharismos filtrwn
    function clearFilters() {
        setSearch("");
        setSort("default");
        navigate("/store");
    }

    //arithmoi selidwn
    const pageNumbers = Array.from(
        { length: totalPages },
        (_, i) => i + 1
    );

    return (
        <section className="section-block">

            <div className="section-heading">
                <div>
                    <span className="eyebrow">
                        AUEB OFFICIAL STORE
                    </span>

                    <h1>Κατάστημα</h1>

                    <p className="muted">
                        Ανακάλυψε τα προϊόντα μας.
                    </p>
                </div>

                <Link className="text-link" to="/categories">
                    Δες όλες τις κατηγορίες
                </Link>
            </div>

            <div className="filter-row panel store-filters">

                {/* anazhthsh */}
                <label>
                    Αναζήτηση προϊόντος

                    <input
                        type="search"
                        placeholder="Π.χ. μπλουζάκι"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </label>

                {/* category */}
                <label>
                    Κατηγορία

                    <select
                        value={category}
                        onChange={handleCategoryChange}
                    >
                        <option value="all">
                            Όλες οι κατηγορίες
                        </option>

                        {Object.entries(CATEGORIES).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                {/* taxinomhsh */}
                <label>
                    Ταξινόμηση

                    <select
                        value={sort}
                        onChange={handleSortChange}
                    >
                        <option value="default">
                            Προεπιλογή
                        </option>

                        <option value="price-asc">
                            Τιμή: αύξουσα
                        </option>

                        <option value="price-desc">
                            Τιμή: φθίνουσα
                        </option>
                    </select>
                </label>

            </div>

            {loading ? (
                <p role="status">
                    Φόρτωση προϊόντων...
                </p>
            ) : error ? (
                <p className="alert error" role="alert">
                    {error}
                </p>
            ) : (
                <>
                    <p className="muted" role="status">
                        {totalProducts} προϊόντα συνολικά
                    </p>

                    {products.length > 0 ? (
                        <>
                            {/* emfanisi proiontwn */}
                            <div className="product-grid">
                                {products.map((p) => (
                                    <ProductCard
                                        key={p._id}
                                        product={p}
                                    />
                                ))}
                            </div>

                            {/* selidopoihsh */}
                            {totalPages > 1 && (
                                <nav
                                    className="pagination"
                                    aria-label="Σελιδοποίηση προϊόντων"
                                >

                                    <button
                                        type="button"
                                        className="pagination-btn"
                                        disabled={page === 1}
                                        onClick={() => changePage(page - 1)}
                                    >
                                        Προηγούμενη
                                    </button>

                                    {pageNumbers.map((number) => (
                                        <button
                                            key={number}
                                            type="button"
                                            className={
                                                page === number
                                                    ? "pagination-btn active"
                                                    : "pagination-btn"
                                            }
                                            aria-current={
                                                page === number
                                                    ? "page"
                                                    : undefined
                                            }
                                            onClick={() => changePage(number)}
                                        >
                                            {number}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="pagination-btn"
                                        disabled={page === totalPages}
                                        onClick={() => changePage(page + 1)}
                                    >
                                        Επόμενη
                                    </button>

                                </nav>
                            )}

                            {/* plhroforia selidas */}
                            {totalPages > 1 && (
                                <p className="pagination-info">
                                    Σελίδα {page} από {totalPages}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">

                            <h2>Δεν βρέθηκαν προϊόντα</h2>

                            <p>
                                Δοκίμασε άλλη αναζήτηση ή κατηγορία.
                            </p>

                            <button
                                className="btn"
                                type="button"
                                onClick={clearFilters}
                            >
                                Καθαρισμός φίλτρων
                            </button>

                        </div>
                    )}
                </>
            )}

        </section>
    );
}
