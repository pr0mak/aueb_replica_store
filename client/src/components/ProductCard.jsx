
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CATEGORIES, money } from "../constants";
import "./ProductCard.css";

export default function ProductCard({ product }) {
    const { addItem } = useCart();

    const available = product.availability > 0;

    // Στοιχεία αξιολογήσεων από το GET /api/products
    const averageRating = Number(product.averageRating) || 0;
    const reviewCount = Number(product.reviewCount) || 0;

    // Στρογγυλοποίηση για την εμφάνιση των αστεριών
    const filledStars = Math.min(
        5,
        Math.max(0, Math.round(averageRating))
    );

    return (
        <article className="product-card">
            <Link
                to={`/product/${product._id}`}
                className="product-card-image"
                aria-label={`Προβολή: ${product.name}`}
            >
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                    />
                ) : (
                    <span className="product-image-placeholder">
                        <span>AUEB</span>
                        <small>Official Store</small>
                    </span>
                )}
            </Link>

            <div className="product-card-body">
                <span className="eyebrow">
                    {CATEGORIES[product.category] || product.category}
                </span>

                <h3>
                    <Link to={`/product/${product._id}`}>
                        {product.name}
                    </Link>
                </h3>

                {/* Μέσος όρος αξιολογήσεων */}
                <div className="product-rating">
                    {reviewCount > 0 ? (
                        <>
                            <span
                                className="rating-stars"
                                aria-hidden="true"
                            >
                                {"★".repeat(filledStars)}
                                {"☆".repeat(5 - filledStars)}
                            </span>

                            <span className="rating-value">
                                {averageRating.toLocaleString("el-GR", {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1
                                })} / 5
                            </span>

                            <span className="rating-count">
                                ({reviewCount}{" "}
                                {reviewCount === 1
                                    ? "αξιολόγηση"
                                    : "αξιολογήσεις"})
                            </span>
                        </>
                    ) : (
                        <span className="rating-count">
                            ☆☆☆☆☆ Χωρίς αξιολογήσεις
                        </span>
                    )}
                </div>

                <p className="product-card-description">
                    {product.description ||
                        "Επίσημο προϊόν του AUEB Official Store."}
                </p>

                <div className="product-card-bottom">
                    <strong className="product-card-price">
                        {money(product.price)}
                    </strong>

                    <span className={available ? "stock-ok" : "stock-no"}>
                        {available
                            ? `Διαθέσιμα: ${product.availability}`
                            : "Εξαντλήθηκε"}
                    </span>
                </div>

                <div className="product-card-actions">
                    <Link
                        to={`/product/${product._id}`}
                        className="btn btn-outline"
                    >
                        Λεπτομέρειες
                    </Link>

                    <button
                        type="button"
                        className="btn"
                        disabled={!available}
                        onClick={() =>
                            addItem(String(product._id), 1)
                        }
                    >
                        Προσθήκη +
                    </button>
                </div>
            </div>
        </article>
    );
}
