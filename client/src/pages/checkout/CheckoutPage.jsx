import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ordersApi, productsApi } from "../../api";
import { money } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./checkout.css";

export default function CheckoutPage() {
    const { user, token } = useAuth();
    const { items, clearCart } = useCart();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        productsApi.all().then(data => { if (active) setProducts(data); })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const rows = useMemo(() => items.map(item => ({ ...item,
        product: products.find(p => String(p._id) === item.productId)
    })), [items, products]);
    const total = rows.reduce((sum, row) => sum + (row.product?.price || 0) * row.quantity, 0);
    const valid = items.length > 0 && rows.every(row => row.product && row.quantity <= row.product.availability);

    async function submit(event) {
        event.preventDefault();
        if (!valid || submitting) return;
        setSubmitting(true);
        setError("");
        try {
            //stelnoume mono id kai posothta kai o server upologizei tis pragmatikes times
            await ordersApi.checkout(items.map(({ productId, quantity }) => ({ productId, quantity })), token);
            clearCart();
            navigate("/orders", { replace: true, state: { message: "Η παραγγελία σου καταχωρίστηκε με επιτυχία!" } });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return <section className="section-block">
        <span className="eyebrow">ΤΕΛΙΚΟ ΒΗΜΑ</span><h1>Ολοκλήρωση παραγγελίας</h1>
        {loading ? <p role="status">Φόρτωση...</p> : error && !products.length ?
            <p className="alert error" role="alert">{error}</p> : !items.length ?
                <div className="empty-state"><h2>Το καλάθι σου είναι άδειο.</h2><Link className="btn" to="/store">Κατάστημα</Link></div> :
                <div className="checkout-layout">
                    <form className="panel checkout-form" onSubmit={submit}>
                        <h2>Επιβεβαίωση παραγγελίας</h2>
                        <p>Συνδεδεμένος λογαριασμός: <strong>{user.firstname} {user.lastname}</strong></p>
                        <p className="muted">{user.email}</p>
                        <p>Η παραγγελία θα καταχωριστεί στον λογαριασμό σου. Δεν πραγματοποιείται ηλεκτρονική πληρωμή.</p>
                        {error && <p className="alert error" role="alert">{error}</p>}
                        {!valid && <p className="alert error" role="alert">Κάποια προϊόντα δεν είναι πλέον διαθέσιμα στην ποσότητα που επέλεξες. <Link to="/cart">Διόρθωσε το καλάθι</Link>.</p>}
                        <button type="submit" className="btn btn-full" disabled={!valid || submitting}>
                            {submitting ? "Καταχώριση..." : "Επιβεβαίωση παραγγελίας"}
                        </button>
                    </form>
                    <aside className="panel summary-panel"><h2>Σύνοψη</h2>
                        {rows.map(row => <div className="summary-line" key={row.productId}>
                            <span>{row.product?.name || "Μη διαθέσιμο προϊόν"} × {row.quantity}</span>
                            <strong>{row.product ? money(row.product.price * row.quantity) : "—"}</strong>
                        </div>)}
                        <div className="summary-line"><strong>Σύνολο</strong><strong>{money(total)}</strong></div>
                        <p className="small-muted">Το τελικό σύνολο υπολογίζεται ξανά στη βάση δεδομένων.</p>
                    </aside>
                </div>}
    </section>;
}
