import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CATEGORIES, money } from "../constants";
import "./ProductCard.css";

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const available = product.availability > 0;

    return (
        <article className="product-card">
            <Link to={`/product/${product._id}`} className="product-card-image" aria-label={`Προβολή: ${product.name}`}>
                {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> :
                    <span className="product-image-placeholder"><span>AUEB</span><small>Official Store</small></span>}
            </Link>
            
            <div className="product-card-body">
                <span className="eyebrow">{CATEGORIES[product.category] || product.category}</span>
               
                <h3><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
               
                <p className="product-card-description">{product.description || "Επίσημο προϊόν του AUEB Official Store."}</p>
               
                <div className="product-card-bottom">
                    <strong className="product-card-price">{money(product.price)}</strong>
                    <span className={available ? "stock-ok" : "stock-no"}>
                        {available ? `Διαθέσιμα: ${product.availability}` : "Εξαντλήθηκε"}
                    </span>
                </div>
               
                <div className="product-card-actions">
                    <Link to={`/product/${product._id}`} className="btn btn-outline">Λεπτομέρειες</Link>
                    <button type="button" className="btn" disabled={!available}
                        onClick={() => addItem(String(product._id), 1)}>
                        Προσθήκη +
                    </button>
               
                </div>
            </div>
        </article>
    );
}
