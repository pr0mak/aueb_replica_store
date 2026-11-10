import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../../api";
import { money } from "../../constants";
import { useCart } from "../../context/CartContext";
import "./cart.css";

export default function CartPage() {
    const { items, changeQuantity, removeItem, clearCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        productsApi.all().then(data => { if (active) setProducts(data); })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const rows = useMemo(() => items.map(item => ({
        ...item, product: products.find(p => String(p._id) === item.productId)
    })), [items, products]);
    const total = rows.reduce((sum, row) => sum + (row.product?.price || 0) * row.quantity, 0);
    const invalidRows = rows.some(row => !row.product || row.quantity > row.product.availability);

    return <section className="section-block">
        <span className="eyebrow">ΟΙ ΑΓΟΡΕΣ ΣΟΥ</span><h1>Το καλάθι μου</h1>
        {loading ? <p role="status">Φόρτωση καλαθιού...</p> : error ?
            <p className="alert error" role="alert">{error}</p> : !rows.length ?
                <div className="empty-state"><h2>Το καλάθι σου είναι άδειο.</h2>
                    <p>Πρόσθεσε προϊόντα από το κατάστημά μας.</p><Link className="btn" to="/store">Πήγαινε στο κατάστημα</Link></div> :
                <div className="cart-layout">
                    <div className="panel cart-items">
                        {rows.map(row => <article className="cart-row" key={row.productId}>
                            <div className="cart-photo">
                                {row.product?.image ? <img src={row.product.image} alt={row.product.name} /> : <span>AUEB</span>}
                            </div>
                            <div className="cart-info">
                                <h2>{row.product ? <Link to={`/product/${row.productId}`}>{row.product.name}</Link> : "Μη διαθέσιμο προϊόν"}</h2>
                                <p className="muted">{row.product ? money(row.product.price) : "Το προϊόν έχει αφαιρεθεί από το κατάστημα."}</p>
                                {row.product && row.quantity > row.product.availability &&
                                    <p className="stock-no" role="alert">Διαθέσιμα μόνο {row.product.availability} τεμάχια. Μείωσε την ποσότητα ή αφαίρεσέ το.</p>}
                                <div className="cart-row-actions">
                                    <label>Ποσότητα
                                        <input type="number" min="1" max="10" step="1" value={row.quantity}
                                            onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 1 && n <= 10) changeQuantity(row.productId, n); }} />
                                    </label>
                                    <button className="link-button" type="button" onClick={() => removeItem(row.productId)}>Αφαίρεση</button>
                                </div>
                            </div>
                            <strong className="cart-line-price">{row.product ? money(row.product.price * row.quantity) : "—"}</strong>
                        </article>)}
                        <button type="button" className="link-button" onClick={clearCart}>Άδειασμα καλαθιού</button>
                    </div>
                    <aside className="panel summary-panel">
                        <span className="eyebrow">ΣΥΝΟΨΗ</span><h2>Η παραγγελία σου</h2>
                        <div className="summary-line"><span>Προϊόντα ({items.reduce((n, i) => n + i.quantity, 0)})</span><strong>{money(total)}</strong></div>
                        <p className="small-muted">Η τελική τιμή και το απόθεμα επιβεβαιώνονται από τον server κατά την παραγγελία.</p>
                        {invalidRows && <p className="alert error" role="alert">Διόρθωσε τα μη διαθέσιμα προϊόντα ή τις ποσότητες.</p>}
                        {invalidRows ? <button className="btn btn-full" disabled>Συνέχεια στην παραγγελία</button> :
                            <Link className="btn btn-full" to="/checkout">Συνέχεια στην παραγγελία</Link>}
                        <Link className="text-link" to="/store">Συνέχεια αγορών</Link>
                    </aside>
                </div>}
    </section>;
}
