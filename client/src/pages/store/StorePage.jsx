import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

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

    const { category: categoryParam } = useParams();
    const navigate = useNavigate();

    const category = categoryParam || "all";

    //fortwsh products apo ton server
    useEffect(() => {
        let active = true;

        productsApi.all()
            .then((data) => {
                if (active) {
                    setProducts(data);
                }
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
    }, []);

    //filtrarisma kai tajinomhsh proiontwn
    const filtered = useMemo(() => {

        const query = search.trim().toLocaleLowerCase("el-GR");

        const result = products.filter((p) => {
            const matchesCategory =
                category === "all" || p.category === category;

            const matchesSearch =
                p.name.toLocaleLowerCase("el-GR").includes(query);

            return matchesCategory && matchesSearch;
        });

        if (sort === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        }

        if (sort === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;

    }, [products, category, search, sort]);

    //allagh kathgorias mesw url
    function handleCategoryChange(event) {
        const selectedCategory = event.target.value;

        if (selectedCategory === "all") {
            navigate("/store");
        } else {
            navigate(`/store/${selectedCategory}`);
        }
    }

    //katharismos filtrwn
    function clearFilters() {
        setSearch("");
        setSort("default");
        navigate("/store");
    }

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
                        onChange={(e) => setSearch(e.target.value)}
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

                {/* tajinomhsh */}
                <label>
                    Ταξινόμηση

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
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
                        {filtered.length} προϊόντα
                    </p>

                    {filtered.length > 0 ? (
                        <div className="product-grid">
                            {filtered.map((p) => (
                                <ProductCard
                                    key={p._id}
                                    product={p}
                                />
                            ))}
                        </div>
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