import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsApi } from "../../api";
import { CATEGORIES, money } from "../../constants";
import { useCart } from "../../context/CartContext";
import ProductReviews from "../../components/ProductReviews";
import "./product.css";

export default function ProductPage() {
    const { id } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        productsApi.one(id).then(data => { if (active) setProduct(data); })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [id]);

    if (loading) return <p role="status">Φόρτωση προϊόντος...</p>;
    if (error) return <p className="alert error" role="alert">{error}</p>;
    if (!product) return null;
    const available = product.availability > 0;
    const maxQuantity = Math.min(10, product.availability);

    function add() {
        addItem(String(product._id), quantity);
        setMessage("Το προϊόν προστέθηκε στο καλάθι σου.");
    }

    return <section className="section-block">
        <div className="breadcrumbs"><Link to="/store">Κατάστημα</Link> / {CATEGORIES[product.category]} / {product.name}</div>
        <div className="panel product-detail-layout">
            <div className="product-detail-visual">
                {product.image ? <img src={product.image} alt={product.name} /> : <div className="product-image-placeholder">AUEB</div>}
            </div>
            <div className="product-detail-info">
                <span className="eyebrow">{CATEGORIES[product.category]}</span>
                <h1>{product.name}</h1>
                <p className="product-detail-price">{money(product.price)}</p>
                <p>{product.description || "Επίσημο προϊόν του AUEB Official Store."}</p>
                {product.notes && <p className="muted">{product.notes}</p>}
                <p className={available ? "stock-ok" : "stock-no"}>{available ? `Σε απόθεμα: ${product.availability} τεμάχια` : "Προσωρινά εξαντλημένο"}</p>
                {available && <div className="product-purchase">
                    <label>Ποσότητα
                        <input type="number" min="1" max={maxQuantity} step="1" value={quantity}
                            onChange={e => setQuantity(Math.max(1, Math.min(maxQuantity, Math.trunc(Number(e.target.value) || 1))))} />
                    </label>
                    <button className="btn" type="button" onClick={add}>Προσθήκη στο καλάθι</button>
                </div>}
                {message && <p className="alert success" role="status">{message} <Link className="text-link" to="/cart">Προβολή καλαθιού</Link></p>}
            </div>
        </div>

        <div className="panel product-reviews-panel">
            <ProductReviews productId={product._id} />
        </div>
    </section>;
}
