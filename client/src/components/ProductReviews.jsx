
import { useEffect, useState } from "react";
import { reviewsApi } from "../api";
import { useAuth } from "../context/AuthContext";

function ProductReviews({ productId }) {
    const { user, token } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState(0);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadReviews() {
        const data = await reviewsApi.all(productId);

        setReviews(data.reviews);
        setAverage(data.averageRating);
    }

    useEffect(() => {
        let active = true;

        async function load() {
            setLoading(true);
            setError("");
            setReviews([]);
            setAverage(0);

            try {
                const data = await reviewsApi.all(productId);

                if (active) {
                    setReviews(data.reviews);
                    setAverage(data.averageRating);
                }
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, [productId]);

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await reviewsApi.save(
                productId,
                Number(rating),
                comment,
                token
            );

            await loadReviews();

            setMessage("Η αξιολόγησή σου αποθηκεύτηκε!");
            setComment("");
            setRating(5);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="product-reviews">
            <h2>Αξιολογήσεις προϊόντος</h2>

            {loading ? (
                <p>Φόρτωση αξιολογήσεων...</p>
            ) : (
                <>
                    <p>
                        Μέση βαθμολογία:{" "}
                        <strong>
                            {reviews.length
                                ? average.toFixed(1)
                                : "Χωρίς αξιολογήσεις"}
                        </strong>
                        {reviews.length > 0 && " / 5"}
                    </p>

                    {reviews.map((review) => (
                        <article key={review._id}>
                            <p>
                                <strong>
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                </strong>
                            </p>

                            <p>
                                {review.user?.firstname}{" "}
                                {review.user?.lastname}
                            </p>

                            <p>{review.comment}</p>
                        </article>
                    ))}
                </>
            )}

            {user ? (
                <form onSubmit={handleSubmit}>
                    <h3>Γράψε αξιολόγηση</h3>

                    <label htmlFor="rating">
                        Βαθμολογία:
                    </label>

                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) =>
                            setRating(Number(e.target.value))
                        }
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                                {value} αστέρια
                            </option>
                        ))}
                    </select>

                    <label htmlFor="reviewComment">
                        Σχόλιο:
                    </label>

                    <textarea
                        id="reviewComment"
                        value={comment}
                        onChange={(e) =>
                            setComment(e.target.value)
                        }
                        maxLength={1000}
                        required
                    />

                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Αποθήκευση..."
                            : "Υποβολή αξιολόγησης"}
                    </button>
                </form>
            ) : (
                <p>
                    Συνδέσου για να αξιολογήσεις το προϊόν.
                </p>
            )}

            {error && <p role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}
        </section>
    );
}

export default ProductReviews;
